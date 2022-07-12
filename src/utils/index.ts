import { HttpException } from "../models/exception.model";

/**
 * Decorator function to handle calling REST endpoints.
 * Handles making the call and sending the appropriate response.
 * @param target 
 * @param propertyKey 
 * @param descriptor 
 * @returns 
 */
export function Endpoint(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let fn = descriptor.value; // save off the original function

    descriptor.value = function (...args: any[]) {
        try {
            let result = fn(...args); // call the original function
            return args[1].status(200).send(result); // success
        } catch (error: any) {
            if (error instanceof HttpException) {
                return args[1].status(error.status).send({statusCode: error.status, message: error.message});
            }
            return args[1].status(500).send(error.message);
        }
    }

    return descriptor;
}