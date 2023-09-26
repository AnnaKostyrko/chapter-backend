import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { User } from "src/users/entities/user.entity";

@Entity()
export class FeedEntity{

@PrimaryGeneratedColumn()
@ApiProperty()
id: number;

@Column({ nullable: true })
@ApiProperty()
imgUrl: string;

@Column({ nullable: true })
@ApiProperty()
caption: string;


@Column()
@ApiProperty()
follows: string; 

@CreateDateColumn()
@ApiProperty()
createdAt: Date;

@Column()
@ApiProperty()
like:number;

@Column()
@ApiProperty()
comment:number;

@Column()
@ApiProperty()
repost:number;


// @ManyToOne(() => User, (user) => user.posts)
// @JoinColumn({ name: 'authorId' })
// author: User;

// @OneToMany(() => Follows, follows => follows.following)
// followers: Follows[];

// @OneToMany(() => Follows, follows => follows.follower)
// followings: Follows[];

}