import { Config } from "./types";

const config: Config = {
    database: {
        uri: "mongodb://localhost/yulife-performance",
    },
    auth: {
        secret: String(process.env.AUTH_SECRET),
    },
    frontend: {
        selfUrl: "https://someapp.yulife.com/app",
    },
};

export default config;
