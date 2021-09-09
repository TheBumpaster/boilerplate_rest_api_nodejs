import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import {Logger} from "./services/logger";
import InitializeRouter from "./api/router";
import {GenerateMongoURI, InitializeMongooseClientConnection} from "./services/database";
import {memoryLimit} from "./config/constants";

const applicationLogger: Logger = new Logger("Express Application", String(process.pid))

const application = express();

application.disable("views")
application.disable("view cache")
application.disable("x-powered-by")

application.use(helmet.hidePoweredBy())
application.use(helmet.xssFilter())
application.use(cors())
application.use(express.json({ limit: memoryLimit }))
application.use(compression())
application.use(express.urlencoded({ limit: memoryLimit, extended: true }))

const port = process.env.PORT === undefined ? 3000 : Number(process.env.PORT);

InitializeMongooseClientConnection()
    .then(() => {
        applicationLogger.info(`DB Connection Initialized on ${GenerateMongoURI()}`);

        InitializeRouter(application)
            .then(() => {
                applicationLogger.info(`Server Router Mounted Successfully ${application?._router?.stack?.length === undefined ? 0 : application?._router?.stack?.length} stacks`);
            });

        application.listen(port, () => {
            applicationLogger.info(`Server started listening to connections on localhost:${port}`);

            application.emit("service_ready", true);
            application.set("service_ready", true);
        });

    })
    .catch(() => {
        applicationLogger.warn(`DB Connection Failed Initializing on ${GenerateMongoURI()}`);

        // Quick fail
        process.exit(1);
    })

/**
 * Main server application ( express.Application )
 * @internal
 */
export default application;
