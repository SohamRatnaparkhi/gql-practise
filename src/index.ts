import { MikroORM } from "@mikro-orm/core";
import MicroOrmConfig from './mikro-orm.config';
import { Post } from "./entities/Post";
import express from "express"
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostsResolver } from "./resolver/GetPosts";
import Keyv from "keyv";
import { KeyvAdapter } from "@apollo/utils.keyvadapter";
import * as redis from 'redis';

const main = async () => {
    const orm = await MikroORM.init(MicroOrmConfig);
    await orm.getMigrator().up();
    const emFork = orm.em.fork({});

    const client = redis.createClient();
    client.on("error", function (error) {
        console.error(error);
    });

    await client.connect();

    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [PostsResolver],
            validate: false,
        }),
        cache: new KeyvAdapter(new Keyv("redis://localhost:6379")),

        context: () => ({
            em: emFork,
            redisClient: client
        })
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app });
    app.listen(4000, () => {
        console.log('Server started on http://localhost:4000/graphql');
    });
    // const post = emFork.create(Post, {
    //     title: 'my first post',
    //     createdAt: "",
    //     updatedAt: ""
    // });
    // await orm.em.persistAndFlush(post);
    // // console.log(__dirname)
    // const myPosts = await emFork.find(Post, {});
    // console.log(myPosts);
    console.log('Db connected successfully');
}

main().catch((err) => {
    console.error(err);
});