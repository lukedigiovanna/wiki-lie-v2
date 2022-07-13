// responsible for routing endpoints to controller methods.
import { Router } from 'express';
import GameController from './game.controller';
import { RouteSource } from '../models/router.model';

class GameRouter implements RouteSource {
    private readonly controller: GameController;
    public readonly router: Router;
    public readonly path: string = '/api/game';

    constructor() {
        this.controller = new GameController();
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post  ('/create',             this.controller.createGame);
        this.router.post  ('/join/:uuid',         this.controller.joinRoom);
        this.router.get   ('/room/:uuid',         this.controller.getRoom);
        this.router.get   ('/rooms',              this.controller.getRooms);
        this.router.patch ('/room/:uuid/:player', this.controller.updatePlayer);
        this.router.post  ('/start/:uuid',        this.controller.startGame);
        this.router.delete('/room/:uuid/:player', this.controller.deletePlayer);
        this.router.patch ('/room/:uuid',         this.controller.updateRoom);
        this.router.get   ('/',                   this.controller.entry);
    }
}

export { GameRouter };