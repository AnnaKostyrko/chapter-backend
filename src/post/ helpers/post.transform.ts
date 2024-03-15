import { CommentEntity } from 'src/comment/entity/comment.entity';
import { Like } from 'src/like/entity/like.entity';
import { User } from 'src/users/entities/user.entity';

const timeDifference = (current: Date, previous: Date): string => {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = current.getTime() - previous.getTime();

  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + ' seconds ago';
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + ' minutes ago';
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + ' hours ago';
  } else if (elapsed < msPerMonth) {
    return 'approximately ' + Math.round(elapsed / msPerDay) + ' days ago';
  } else if (elapsed < msPerYear) {
    return 'approximately ' + Math.round(elapsed / msPerMonth) + ' months ago';
  } else {
    return 'approximately ' + Math.round(elapsed / msPerYear) + ' years ago';
  }
};

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
      ...(reply.recipientId && {
        replyTo: {
          id: reply.recipientId,
          nickName: reply.recipientNickName,
        },
      }),
      userIds: reply.likes.map((like) => like.userId),
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
    }));

export const transformComments = (
  comments: CommentEntity[],
  slice?: boolean,
) => {
  const transformedComments = comments
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

  return slice ? transformedComments.slice(0, 3) : transformedComments;
};

export const transformPostInfo = (
  postInfo: PostEntity[],
  user: User,
  isRelativeDate: boolean = false,
) =>
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
    ...(isRelativeDate && {
      relativeDate: timeDifference(new Date(), new Date(post.createdAt)),
    }),
    isSubscribeToAuthor: user.subscribers?.some(
      (sub?) => sub?.id === post.author.id,
    ),
    comments: transformComments(post.comments, true),
  }));
