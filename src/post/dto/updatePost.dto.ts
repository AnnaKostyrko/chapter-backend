import { PartialType } from '@nestjs/swagger';

import { PostDto } from './post.dto';

export class UpdatePostDto extends PartialType(PostDto) {}
