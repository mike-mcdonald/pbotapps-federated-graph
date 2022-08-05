import { IsEmail } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from './base';

@Entity()
@Unique('email', ['email'])
@Unique('oauth', ['oauthId'])
@ObjectType()
export class User extends BaseEntity {
  @Column({ length: 255 })
  @IsEmail()
  @Field()
  email: string;

  @Column({ length: 50 })
  @Field()
  firstName: string;

  @Column({ length: 50 })
  @Field()
  lastName: string;

  @Column({ length: 50 })
  @Field()
  oauthId: string;
}
