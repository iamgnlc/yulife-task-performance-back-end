import "reflect-metadata"; // this ensures type graphql works properly
import jwt from "express-jwt";
import expressPlayground from "graphql-playground-middleware-express";
import express from "express";
import getDatabase from "./database";
import createGraphqlServer from "./graphql";
import config from "./config";
import { isEnv } from "./utils/isEnv";

import "./utils/dotenv";

const NODE_PORT = process.env.NODE_PORT || 3000;

const init = async () => {
    const app = express();
    const db = await getDatabase(config.database);
    console.log(`DB connected to ${config.database.uri}!`);
    const server = await createGraphqlServer(db);

    const path = "/graphql";

    app.use(
        path,
        jwt({
            secret: config.auth.secret,
            credentialsRequired: false,
            algorithms: ["HS256"],
        }),
    );

    // for debugging (enable playground only in dev)
    if (isEnv("development")) {
        app.get("/playground", expressPlayground({ endpoint: "/graphql" }));
    }

    server.applyMiddleware({ app, path });

    app.listen(NODE_PORT);
    console.log(`App listening on port ${NODE_PORT}!`);
    console.log(`Env: ${process.env.NODE_ENV?.toUpperCase()}`);
};

init();
