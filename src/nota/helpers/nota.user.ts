import { User } from 'src/users/entities/user.entity';

export const notaUser = (user: User, postId?: number) => {
  if (!postId) {
    return {
      id: user.id,
      avatarUrl: user.avatarUrl,
      nickName: user.nickName,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  return {
    postId,
    user: {
      id: user.id,
      avatarUrl: user.avatarUrl,
      nickName: user.nickName,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  };
};
