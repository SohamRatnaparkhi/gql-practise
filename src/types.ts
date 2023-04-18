import { Field, ObjectType } from "type-graphql";
import { Post } from "./entities/Post";

export type MyContext = {
    em: import("@mikro-orm/core").EntityManager<any>;
    redisClient: import("redis").RedisClientType;
};

export type PostApiResponse = {
    data: Post | null,
    isCached: boolean
}

