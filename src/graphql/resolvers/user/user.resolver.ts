import { Resolver, Query, Mutation, Ctx, Arg, FieldResolver, Root } from "type-graphql";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "./user.type";
import Context from "../../context";
import config from "../../../config";

@Resolver(User)
export default class UserResolver {
    /**
     * Me Query
     */
    @Query(returns => User)
    async me(@Ctx() { database, userId }: Context): Promise<User> {
        if (!userId) {
            throw new Error(`Not authenticated`);
        }

        const user = await database.UserModel.findById(userId);

        if (!user) {
            throw new Error(`User does not exist`);
        }

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            inbox: undefined,
            unreadMessageCount: undefined,
        };
    }

    /**
     * User's inbox
     */
    @FieldResolver()
    async inbox(@Root() user: User, @Ctx() { database, userId }: Context): Promise<User["inbox"]> {
        // lookup the messages for a user from messages table
        const messages = await database.MessageModel.find({ to: userId });

        return messages.map(message => ({
            id: message.id,
            contents: message.contents,
            to: message.to as any,
            from: message.from as any,
            unread: message.unread,
        }));
    }

    /**
     * Unread message count for a user
     */
    @FieldResolver()
    async unreadMessageCount(
        @Root() user: User,
        @Ctx() { database, userId }: Context,
    ): Promise<User["unreadMessageCount"]> {
        // do a count on the DB for messages count
        const count = await database.MessageModel.countDocuments({ to: userId, unread: true }); // Perform count in DB other than in code.
        return count;
    }

    /**
     * Login mutation
     */
    @Mutation(returns => String)
    async login(@Arg("email") email: string, @Arg("password") password: string, @Ctx() { database }: Context) {
        const record = await database.UserModel.findOne({ email });

        if (!record || !(await bcrypt.compare(password, record.password))) {
            throw new Error(`Incorrect credentials`);
        }

        // Isn't 1 year too long for validity of the JWT?
        return jwt.sign({ userId: record._id }, config.auth.secret, { expiresIn: "1y" });
    }

    /**
     * Register new user
     */
    @Mutation(returns => String)
    // async register(@Arg("email") email: string, @Arg("password") password: string, @Ctx() { database }: Context) {
    //     const existing = await database.UserModel.exists({ email }); // Use exists is more efficiwent. Only check for existence without returning.

    //     if (existing) {
    //         throw new Error(`User exists!`); // This error could be replaced with a more generic one to avoid telling a possible attacker email exists in DB.
    //     }

    //     const salt = await bcrypt.genSalt(10);
    //     const hash = await bcrypt.hash(password, salt);
    //     const user = await database.UserModel.create({
    //         email,
    //         password: hash,
    //     });

    //     // Isn't 1 year too long for validity of the JWT?
    //     return jwt.sign({ userId: user._id }, config.auth.secret, { expiresIn: "1y" });
    // }

    // Alternatively function above could be rerfactored avoiding async/await.
    // This type of refactor could be applied somewhere else as well.
    register(@Arg("email") email: string, @Arg("password") password: string, @Ctx() { database }: Context) {
        return database.UserModel.exists({ email })
            .then(existing => {
                if (existing) {
                    throw new Error(`User exists!`); // This error message could be replaced with a more generic one to avoid telling a possible attacker email exists in DB.
                }
                return bcrypt.genSalt(10);
            })
            .then(salt => bcrypt.hash(password, salt))
            .then(hash => database.UserModel.create({ email, password: hash }))
            .then(user => jwt.sign({ userId: user._id }, config.auth.secret, { expiresIn: "1y" }))
            .catch(error => {
                throw new Error(`Registration failed: ${error.message}`);
            });
    }
}
