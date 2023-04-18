import { Post, PostResponse } from "../entities/Post";
import { PostApiResponse, MyContext } from "src/types";
import { Arg, Args, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostsResolver {
    @Query(() => [Post])
    async posts(
        @Ctx() { em, redisClient }: MyContext
    ): Promise<Post[]> {
        const cachedPosts = await redisClient.get('posts');
        if (cachedPosts) {
            console.log('cachedPosts: ', cachedPosts);
            return JSON.parse(cachedPosts);
        }

        const allPosts = em.find(Post, {});
        const stringifiedPromiseObject = allPosts.then((data) => JSON.stringify(data));
        redisClient.set('posts', await stringifiedPromiseObject, {
            EX: 120
        });
        return em.find(Post, {});
    }

    @Query(() => PostResponse, { nullable: true })
    async post(
        @Arg('id', () => Int) id: number,
        @Ctx() { em, redisClient }: MyContext
    ): Promise<PostResponse | null | {
        data: Promise<Post | null>,
        isCached: boolean
    }> {
        const cachedPost = await redisClient.get(`post:${id}`);
        if (cachedPost) {
            console.log('cachedPost: ', cachedPost);
            return {
                data: JSON.parse(cachedPost),
                isCached: true
            }
        }
        const postWithGiveId = em.findOne(Post, { id: id });
        const stringifiedPromiseObject = postWithGiveId.then((data) => JSON.stringify(data));
        redisClient.set(`post:${id}`, await stringifiedPromiseObject, {
            EX: 120
        });
        return {
            data: postWithGiveId,
            isCached: false
        }
    }

    @Mutation(() => Post)
    async createPost(
        @Arg('title', () => String) title: string,
        @Ctx() { em }: MyContext
    ): Promise<Post> {
        const newPost = em.create(Post, {
            title: title,
            updatedAt: "",
            createdAt: ""
        })
        await em.persistAndFlush(newPost);
        return newPost;
    }

    @Mutation(() => Int, { nullable: true })
    async updatePost(
        @Arg('title', () => String) title: string,
        @Arg('id') id: number,
        @Ctx() { em }: MyContext
    ): Promise<number> {
        const updatePost = await em.findOne(Post, {
            id: id
        })
        if (updatePost)
            updatePost.title = title;

        await em.flush();
        return updatePost?.id ?? 0;
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id') id: number,
        @Ctx() { em }: MyContext
    ): Promise<boolean> {
        const deletePost = await em.nativeDelete(Post, { id: id })
        if (deletePost) {
            return true;
        }

        return false;
    }
}
