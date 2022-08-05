import { BaseEntityUserChanges, ObjectScalarType } from '@pbotapps/common';
import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';
import { Application } from '../application/entity';
import { User } from '../user/entity';

@Entity()
@ObjectType()
export class Rule extends BaseEntityUserChanges {
  /**
   * Whether the rule is to be considered 'cannot' instead of 'can'.
   */
  @Column()
  @Field()
  inverted: boolean;

  /**
   * What action the user can or cannot perform.
   */
  @Column()
  @Field()
  action: string;

  /**
   * What object this rule applies to.
   */
  @Column()
  @Field()
  subject: string;

  /**
   * Fields to evaluate on the object to determine if this rule applies.
   */
  @Column({ type: 'json', hstoreType: 'object' })
  @Field(_type => ObjectScalarType)
  conditions: any;

  /**
   * Whether this rule is restricted to any fields.
   */
  @Column({ type: 'json', hstoreType: 'object' })
  @Field(_type => ObjectScalarType)
  fields: any;

  @ManyToOne(() => Application, app => app.rules, { eager: true })
  @Field(() => Application)
  application: Application;

  @ManyToMany(() => User, user => user.rules)
  users?: Promise<User[]>;
}
