import {NextFunction, Request, Response} from "express";
import {verify, sign} from 'jsonwebtoken';
import {ResponseBuilder} from "../util/response";
import {responseCodes} from "../../config/constants";

export interface IAuthorizedRequest extends Request {
    userData?: {
        _id: string
        username: string
        createdAt: string
        updatedAt: string
    }
}

/**
 * Authorization middleware
 *
 * Validates token
 *
 * Assigns userData to request object
 * @param request
 * @param response
 * @param next
 * @constructor
 */
export function Authorize(request: Request, response: Response, next: NextFunction): void | Response {
    const headerAuthorization = request.header("Authorization");

    if (!headerAuthorization) {
        return new ResponseBuilder(response)
            .setData({message: "Authorization token is required."})
            .setStatus(responseCodes.UNAUTHORIZED)
            .build()
    }
    const [bearer, token] = headerAuthorization.split(" ");

    if (!bearer || !token) {
        return new ResponseBuilder(response)
            .setData({message: "Authorization token needs to be in Bearer format."})
            .setStatus(responseCodes.UNAUTHORIZED)
            .build()

    }

    // Decode & Verify JWT
    verify(token as string, process.env.JWT_SECRET as string, {
        issuer: process.env.JWT_ISSUER as string,
        audience: process.env.JWT_AUDIENCE as string,
        algorithms: ["HS256"]
    }, (error, payload) => {
        if (error) {
            return new ResponseBuilder(response)
                .setData({message: "Authorization token is invalid."})
                .setErrors(error)
                .setStatus(responseCodes.UNAUTHORIZED)
                .build()
        }

        // Extend request to authorized request
        Object.assign(request, {
            userData: payload
        });

        next();
    });

}

/**
 * Creates new jwt on provided payload
 * @param payload
 * @constructor
 */
export async function SignNewJWT(payload: Record<string, unknown>): Promise<string> {
    return sign(payload as Record<string, unknown>, process.env.JWT_SECRET as string, {
        algorithm: "HS256",
        issuer: process.env.JWT_ISSUER as string,
        audience: process.env.JWT_AUDIENCE as string,
        expiresIn: process.env.JWT_EXPIRY as string
    });
}