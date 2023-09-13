import { ApiProperty } from '@nestjs/swagger';

export class GuestUserInfoResponse {
  @ApiProperty({ example: 'avatar_url_here' })
  avatarUrl: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: '@Jojo2323' })
  nickName: string;

  @ApiProperty({ example: 'Location' })
  location: string;

  // Include any other fields you want to display
}
