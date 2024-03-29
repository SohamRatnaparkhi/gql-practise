import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Post {
    @Field(() => String)
    @Property({ type: "text" })
    title!: string;

    @Field(() => Int)
    @PrimaryKey()
    id!: number;

    @Field(() => String)
    @Property({ type: "date" })
    createdAt = new Date();

    @Field(() => String)
    @Property({ type: "date", onUpdate: () => new Date() })
    updatedAt = new Date();
}

@ObjectType()
export class PostResponse {

    @Field(() => Post, { nullable: true })
    data: Post;

    @Field(() => Boolean)
    isCached: boolean;
}