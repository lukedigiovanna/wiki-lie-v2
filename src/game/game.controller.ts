import { Controller, Get, Param, Post, Req } from '@nestjs/common';
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
        console.log(uuid);
        console.log(request.ip, request.connection.remoteAddress);
    }

    @Get('/ip')
    getIp(@Req() request: Request) {
        return request.ip;
    }

    @Get()
    entry() {
        return `<h1 style='color: red'> You should not be here </h1>`
    }
}
