import express, { Application } from "express";
import { Server } from "http";
import { RouteSource } from "./models/router.model";
import { initSocket } from "./socket";
const cookieParser = require("cookie-parser");
const path = require('path');

class App {
    private app: Application;
    private port: number;
    private server: Server;

    constructor(routes: RouteSource[]) {
        this.port = process.env.PORT ? Number(process.env.PORT) : 4000;
        this.app = express();
        this.server = new Server(this.app);

        initSocket(this.server);

        this.initializeMiddleware();
        
        routes.forEach(route => {
            this.app.use(route.path, route.router);
        });

        this.app.use(express.static('src/public_html'));
        
        this.app.get('/*', function (req, res) {
            res.sendFile(path.join(__dirname, 'public_html', 'index.html'));

        });
    }

    private initializeMiddleware() {
        this.app.use(express.json());
        this.app.use(cookieParser());
        this.app.use((req, res, next) => {
            res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization, Cookie");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Origin", "*");
            next();
        });
    }

    public listen() {
        this.server.listen(this.port, () => {
            console.log(`Listening on port ${this.port}`);
        });
    }
}

export { App };