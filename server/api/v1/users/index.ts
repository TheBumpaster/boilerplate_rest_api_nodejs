import {Response, Router} from "express";
import {IAuthorizedRequest} from "../../middleware/authorization";
import {ResponseBuilder} from "../../util/response";
import {responseCodes} from "../../../config/constants";
import {ValidateId} from "./validators";
import {Error} from "mongoose";
import userModel from "../../../models/user";

/**
 * Router stack for the users module
 *
 * ```typescript
 * this._router.get("/", async (request: Request, response: Response) => {
 * ...
 * }
 * ```
 *
 */
export class UserRouter {

    private _router: Router = Router();

    constructor() {

        this._router.get("/:id", async (request: IAuthorizedRequest, response: Response) => {
            const userId = request.params.id;

            if (!userId || !ValidateId(userId)) {
                return new ResponseBuilder(response)
                    .setMeta(request.query)
                    .setData({ message: "Invalid request parameters." })
                    .setStatus(responseCodes.INVALID)
                    .build()
            }

            try {

                const userExists = await userModel.findById(userId, {_id: 0, password: 0}).exec();

                if (!userExists) {
                    return new ResponseBuilder(response)
                        .setMeta(request.query)
                        .setData({ message: "User does not exist with this id" })
                        .setStatus(responseCodes.NOT_FOUND)
                        .build()
                }

                return new ResponseBuilder(response)
                    .setMeta(request.query)
                    .setData({username: userExists.username, numberOfLikes: userExists.likes.count})
                    .setStatus(responseCodes.SUCCESS)
                    .build();

            } catch (e) {
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