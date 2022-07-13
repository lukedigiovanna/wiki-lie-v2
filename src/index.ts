// import express from 'express';

import { App } from "./app";
import { GameRouter } from "./game/game.router";

const app = new App([
    new GameRouter()
]);

app.listen();


// app.listen();

// decorator testing

// function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//     let fn = descriptor.value; // save off the original function

//     descriptor.value = function (...args: any) {
//         console.log(`calling ${propertyKey} with params ${JSON.stringify(args)}`);
//         let result = fn.apply(this, args); // call the original function
//         console.log(`result: ${JSON.stringify(result)}`);
//         return result;
//     }

//     return descriptor;

// }

// class Test {
//     constructor(private readonly name: string) {}

//     @log
//     test() {
//         console.log(`Hello ${this.name}`);
//     }

//     @log
//     add(a: number, b: number) {
//         return a + b;
//     }

//     @log
//     sub(a: number, b: number) {
//         return a - b;
//     }
// }

// const test = new Test('hi');
// test.test();
// test.add(1, 2);
// test.sub(10,4);

