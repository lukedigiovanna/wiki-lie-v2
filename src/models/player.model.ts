export interface Player {
    uuid: string, // unique among all players
    roomUUID: string,
    username: string, // unique among the room the player is in.
    sessionID: string, // unique among all players.
    isAdmin: boolean;
    chosenArticle: string | null;
    isConnected: boolean;
    points: number;
    isNew: boolean;
}