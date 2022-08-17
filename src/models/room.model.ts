import { Player } from "./player.model";

export interface Room {
    uuid: string,
    players: Player[],
    guesserIndex: number,
    articleIndex: number,
    category: string,
    changingCategory: boolean,
    numPossibleArticles: number,
    isInRound: boolean,
    lastStartTime: number,
    roundNumber: number,
    timeLimitPerRound: number, // (300 - 900 seconds)
    guesserGracePeriod: number // (15 - 60 seconds)
}