/*
Application environment
 */
import dotenv from 'dotenv'
import {join} from 'path';

/**
 * Can be used to run the server from terminal on development
 * @param envFilePathRelateToRoot
 * @constructor
 */
export function InitializeEnvironment(envFilePathRelateToRoot = ".env"): void {
    const payload = dotenv.config({
        path: join(__dirname, `../../${envFilePathRelateToRoot}`)
    });
    console.debug(payload);
}


