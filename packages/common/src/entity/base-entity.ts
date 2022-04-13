import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export default class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field(() => ID)
  uuid: string;

  @CreateDateColumn()
  @Field()
  created: Date;

  @UpdateDateColumn()
  @Field()
  changed: Date;
}
