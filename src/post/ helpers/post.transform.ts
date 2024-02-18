import { CommentEntity } from 'src/comment/entity/comment.entity';
import { Like } from 'src/like/entity/like.entity';
import { User } from 'src/users/entities/user.entity';

interface PostEntity {
  id: number;
  imgUrl: string | null;
  caption: string | null;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: User;
  likes: Like[];
  comments: CommentEntity[];
}

const transformAuthor = (author: User) => ({
  id: author.id,
  avatar: author.avatarUrl,
  firstName: author.firstName,
  lastName: author.lastName,
  nickName: author.nickName,
});

const transformReplies = (parentId: number, comments: CommentEntity[]) =>
  comments
    .filter((c) => c.parentId === parentId)
    .map((reply) => ({
      id: reply.id,
      text: reply.text,
      parrentId: reply.parentId,
      postId: reply.postId,
      author: transformAuthor(reply.user),
      userIds: reply.likes.map((like) => like.userId),
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
    }));

const transformComments = (comments: CommentEntity[]) =>
  comments
    .filter((com) => com.parentId === null)
    .map((com) => ({
      id: com.id,
      text: com.text,
      postId: com.postId,
      commentCount: comments.filter((c) => c.parentId === com.id).length,
      author: transformAuthor(com.user),
      usersId: com.likes.map((like) => like.userId),
      createdAt: com.createdAt,
      updatedAt: com.updatedAt,
      comments: transformReplies(com.id, comments),
    }));

export const transformPostInfo = (postInfo: PostEntity[], user: User) =>
  postInfo.map((post) => ({
    postId: post.id,
    title: post.title,
    caption: post.caption,
    imgUrl: post.imgUrl,
    createAt: post.createdAt,
    updatedAt: post.updatedAt,
    commentsCount: post.comments.length,
    userIds: [...new Set(post.likes.map((like) => like.userId))],
    author: transformAuthor(post.author),
    isSubscribeToAuthor: user.subscribers?.some(
      (sub?) => sub?.id === post.author.id,
    ),
    comments: transformComments(post.comments),
  }));
