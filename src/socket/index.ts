import { Server, Socket } from 'socket.io';
import game from '../game/game.service';
import { Player } from '../models/player.model';

let io: Server | null = null;

export const initSocket = (server: any) => {
    io = new Server(server);    

    io.on('connection', (socket: Socket) => {
        let roomUUID: string | null = null;
        let playerUUID: string | null = null;

        socket.on('disconnect', () => {
            if (roomUUID && playerUUID) {
                game.updatePlayer(roomUUID, playerUUID, {isConnected: false} as Player);
            }
        });

        socket.on('player-join', (data: {roomUUID: string, playerUUID: string}) => {
            socket.join(data.roomUUID);
            roomUUID = data.roomUUID;
            playerUUID = data.playerUUID;
            game.updatePlayer(roomUUID, playerUUID, {isConnected: true} as Player);
        })
    });
}

export const getIO = () => {
    if (!io) {
        throw new Error("Socket not initialized");
    }
    return io;
}