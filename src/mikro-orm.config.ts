import { MikroORM } from "@mikro-orm/core";
import { Post } from "./entities/Post";
import path from "path";
import { User } from "./entities/User";

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    entities: [Post, User],
    dbName: "gqltest",
    password: "Soham@123*",
    type: "postgresql",
    debug: process.env.NODE_ENV !== "production",
    allowGlobalContext: true
} as Parameters<typeof MikroORM.init>[0];
