import { MikroORM } from "@mikro-orm/core";
import MicroOrmConfig from './mikro-orm.config';
import { Post } from "./entities/Post";
import express from "express"
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { GetPostsResolver } from "./resolver/GetPosts";

const main = async () => {
    const orm = await MikroORM.init(MicroOrmConfig);
    await orm.getMigrator().up();
    const emFork = orm.em.fork({});

    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [GetPostsResolver],
            validate: false,
        }),
        context: () => ({ em: emFork })
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app });
    app.listen(4000, () => {
        console.log('Server started on localhost:4000');
    });
    // const post = emFork.create(Post, {
    //     title: 'my first post',
    //     createdAt: "",
    //     updatedAt: ""
    // });
    // await orm.em.persistAndFlush(post);
    // // console.log(__dirname)
    const myPosts = await emFork.find(Post, {});
    console.log(myPosts);
    console.log('Db connected successfully');
}

main().catch((err) => {
    console.error(err);
});