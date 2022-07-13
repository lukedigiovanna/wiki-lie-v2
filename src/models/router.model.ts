import { Router } from "express";

export interface RouteSource {
    path: string;
    router: Router;
}