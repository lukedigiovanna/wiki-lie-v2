import { Controller, Get, Param, Patch, Post, Put, Req } from '@nestjs/common';
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

    @Put('/room/:uuid/:player')
    updatePlayer(@Req() request: Request, @Param('uuid') uuid: string, @Param('player') player: string) {
        console.log(request, uuid, player);
    }

    @Get()
    entry() {
        return `<h1 style='color: red'> You should not be here </h1>`
    }
}
