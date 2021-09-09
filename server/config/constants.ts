/*
Server Global Constants
 */

/**
 * @global memoryLimit
 */
export const memoryLimit = "501mb";

/**
 * @global responseCodes
 */
export enum responseCodes {
    SUCCESS = 200,
    CREATED = 201,
    INVALID = 400,
    UNAUTHORIZED= 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    ERROR = 500
}
