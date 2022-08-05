import { Room } from "../models/room.model";
import { getIO } from "../socket";
import { v4 as uuidv4} from "uuid";
import { Player } from "../models/player.model";
import { HttpException } from "../models/exception.model";
import { RoundOver } from "../models/roundover.model";
import { collectPagesInCategory } from "../utils/wikipedia";

// contains all necessary functions to handle the games.
class GameService {
    private rooms: Map<string, Room> = new Map<string, Room>();

    // let's also store collections of discovered categories (ones that are currently being used)
    private categories: Map<string, string[]> = new Map<string, string[]>();

    constructor() {}

    private updateRoom(uuid: string, update: (room: Room) => Room) {
        const room = this.rooms.get(uuid);
        if (room) {
            const newRoom = update(room);
            // now update certain fields in the new room that need to be updated.
            // if there are no connected players in the room, delete it.

            const numConnectedPlayers = newRoom.players.filter(p => p.isConnected).length;

            let shouldDelete: boolean = newRoom.players.length === 0;
            if (shouldDelete) {
                this.rooms.delete(uuid);
                return;
            }

            // check if we need to collect categories
            if (newRoom.category !== "All articles" && !this.categories.has(newRoom.category)) {
                collectPagesInCategory(`Category:${newRoom.category}`).then(pages => {
                    this.categories.set(newRoom.category, pages);
                });
            }

            // if there is only one player in the room, make them the admin.
            if (numConnectedPlayers === 1) {
                const p = newRoom.players.find(p => p.isConnected);
                if (p) p.isAdmin = true;
            }
            // if the guesser index is out of bounds, set it to the first player.
            newRoom.guesserIndex %= newRoom.players.length;
            this.rooms.set(uuid, newRoom);
            // update through websocket.
            getIO().to(uuid).emit('room-update', this.rooms.get(uuid));
        }
        // if the room does not exist, it will not matter because no players will be connected.
        // so, we can do nothing.
    }

    createRoom() {
        // construct a new room
        const uuid = uuidv4();

        const room: Room = {
            uuid,
            guesserIndex: 0,
            articleIndex: 0,
            category: "All articles",
            isInRound: false,
            lastStartTime: 0,
            players: [],
            roundNumber: 1
        }
        
        this.rooms.set(uuid, room);
        
        // return the UUID of the room so the creating player can join the room.
        return { uuid };
    }

    getRoom(uuid: string): Room {
        // returns the room with the given uuid.
        const room = this.rooms.get(uuid);
        if (!room) {
            throw new HttpException('Room does not exist', 404);
        }
        return room;
    }

    joinRoom(sessionID: string | undefined, roomUUID: string) {
        // adds the player to the room.
        const room = this.rooms.get(roomUUID);
        if (!room) {
            throw new HttpException('Room does not exist!', 404);
        }
        if (!sessionID) {
            // generate a random session id
            sessionID = uuidv4();
        }
        // check existing connection
        const existingPlayer = room.players.find(p => p.sessionID === sessionID);
        if (existingPlayer) {
            if (existingPlayer.isConnected) {
                throw new HttpException('You are already in the room!', 400);
            }
            this.updatePlayer(roomUUID, existingPlayer.uuid, { isConnected: true } as Player);
            return existingPlayer;
        }

        if (room.isInRound) {
            throw new HttpException('Game is already in progress!', 400);
        }

        const player: Player = {
            uuid: uuidv4(),
            roomUUID,
            username: "Guest" + Math.floor(Math.random() * 89999 + 10000),
            sessionID,
            isAdmin: false,
            chosenArticle: null,
            isConnected: true,
            points: 0,
            isNew: true
        }

        this.updateRoom(roomUUID, (room: Room) => {
            room.players.push(player);
            return room;
        });

        return player;
    }

