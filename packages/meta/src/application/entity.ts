import { Field, ID, ObjectType } from "type-graphql";
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@ObjectType()
export class Application {
  @PrimaryGeneratedColumn("uuid")
  @Field((type) => ID)
  uuid: string;

  @Column({ length: 50 })
  @Field()
  name: string;

  @Column()
  @Field()
  description: string;
}
