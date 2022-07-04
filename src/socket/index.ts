import { Server, Socket } from 'socket.io';

let io = null;

export const initSocket = (server: any) => {
    io = new Server(server);    

    io.on('connection', (socket: Socket) => {
        console.log('a user connected');
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

        socket.on('player-join', (data: {roomUUID: string}) => {
            const { roomUUID } = data;
            socket.join(roomUUID);
        })
    });

    console.log("initiated socket");
}

export const getIO = () => {
    if (!io) {
        throw new Error("Socket not initialized");
    }
    return io;
}