import { createBaseResolver, User } from '@pbotapps/common';
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
import { Rule } from '../rule/entity.js';
import { Application } from './entity.js';
import { NewApplicationInput, UpdateApplicationInput } from './input';

const BaseResolver = createBaseResolver(
  'Application',
  Application,
  AppDataSource
);

@Resolver(() => Application)
export class ApplicationResolver extends BaseResolver {
  @Mutation(() => Application, { name: `addApplication` })
  @Authorized()
  async create(
    @Arg('data') data: NewApplicationInput,
    @Ctx('user') user: User
  ): Promise<Application> {
    let application = AppDataSource.manager.create(Application, {
      ...data,
      createdBy: user.uuid,
      changedBy: user.uuid,
    });
    application = await AppDataSource.manager.save(application);
    return application;
  }

  @Mutation(() => Application, { name: `updateApplication` })
  @Authorized()
  async update(
    @Arg('data') data: UpdateApplicationInput,
    @Ctx('user') user: User
  ): Promise<Application> {
    const { uuid, ...rest } = data;

    await AppDataSource.manager.update(
      Application,
      { uuid },
      {
        ...rest,
        changedBy: user.uuid,
      }
    );

    return AppDataSource.manager.findOneBy(Application, { uuid });
  }

  @FieldResolver(() => [Rule], { nullable: true })
  async rules(@Root() app: Application): Promise<Array<Rule> | undefined> {
    return await app.rules;
  }
}
