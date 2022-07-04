// Keeps track of main game logic and handling rooms

import { HttpException, Injectable } from '@nestjs/common';
import { Player } from 'src/models/player.model';
import { v4 as uuidv4 } from 'uuid';
import { Room } from '../models/room.model';
import { getIO } from '../socket';

@Injectable()
export class GameService {
    private rooms: Map<string, Room> = new Map<string, Room>();

    constructor() {}

    private updateRoom(uuid: string, update: (room: Room) => Room) {
        const room = this.rooms.get(uuid);
        if (room) {
            this.rooms.set(uuid, update(room));
            // update through websocket.
            getIO().to(uuid).emit('room-update', this.rooms.get(uuid));
        }
        else {
            throw new HttpException('Room does not exist', 404);
        }
    }

    createRoom() {
        // construct a new room
        const uuid = uuidv4();

        const room: Room = {
            uuid,
            guesserIndex: 0,
            players: [],
        }
        
        this.rooms.set(uuid, room);
        
        // return the UUID of the room so the creating player can join the room.
        return { uuid };
    }

    checkJoinStatus(ip: string): { uuid: string} {
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
            throw new HttpException('Room does not exist', 404);
        }
        // check existing connection
        // TODO: check if the player is already in the room via their IP
        /* LEFT OUT TEMPORARILY DURING DEVELOPMENT
        */
        const player: Player = {
            uuid: uuidv4(),
            username: "Guest" + Math.floor(Math.random() * 89999 + 10000),
            ipAddress: ip,
            isAdmin: false,
            isReady: false,
            chosenArticle: null,
            points: 0
        }

        this.updateRoom(roomUUID, (room: Room) => {
            room.players.push(player);
            return room;
        });

        return player;
    }

    getRooms() {
        // returns a list of all rooms.
        const rooms = Array.from(this.rooms.values());
        return {rooms, numberOfRooms: this.rooms.size};
    }
}


