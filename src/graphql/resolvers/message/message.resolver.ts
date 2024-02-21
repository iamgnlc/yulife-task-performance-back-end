import { Resolver, Mutation, Ctx, Root, Arg, FieldResolver } from "type-graphql";
import Message from "./message.type";
import User from "../user/user.type";
import Context from "../../context";
import { random } from "../../../utils/math";
// const randomSentence = require("random-sentence");

@Resolver(Message)
export default class MessageResolver {
    /**
     * Looks up and returns the recipient
     */
    @FieldResolver()
    async to(@Root() { to }: Message, @Ctx() { database }: Context): Promise<User | null> {
        // TODO: add lookup from DB
        if (!to) {
            return null;
        }

        const user = await database.UserModel.findById(to);

        if (!user) {
            return null;
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            unreadMessageCount: undefined,
            inbox: undefined,
        };
    }

    /**
     * Looks up and returns the sender
     */
    @FieldResolver()
    async from(@Root() { from }: Message, @Ctx() { database }: Context): Promise<User | null> {
        if (!from) {
            return null;
        }

        const user = await database.UserModel.findById(from);

        if (!user) {
            return null;
        }

        // console.log(`User found!`, user);

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            unreadMessageCount: undefined,
            inbox: undefined,
        };
    }

    /**
     * Sends a message to a random user
     */
    @Mutation(type => Message)
    async sendRandomMessage(@Ctx() { database, userId }: Context, @Arg("message") message: string): Promise<Message> {
        if (!userId) {
            throw new Error(`Not authenticated`);
        }

        const count = await database.UserModel.countDocuments({});

        // If no users in DB throw.
        if (count === 0) {
            throw new Error(`No users found.`);
        }

        const skip = random(0, count - 1);

        const to = await database.UserModel.findOne({ _id: { $ne: userId } })
            .skip(skip)
            .select("_id");

        if (!to) {
            throw new Error(`Destination user not found.`);
        }

        const record = await database.MessageModel.create({
            from: userId,
            to: to._id,
            contents: message,
            unread: true,
        });

        return {
            id: record.id,
            contents: message,
            to: to._id,
            from: userId as any,
        };
    }

    @Mutation(type => String)
    markAsRead(@Ctx() { database, userId }: Context, @Arg("messageId") messageId: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!userId) {
                reject(new Error(`Not authenticated`));
            }

            const filter = { _id: { $eq: messageId } };
            const update = { unread: false };

            database.MessageModel.findOneAndUpdate(filter, update, { new: true })
                .then(message => {
                    if (message) {
                        resolve(message._id); // Resolve with anything useful here instead of message id.
                    }
                    reject(new Error(`Message not found.`));
                })
                .catch(error => {
                    reject(new Error(`Error while updating message: ${error.message}`));
                });
        });
    }
}
