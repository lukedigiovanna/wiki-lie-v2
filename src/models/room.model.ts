import { Player } from "./player.model";

export interface Room {
    uuid: string,
    players: Player[],
    guesserIndex: number,
    articleIndex: number,
    category: string,
    isInRound: boolean,
    lastStartTime: number,
}