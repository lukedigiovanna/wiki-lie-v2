import { Room } from "../models/room.model";
import { getIO } from "../socket";
import { v4 as uuidv4} from "uuid";
import { Player } from "../models/player.model";
import { HttpException } from "../models/exception.model";

// contains all necessary functions to handle the games.
class GameService {
    private rooms: Map<string, Room> = new Map<string, Room>();

    constructor() {}

    private updateRoom(uuid: string, update: (room: Room) => Room) {
        const room = this.rooms.get(uuid);
        if (room) {
            const newRoom = update(room);
            // now update certain fields in the new room that need to be updated.
            // if there are no players in the room, delete it.
            if (newRoom.players.length === 0) {
                this.rooms.delete(uuid);
                return;
            }
            // if there is only one player in the room, make them the admin.
            if (newRoom.players.length === 1) {
                newRoom.players[0].isAdmin = true;
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
            category: "all",
            isInRound: false,
            lastStartTime: 0,
            players: [],
        }
        
        this.rooms.set(uuid, room);
        
        // return the UUID of the room so the creating player can join the room.
        return { uuid };
    }

    checkJoinStatus(ip: string): { uuid: string | null} {
        // returns the uuid of the room the player is in, or null if they are not in a room.
        for (const [uuid, room] of this.rooms) {
            for (const player of room.players) {
                if (player.ipAddress === ip) {
                    return { uuid };
                }
            }
        }
        return { uuid: null };
    }

    getRoom(uuid: string): Room {
        // returns the room with the given uuid.
        const room = this.rooms.get(uuid);
        if (!room) {
            throw new HttpException('Room does not exist', 404);
        }
        return room;
    }

    joinRoom(ip: string, roomUUID: string) {
        // adds the player to the room.
        const room = this.rooms.get(roomUUID);
        if (!room) {
            throw new HttpException('Room does not exist!', 404);
        }
        // check existing connection
        // TODO: check if the player is already in the room via their IP
        /* LEFT OUT TEMPORARILY DURING DEVELOPMENT
        */
        // const existingPlayer = room.players.find(p => p.ipAddress === ip);
        // if (existingPlayer) {
        //     if (existingPlayer.isConnected) {
        //         throw new HttpException('You are already in the room!', 400);
        //     }
        //     return existingPlayer;
        // }

        if (room.isInRound) {
            throw new HttpException('Game is already in progress!', 400);
        }

        const player: Player = {
            uuid: uuidv4(),
            roomUUID,
            username: "Guest" + Math.floor(Math.random() * 89999 + 10000),
            ipAddress: ip,
            isAdmin: false,
            chosenArticle: null,
            isConnected: true,
            points: 0
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
            player = room.players.find(p => p.uuid === playerUUID);
            if (!player) {
                throw new HttpException('Player does not exist', 404);
            }
            Object.assign(player, updateBody);
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

    getRooms() {
        // returns a list of all rooms.
        const rooms = Array.from(this.rooms.values());
        return {rooms, numberOfRooms: this.rooms.size};
    }
}

export default new GameService();