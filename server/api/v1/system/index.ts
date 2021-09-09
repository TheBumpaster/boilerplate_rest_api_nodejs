import {Request,Response, Router} from "express";
import {ResponseBuilder} from "../../util/response";
import {responseCodes} from "../../../config/constants";
import {ValidateSignPayload} from "./validators";
import {Error} from "mongoose";
import {ValidationError} from 'joi'
import userModel from "../../../models/user";
import {Cipher} from "../../util/security";
import {Authorize, IAuthorizedRequest, SignNewJWT} from "../../middleware/authorization";
import {Logger} from "../../../services/logger";

const logger = new Logger("SystemRouter");

/**
 * Router stack for the system module
 *
 * ```typescript
 * this._router.get("/", async (request: Request, response: Response) => {
 * ...
 * }
 * ```
 *
 */
export class SystemRouter {

    private _router: Router = Router();

    constructor() {
        this._router.post("/signup", async (request: Request, response: Response) => {
            try {

                // Validate body
                await ValidateSignPayload(request.body);

                // Check if user already exists
                const userExists = await userModel.findUserByUsername(request.body.username);
                if (userExists) {
                    return new ResponseBuilder(response)
                        .setMeta(request.query)
                        .setData({ message: "User already exists with this email. Please login." })
                        .setStatus(responseCodes.INVALID)
                        .build()
                }

                // Create new user
                const user = await userModel.createUser({
                    username: request.body.username,
                    password: Cipher(request.body.password)
                });

                return new ResponseBuilder(response)
                    .setMeta(request.query)
                    .setData({ message: "User created.", user })
                    .setStatus(responseCodes.CREATED)
                    .build()

            } catch (e) {

                logger.error("Exception", e);

                if ((e as ValidationError).name === "ValidationError") {

                    return new ResponseBuilder(response)
                        .setMeta(request.query)
                        .setErrors(e as ValidationError)
                        .setData({ message: "Invalid input values." })
                        .setStatus(responseCodes.INVALID)
                        .build()

                } else {

                    return new ResponseBuilder(response)
                        .setMeta(request.query)
                        .setErrors(e as Error)
                        .setData({ message: "Caught an exception in API Handler." })
                        .setStatus(responseCodes.ERROR)
                        .build()
                }

            }
        });

        this._router.post("/signin", async (request: Request, response: Response) => {
            try {
                await ValidateSignPayload(request.body);

                const userExists = await userModel.findUserByUsername(request.body.username);

                if(!userExists) {
                    return new ResponseBuilder(response)
                        .setMeta(request.query)
                        .setData({ message: "User does not exist with this username" })
                        .setStatus(responseCodes.NOT_FOUND)
                        .build()
                }

                const passwordsMatch = Cipher(request.body.password) === userExists.password;

                if (!passwordsMatch) {
                    return new ResponseBuilder(response)
                        .setMeta(request.query)
                        .setData({ message: "Username and password combination does not match." })
                        .setStatus(responseCodes.INVALID)
                        .build()
                }

                const token = await SignNewJWT({
                    username: userExists.username,
                    _id: userExists._id,
                    createdAt: userExists.createdAt,
                    updatedAt: userExists.updatedAt
                });

                return new ResponseBuilder(response)
                    .setMeta(request.query)
                    .setData({ token })
                    .setStatus(responseCodes.SUCCESS)
                    .build()

            } catch (e) {
                logger.error("Exception", e);

                if ((e as ValidationError).name === "ValidationError") {

                    return new ResponseBuilder(response)
                        .setMeta(request.query)
                        .setErrors(e as ValidationError)
                        .setData({ message: "Invalid input values." })
                        .setStatus(responseCodes.INVALID)
                        .build()

                } else {

                    return new ResponseBuilder(response)
                        .setMeta(request.query)
                        .setErrors(e as Error)
                        .setData({ message: "Caught an exception in API Handler." })
                        .setStatus(responseCodes.ERROR)
                        .build()
                }
            }

        });

        this._router.get("/me", Authorize, async (request: IAuthorizedRequest, response: Response) => {
            try {
                return new ResponseBuilder(response)
                    .setMeta(request.query)
                    .setData(request.userData)
                    .setStatus(responseCodes.SUCCESS)
                    .build()

            } catch (e) {
                logger.error("Exception", e);

                return new ResponseBuilder(response)
                    .setMeta(request.query)
                    .setErrors(e as Error)
                    .setData({ message: "Caught an exception in API Handler." })
                    .setStatus(responseCodes.ERROR)
                    .build()
            }
        });

        this._router.post("/me/update-password", Authorize, async (request: IAuthorizedRequest, response: Response) => {
            if(!request.body.oldPassword || !request.body.newPassword) {
                return new ResponseBuilder(response)
                    .setMeta(request.query)
                    .setData({ message: "Invalid request parameters." })
                    .setStatus(responseCodes.INVALID)
                    .build()
            }
            try {
                const user = await userModel.findUserByUsername(request.userData?.username as string);
                if (Cipher(request.body.oldPassword) !== user?.password) {
                    return new ResponseBuilder(response)
                        .setMeta(request.query)
                        .setData({
                            message: "Old password does not match current password."
                        })
                        .setStatus(responseCodes.INVALID)
                        .build()
                }

                await userModel.updateUserPassword(request.userData?._id as string, Cipher(request.body.newPassword));

                return new ResponseBuilder(response)
                    .setMeta(request.query)
                    .setData(user)
                    .setStatus(responseCodes.SUCCESS)
                    .build()

            } catch (e) {
                logger.error("Exception", e);

                return new ResponseBuilder(response)
                    .setMeta(request.query)
                    .setErrors(e as Error)
                    .setData({ message: "Caught an exception in API Handler." })
                    .setStatus(responseCodes.ERROR)
                    .build()
            }

        });
    }

    public getRouter(): Router {
        return this._router;
    }

}