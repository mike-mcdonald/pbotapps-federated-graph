import { BaseEntity } from '@pbotapps/common';
import { IsEmail } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, JoinTable, ManyToMany, Unique } from 'typeorm';
import { Rule } from '../rule/entity';

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

  @ManyToMany(() => Rule, rule => rule.users)
  @JoinTable()
  @Field(() => [Rule], { nullable: true })
  rules?: Promise<Rule[]>;
}
