import {Application, NextFunction, Request, Response} from "express";
import {Logger} from "../services/logger";
import {UserRouter} from "./v1/users";
import {SystemRouter} from "./v1/system";
import {responseCodes} from "../config/constants";
import {ResponseBuilder} from "./util/response";
import {HealthRouter} from "./v1/health";
import {serveWithOptions, setup} from "swagger-ui-express";
import {readFileSync} from "fs";
import {join} from "path";
import YAML from 'yaml'
const {version, description, author, name, homepage, maintainers} = require("../../package.json");

/**
 * Attaches route stacks to express.Application
 * ```typescript
 * app.use("/api/v1/health", new HealthRouter().getRouter());
 * ```
 *
 * Here we parse our API definitions and load them into Swagger UI config
 * ```
 * app.use("/api/docs/v1", (request: Request, response: Response) => {
 *      // Parse YAML
 *      const file = readFileSync(join(__dirname, 'v1/api.spec.yaml'), 'utf8')
 *      const openAPIDefinition = YAML.parse(file)
 *      response.status(responseCodes.SUCCESS)
 *      response.send(openAPIDefinition);
 * });
 * ```
 *
 *
 * @param app
 * @constructor
 */
export default function InitializeRouter(app: Application): Promise<void> {
    return new Promise(async (resolve, reject) => {
        const logger = new Logger("Express Router", String(process.pid))

        try {
            // Attach route stacks
            app.use("/api/v1/health", new HealthRouter().getRouter());
            app.use("/api/v1/system", new SystemRouter().getRouter());
            app.use("/api/v1/users", new UserRouter().getRouter());

            // Parse OpenAPI specifications
            app.use("/api/docs/v1", (request: Request, response: Response) => {
                // Parse YAML
                const file = readFileSync(join(__dirname, 'v1/api.spec.yaml'), 'utf8')
                const openAPIDefinition = YAML.parse(file, {})

                openAPIDefinition.info = {
                    title: name,
                    description: description,
                    version: version,
                    contact: {
                        name: author,
                        url: homepage,
                        email: maintainers[0]
                    }
                }

                response.status(responseCodes.SUCCESS)
                response.send(openAPIDefinition);
            });

            // Serving static files for the UI
            app.use("/api/docs", serveWithOptions({
                cacheControl: true,
            }));

            // Setting up the swagger ui
            app.get("/api/docs", setup(undefined, {
                explorer: true,
                isExplorer: true,
                swaggerOptions: {
                    urls: [
                        {
                            url: "/api/docs/v1",
                            name: "API V1 Specification"
                        }
                    ]
                }
            }))


            // Mount error handler
            app.use((err: Error, request: Request, response: Response, nextFunction: NextFunction) => {
                logger.error("Internal Server Error", err);
                return new ResponseBuilder(response)
                    .setStatus(responseCodes.ERROR)
                    .setErrors(err)
                    .setMeta(request.query)
                    .build()
            });

            // Mount Not Found handler
            app.use((request: Request, response: Response) => {
                return new ResponseBuilder(response)
                    .setStatus(responseCodes.NOT_FOUND)
                    .setData({
                        message: "Resource requested does not exist."
                    })
                    .setMeta(request.query)
                    .build()
            });

            resolve();
        } catch (exception) {
            logger.error("Failed Initializing Router", exception);
            reject();
        }

    })
}