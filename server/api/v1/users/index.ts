import {Response, Router} from "express";
import {Authorize, IAuthorizedRequest} from "../../middleware/authorization";
import {ResponseBuilder} from "../../util/response";
import {responseCodes} from "../../../config/constants";
import {ValidateId} from "./validators";
import {Error, FilterQuery} from "mongoose";
import userModel from "../../../models/user";
import {IUserDocument} from "../../../models/user/schema";
import {Cipher} from "../../util/security";
import {Logger} from "../../../services/logger";

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
    private _logger: Logger = new Logger("User Router")

    constructor() {

        /**
         *
         */
        this._router.get("/",  Authorize, async (request: IAuthorizedRequest, response: Response) => {

            this._logger.debug("get users", request.query as unknown as unknown[])

            try {

                const { filterQuery, limit, skip } = request.query;

                const users = await userModel.find(filterQuery !== undefined ? filterQuery as FilterQuery<IUserDocument> : {}, { password:0, _v: 0 })
                    .limit(limit !== undefined ? Number(limit) : 10)
                    .skip(skip !== undefined ? Number(skip): 0)
                    .exec();

                const meta = {};

                Object.assign(meta, request.query, {
                    totalCount: await userModel.countDocuments(filterQuery !== undefined ? filterQuery as FilterQuery<IUserDocument> : {})
                });

                return new ResponseBuilder(response)
                    .setMeta(meta)
                    .setData(users)
                    .setStatus(responseCodes.SUCCESS)
                    .build();

            } catch (e) {
                this._logger.error("get users", e as unknown as unknown[])

                return new ResponseBuilder(response)
                    .setMeta(request.query)
                    .setErrors(e as Error)
                    .setData({ message: "Caught an exception in API Handler." })
                    .setStatus(responseCodes.ERROR)
                    .build()
            }
        });

        /**
         *
         */
        this._router.post("/",  Authorize, async (request: IAuthorizedRequest, response: Response) => {
            this._logger.debug("post users", request.body as unknown as unknown[])

            try {

                const { username, password } = request.body;

                const userExists = await userModel.findOne({username}).exec();

                if (userExists) {
                    return new ResponseBuilder(response)
                        .setMeta({username, password})
                        .setData({
                            message: "User already exists with this username"
                        })
                        .setStatus(responseCodes.INVALID)
                        .build();
                }

                const user = await userModel.createUser({
                    username,
                    password: Cipher(password)
                });

                return new ResponseBuilder(response)
                    .setData(user)
                    .setStatus(responseCodes.CREATED)
                    .build();

            } catch (e) {
                this._logger.error("post users", e as unknown as unknown[])

                return new ResponseBuilder(response)
                    .setMeta(request.body)
                    .setErrors(e as Error)
                    .setData({ message: "Caught an exception in API Handler." })
                    .setStatus(responseCodes.ERROR)
                    .build()
            }
        });


        /**
         *
         */
        this._router.get("/:id",  Authorize, async (request: IAuthorizedRequest, response: Response) => {
            this._logger.debug("get users id", request.params as unknown as unknown[])

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
                    .setData({username: userExists.username})
                    .setStatus(responseCodes.SUCCESS)
                    .build();

            } catch (e) {
                this._logger.error("get users id", e as unknown as unknown[])

                return new ResponseBuilder(response)
                    .setMeta(request.query)
                    .setErrors(e as Error)
                    .setData({ message: "Caught an exception in API Handler." })
                    .setStatus(responseCodes.ERROR)
                    .build()
            }
        });

        /**
         *
         */
        this._router.delete("/:id",  Authorize, async (request: IAuthorizedRequest, response: Response) => {
            this._logger.debug("delete users id", request.params as unknown as unknown[])

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
                    .setData(await userModel.findByIdAndRemove(userId))
                    .setStatus(responseCodes.SUCCESS)
                    .build();

            } catch (e) {
                this._logger.error("delete users id", e as unknown as unknown[])

                return new ResponseBuilder(response)
                    .setMeta(request.query)
                    .setErrors(e as Error)
                    .setData({ message: "Caught an exception in API Handler." })
                    .setStatus(responseCodes.ERROR)
                    .build()
            }
        });

        /**
         *
         */
        this._router.put("/:id",  Authorize, async (request: IAuthorizedRequest, response: Response) => {
            this._logger.debug("put users id", Object.assign(request.params as unknown as unknown[], request.body as unknown as unknown[]))

            const userId = request.params.id;
            const { password } = request.body;

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
                    .setData(await userModel.findOneAndUpdate({_id: userId}, {password}))
                    .setStatus(responseCodes.SUCCESS)
                    .build();

            } catch (e) {
                this._logger.error("put users id", e as unknown as unknown[])

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