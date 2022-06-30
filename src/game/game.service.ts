// Keeps track of main game logic and handling rooms

import { HttpException, Injectable } from '@nestjs/common';
import { Player } from 'src/models/player.model';
import { v4 as uuidv4 } from 'uuid';
import { Room } from '../models/room.model';

@Injectable()
export class GameService {
    private rooms: Map<string, Room> = new Map<string, Room>();

    constructor() {}

    createRoom() {
        // construct a new room
        const uuid = uuidv4();

        const room: Room = {
            uuid,
            players: []
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

    joinRoom(ip: string, roomUUID: string) {
        // adds the player to the room.
        const room = this.rooms.get(roomUUID);
        if (!room) {
            throw new HttpException('Room does not exist', 404);
        }
        const player: Player = {
            uuid: uuidv4(),
            username: "Guest" + Math.random(),
            ipAddress: ip
        }
        room.players.push(player);
    }
}


