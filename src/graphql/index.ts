import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-express";
import depthLimit from "graphql-depth-limit";
import { Database } from "../database";
import { resolvers } from "./resolvers";
import Context from "./context";

export default async (db: Database) => {
    const schema = await buildSchema({ resolvers });

    const server = new ApolloServer({
        schema,
        validationRules: [depthLimit(3)], // Max detph limit for GQL queries/mutation to avoid performance degradation.
        context: req => new Context(db, req),
    });

    return server;
};
