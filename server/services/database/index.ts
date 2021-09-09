import mongoose from "mongoose";
import {MongoMemoryServer} from 'mongodb-memory-server';
import * as faker from "faker";

/**
 * Generates MongoURI based on environment variables in .env
 * ```d
 * DB_USER=
 * DB_PASS=
 * DB_HOST=
 * DB_PORT=
 * DB_NAME=
 * DB_AUTH_SOURCE=
 * ```
 * @constructor
 */
export function GenerateMongoURI(): string {
    let uri = 'mongodb://';

    if (process.env.DB_USER !== undefined && process.env.DB_PASS !== undefined) {
        uri += `${process.env.DB_USER}:${process.env.DB_PASS}@`;
    }

    uri += `${process.env.DB_HOST}`
    if (process.env.DB_PORT !== undefined) {
        uri += `:${process.env.DB_PORT}`
    }
    uri += `/${process.env.DB_NAME}`;

    if (process.env.DB_AUTH_SOURCE !== undefined) {
        uri += `?authSource=${process.env.DB_AUTH_SOURCE}`
    }

    return uri;

}

/**
 * Checks if NODE_ENV is "test", then start MongoDBMemoryServer
 * Otherwise it will pass Mongo_URI to Mongoose.connect
 * @constructor
 */
export async function InitializeMongooseClientConnection(): Promise<mongoose.Mongoose | Error> {
    try {

        if (process.env.NODE_ENV === "test") {

            await SetupMongoDBMemoryServer()

            return mongoose.connect(GenerateMongoURI(), {
                autoIndex: true,
                autoCreate: true
            });

        } else {

            return mongoose.connect(GenerateMongoURI(), {
                autoIndex: true,
                autoCreate: true
            });

        }
    } catch (e) {
        console.error(e);
        return new Error("Failed initializing mongoose.");
    }

}

/**
 * Starts new process of mongod
 * Updates system environment variables with new values
 * ```d
 * DB_PORT=server.instanceInfo.port
 * DB_HOST=server.instanceInfo.ip
 * DB_NAME=process.env.DB_NAME | faker.name.title()
 * ```
 *
 * @constructor
 */
export function SetupMongoDBMemoryServer(): Promise<MongoMemoryServer> {
    return new Promise((resolve, reject) => {
        MongoMemoryServer.create({})
            .then((server) => {
                process.env.DB_PORT = String(server.instanceInfo?.port)
                process.env.DB_HOST = String(server.instanceInfo?.ip);
                process.env.DB_NAME =
                    process.env.DB_NAME !== undefined ? process.env.DB_NAME :
                        faker.random.alphaNumeric(7);
                resolve(server)
            })
            .catch((reason) => {
                reject(reason);
            })
    })
}
