// import express from 'express';

import { App } from "./app";
import { GameRouter } from "./game/game.router";

const app = new App([
    new GameRouter()
]);

app.listen();