import { Player } from "./player.model";

export interface Room {
    uuid: string,
    players: Player[],
    guesserIndex: number,
    category: string,
    isInRound: boolean,
    lastStartTime: number,
}