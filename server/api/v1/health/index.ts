import {Response, Router, Request} from "express";
import {ResponseBuilder} from "../../util/response";
import {responseCodes} from "../../../config/constants";
import mongoose from "mongoose";

/**
 * Router stack for the health module
 *
 * ```typescript
 * this._router.get("/", async (request: Request, response: Response) => {
 * ...
 * }
 * ```
 *
 */
export class HealthRouter {

    private _router: Router = Router();

    constructor() {
        this._router.get("/liveness", (request: Request, response: Response) => {
            return new ResponseBuilder(response)
                .setMeta(request.query)
                .setData({ status: true })
                .setStatus(responseCodes.SUCCESS)
                .build()
        });

        this._router.get("/readiness", (request: Request, response: Response) => {

            const checkDB = mongoose.connection.readyState;

            return new ResponseBuilder(response)
                .setMeta(request.query)
                .setData({ status: checkDB === 1 })
                .setStatus(responseCodes.SUCCESS)
                .build()
        });

    }

    public getRouter(): Router {
        return this._router;
    }

}