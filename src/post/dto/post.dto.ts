import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  readonly imgUrl?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  @Matches(
    /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~\d\p{Emoji}]+$/u,
  )
  readonly caption?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  @Matches(
    /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~\d\p{Emoji}]+$/u,
  )
  readonly title?: string;

  @ValidateIf((value) => !value.imageUrl && !value.caption && !value.title)
  @IsNotEmpty({
    message: 'At least one field (imageUrl, caption, title) must be specified',
  })
  readonly atLeastOneField?: string;
}
