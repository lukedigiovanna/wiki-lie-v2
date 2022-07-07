import { Controller, Delete, Get, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GameService } from './game.service';
import { Request } from 'express';

@Controller('api/game')
export class GameController {
    constructor(private readonly gameService: GameService) {}
 
    @Post('/create')
    createGame() {
        // create a room and return the uuid.
        return this.gameService.createRoom();
    }

    @Post('/join/:uuid')
    joinRoom(@Req() request: Request, @Param('uuid') uuid: string) {
        console.log(request.ip, request.connection.remoteAddress);
        return this.gameService.joinRoom(request.ip, uuid);
    }

    @Get('/room/:uuid')
    getRoom(@Param('uuid') uuid: string) {
        return this.gameService.getRoom(uuid);
    }

    @Get('/rooms')
    getRooms() {
        return this.gameService.getRooms();
    }

    @Patch('/room/:uuid/:player')
    updatePlayer(@Req() request: Request, @Param('uuid') uuid: string, @Param('player') player: string) {
        return this.gameService.updatePlayer(uuid, player, request.body);
    }

    @Delete('/room/:uuid/:player')
    deletePlayer(@Param('uuid') uuid: string, @Param('player') player: string) {
        return this.gameService.deletePlayer(uuid, player);
    }

    @Patch('/room/:uuid')
    updateRoom(@Req() request: Request, @Param('uuid') uuid: string) {
        return this.gameService.patchRoom(uuid, request.body);
    }

    @Get()
    entry() {
        return `<h1 style='color: red'> You should not be here </h1>`
    }
}
