import { Request, Response } from 'express';
import game from './game.service';
import { Endpoint } from '../utils';

class GameController {
    @Endpoint
    createGame(req: Request, res: Response) {
        return game.createRoom();
    }

    @Endpoint
    joinRoom(req: Request, res: Response) {
        console.log("NEW JOIN REQUEST");
        console.log('x-forwarded-for', req.headers['x-forwarded-for']);
        console.log('remoteAddress', req.socket.remoteAddress);
        console.log('localAddress', req.socket.localAddress);
        console.log('ip', req.ip);
        console.log('ips', req.ips);
        console.log('hostname', req.hostname)
        console.log('localport', req.socket.localPort);
        console.log('remoteport', req.socket.remotePort);
        console.log();
        return game.joinRoom(req.socket.remoteAddress as string, req.params.uuid);
    }

    @Endpoint 
    getRoom(req: Request, res: Response) {
        return game.getRoom(req.params.uuid);
    }

    @Endpoint
    getRooms(req: Request, res: Response) {
        return game.getRooms();
    }

    @Endpoint
    updatePlayer(req: Request, res: Response) {
        return game.updatePlayer(req.params.uuid, req.params.player, req.body);
    }

    @Endpoint
    startGame(req: Request, res: Response) {
        return game.startGame(req.params.uuid);
    }

    @Endpoint
    deletePlayer(req: Request, res: Response) {
        return game.deletePlayer(req.params.uuid, req.params.player);
    }

    @Endpoint
    updateRoom(req: Request, res: Response) {
        return game.patchRoom(req.params.uuid, req.body);
    }

    @Endpoint
    makeGuess(req: Request, res: Response) {
        return game.makeGuess(req.params.roomUUID, req.params.playerUUID);
    }

    @Endpoint
    entry(req: Request, res: Response) {
        return `<h1 style='color: red'> You should not be here </h1>`
    }

    @Endpoint 
    randomArticle(req: Request, res: Response) {
        return game.randomArticle(req.query.category as string);
    }
}

export default GameController;