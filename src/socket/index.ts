import { Server, Socket } from 'socket.io';

let io = null;

export const initSocket = (server: any) => {
    io = new Server(server);    

    io.on('connection', (socket: Socket) => {
        let roomUUID: string | null = null;
        let playerUUID: string | null = null;

        socket.on('disconnect', () => {
            console.log(roomUUID, playerUUID);
            io.to(roomUUID).emit('player-disconnect', {uuid: playerUUID});
        });

        socket.on('player-join', (data: {roomUUID: string, playerUUID}) => {
            socket.join(data.roomUUID);
            roomUUID = data.roomUUID;
            playerUUID = data.playerUUID;
        })
    });
}

export const getIO = () => {
    if (!io) {
        throw new Error("Socket not initialized");
    }
    return io;
}