import { Config } from "./types";

import "../utils/dotenv";

const NODE_PORT = process.env.NODE_PORT || 3000;

const config: Config = {
    database: {
        uri: "mongodb://localhost:27017/yulife-performance",
    },
    auth: {
        secret: String(process.env.AUTH_SECRET),
    },
    frontend: {
        selfUrl: `http://localhost:${NODE_PORT}/app`,
    },
};

export default config;
