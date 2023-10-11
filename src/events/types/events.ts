import { PostEntity } from "src/post/entities/post.entity";

export interface ServerToClientEvents {
    newMessage: (payload: PostEntity) => void;
}
