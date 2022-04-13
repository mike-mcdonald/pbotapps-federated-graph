import { BaseEntity } from "@pbotapps/common";
import { Field, ObjectType } from "type-graphql";
import { Entity, Column } from "typeorm";

@Entity()
@ObjectType()
export class Application extends BaseEntity {
  @Column({ length: 50 })
  @Field()
  name: string;

  @Column()
  @Field()
  description: string;
}
