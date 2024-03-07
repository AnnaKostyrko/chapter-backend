import { User } from 'src/users/entities/user.entity';

export const notaUser = (user: User) => {
  return {
    id: user.id,
    avatarUrl: user.avatarUrl,
    nickName: user.nickName,
    firstName: user.firstName,
    lastName: user.lastName,
  };
};
