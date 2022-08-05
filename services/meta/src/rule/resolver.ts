import { createBaseResolver } from '@pbotapps/common';
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Resolver,
  Root,
} from 'type-graphql';
import AppDataSource from '../data-source.js';
import { Rule } from './entity.js';
import { User } from '../user/entity';
import { NewRuleInput, UpdateRuleInput } from './input';
import { Application } from '../application/entity.js';

const BaseResolver = createBaseResolver('Rule', Rule, AppDataSource);

@Resolver(() => Rule)
export class RuleResolver extends BaseResolver {
  @Mutation(() => Rule, { name: `addRule` })
  @Authorized<Partial<Rule>>([{ subject: 'Rule', action: 'add' }])
  async create(
    @Arg('data') data: NewRuleInput,
    @Ctx('user') user: User
  ): Promise<Rule> {
    const { applicationUuid, ...rest } = data;

    const rule = await AppDataSource.manager.create(Rule, {
      ...rest,
    });

    if (applicationUuid) {
      rule.application = await AppDataSource.manager.findOneByOrFail(
        Application,
        {
          uuid: applicationUuid,
        }
      );
    }

    rule.createdBy = user.uuid;
    rule.changedBy = user.uuid;

    return AppDataSource.manager.save(rule);
  }

  @Mutation(() => Rule, { name: `updateRule` })
  @Authorized()
  async update(
    @Arg('data') data: UpdateRuleInput,
    @Ctx('user') user: User
  ): Promise<Rule> {
    const { uuid, applicationUuid, ...rest } = data;

    const rule = await AppDataSource.manager.findOneByOrFail(Rule, { uuid });

    Object.entries(rest).forEach(([k, v]) => v && (rule[k] = v));

    if (applicationUuid) {
      rule.application = await AppDataSource.manager.findOneByOrFail(
        Application,
        {
          uuid: applicationUuid,
        }
      );
    }

    rule.changedBy = user.uuid;

    return AppDataSource.manager.save(rule);
  }

  @FieldResolver(() => [User], { nullable: true })
  async rules(@Root() rule: Rule): Promise<Array<User> | undefined> {
    return await rule.users;
  }
}
