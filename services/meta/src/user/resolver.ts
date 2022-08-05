import { createBaseResolver } from '@pbotapps/common';
import { Arg, Authorized, Mutation, Resolver } from 'type-graphql';
import AppDataSource from '../data-source.js';
import { Rule } from '../rule/entity.js';
import { User } from './entity.js';
import { NewUserInput, UpdateUserInput, UserRuleInput } from './input';

const BaseResolver = createBaseResolver('User', User, AppDataSource);

@Resolver(() => User)
export class UserResolver extends BaseResolver {
  @Mutation(() => User, { name: `addUser` })
  @Authorized<Partial<Rule>>([{ action: 'create', subject: 'User' }])
  async create(@Arg('data') data: NewUserInput): Promise<User> {
    let u = AppDataSource.manager.create(User, {
      ...data,
    });
    return AppDataSource.manager.save(u);
  }

  @Mutation(() => User, { name: `updateUser` })
  @Authorized()
  async update(@Arg('data') data: UpdateUserInput): Promise<User> {
    const { uuid, ...rest } = data;

    const u = await AppDataSource.manager.findOneByOrFail(User, { uuid });

    Object.entries(rest).forEach(([k, v]) => v && (u[k] = v));

    return AppDataSource.manager.save(u);
  }

  @Mutation(() => User)
  @Authorized()
  async addRuleToUser(@Arg('data') data: UserRuleInput): Promise<User> {
    const { userUuid, ruleUuid } = data;

    const user = await AppDataSource.manager.findOneByOrFail(User, {
      uuid: userUuid,
    });

    const rules = (await user.rules) || [];

    if (!rules.find(r => r.uuid === ruleUuid)) {
      let rule = await AppDataSource.manager.findOneByOrFail(Rule, {
        uuid: ruleUuid,
      });

      rules.push(rule);
    }

    user.rules = Promise.resolve(rules);

    return AppDataSource.manager.save(user);
  }

  @Mutation(() => User)
  @Authorized()
  async removeRuleFromUser(@Arg('data') data: UserRuleInput): Promise<User> {
    const { userUuid, ruleUuid } = data;

    let user = await AppDataSource.manager.findOneByOrFail(User, {
      uuid: userUuid,
    });

    const rules = (await user.rules) || [];

    user.rules = Promise.resolve(rules.filter(r => r.uuid !== ruleUuid));

    return AppDataSource.manager.save(user);
  }
}
