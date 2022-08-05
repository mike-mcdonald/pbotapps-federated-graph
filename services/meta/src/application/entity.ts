import { BaseEntityUserChanges } from '@pbotapps/common';
import { Field, ObjectType } from 'type-graphql';
import { Entity, Column, OneToMany } from 'typeorm';
import { Rule } from '../rule/entity';

@Entity()
@ObjectType()
export class Application extends BaseEntityUserChanges {
  @Column({ length: 50 })
  @Field()
  name: string;

  @Column()
  @Field({ nullable: true })
  description?: string;

  @OneToMany(() => Rule, rule => rule.application)
  rules?: Rule[];
}