    updatePlayer(roomUUID: string, playerUUID: string, updateBody: Player) {
        // updates the player's info.
        let player;
        this.updateRoom(roomUUID, (room: Room) => {
            let index = room.players.findIndex(p => p.uuid === playerUUID);

            if (index !== -1) {
                player = room.players[index];
                Object.assign(player, updateBody);
                // if the player just disconnected and they are admin, move the admin.
                if (!player.isConnected && player.isAdmin) {
                    player.isAdmin = false;
                    // find next available player.
                    for (let i = 1; i < room.players.length; i++) {
                        let nextIndex = (i + index) % room.players.length;
                        if (room.players[nextIndex].isConnected) {
                            room.players[nextIndex].isAdmin = true;
                            break;
                        }
                    }
                }
            }
            return room;
        });
        return player;
    }

    deletePlayer(roomUUID: string, playerUUID: string) {
        // removes the player from the room.
        this.updateRoom(roomUUID, (room: Room) => {
            const playerIndex = room.players.findIndex(p => p.uuid === playerUUID);
            if (playerIndex === -1) {
                throw new HttpException('Player does not exist', 404);
            }
            if (room.guesserIndex > playerIndex) {
                room.guesserIndex--;
            }
            room.players.splice(playerIndex, 1);
            return room;
        });
    }

    patchRoom(roomUUID: string, updateBody: Room) {
        // updates the room.
        this.updateRoom(roomUUID, (room: Room) => {
            Object.assign(room, updateBody);
            return room;
        });
    }

    startGame(roomUUID: string) {
        // check if there are enough players ready to start the game.
        const room = this.rooms.get(roomUUID);
        if (!room) {
            throw new HttpException("Room does not exist", 404);
        }
        const readyPlayers = room.players.filter((p, index) => p.chosenArticle !== null && index !== room.guesserIndex).length;
        if (readyPlayers !== room.players.length - 1) {
            throw new HttpException("Not enough players ready to start the game", 400);
        }
        this.updateRoom(roomUUID, (room: Room) => {
            room.isInRound = true;
            room.lastStartTime = Date.now();
            // choose a random index for the chosen article that is not the guesser index.
            do {
                room.articleIndex = Math.floor(Math.random() * room.players.length);
            }
            while (room.articleIndex === room.guesserIndex);
            return room;
        });
    }

    makeGuess(roomUUID: string, playerUUID: string) {
        this.updateRoom(roomUUID, (room: Room) => {
            const guesser = room.players[room.guesserIndex];
            const guessedIndex = room.players.findIndex(p => p.uuid === playerUUID);
            if (guessedIndex === -1) {
                throw new HttpException("Player does not exist", 404);
            }

            let wasCorrect;
            // if the guesser guessed the wrong person.
            if (guessedIndex !== room.articleIndex) {
                // the guessed player fooled the guesser, so they get 2 points.
                room.players[guessedIndex].points += 2;
                wasCorrect = false;
            }
            else { // the guesser guessed the correct person.
                // both players get a point. 1 for being good at being truthful and 1 for spotting the truth.
                guesser.points++;
                room.players[guessedIndex].points++;
                wasCorrect = true;
            }
            
            // construct a round over object to send to the players
            const roundOver: RoundOver = {
                guesserUsername: guesser.username,
                guessedUsername: room.players[guessedIndex].username,
                truthTeller: room.players[room.articleIndex].username,
                wasCorrect,
                roundNumber: room.roundNumber,
                articleTitle: room.players[room.articleIndex].chosenArticle as string,
            }

            // now increment the round.
            // so, the person who had the article should now have to choose a new one
            room.players[room.articleIndex].chosenArticle = null;
            room.isInRound = false; // not in round anymore
            room.guesserIndex = (room.guesserIndex + 1) % room.players.length; // move the guesser to the next player.

            room.roundNumber++;

            getIO().to(roomUUID).emit('round-over', roundOver);

            return room;
        });

    }

    getRooms() {
        // returns a list of all rooms.
        const rooms = Array.from(this.rooms.values());
        return {rooms, numberOfRooms: this.rooms.size};
    }

    randomArticle(category: string) {
        // returns a random article from the given category.
        const articles = this.categories.get(category);
        if (!articles) {
            throw new HttpException("Category does not exist", 404);
        }
        return articles[Math.floor(Math.random() * articles.length)];
    }
}

export default new GameService();