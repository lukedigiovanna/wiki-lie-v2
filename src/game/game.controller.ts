import { Request, Response } from 'express';
import game from './game.service';
import { Endpoint } from '../utils';
import { collectPagesInCategory } from '../utils/wikipedia';

class GameController {
    @Endpoint
    createGame(req: Request, res: Response) {
        return game.createRoom();
    }

    @Endpoint
    joinRoom(req: Request, res: Response) {
        return game.joinRoom(req.ip, req.params.uuid);
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

    // @Endpoint
    // async test(req: Request, res: Response) {
    //     const pages = await collectPagesInCategory(`Category:${req.query.category}`);
    //     console.log("Results: ", pages);
    //     return pages;
    // }

    @Endpoint 
    randomArticle(req: Request, res: Response) {
        return game.randomArticle(req.query.category as string);
    }
}

export default GameController;