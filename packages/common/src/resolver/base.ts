import { GraphQLInt } from 'graphql';
import {
  Arg,
  Args,
  Authorized,
  ClassType,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';
import { DataSource, DeleteResult } from 'typeorm';
import { PaginationArgs } from './args';

// interface IBaseResolver {
//   getOne(uuid: string): Promise<any>;
//   getAll(args: PaginationArgs): Promise<any>;
//   delete(uuid: string): Promise<DeleteResult>;
// }

export function createBaseResolver<T extends ClassType>(
  suffix: string,
  objectType: T,
  dataSource: DataSource
): any {
  @Resolver(() => objectType, { isAbstract: true })
  abstract class BaseResolver {
    @Query(() => objectType, { name: `get${suffix}` })
    async getOne(@Arg('uuid') uuid: string) {
      const x = await dataSource.manager.findOneByOrFail(objectType, {
        uuid,
      });

      return x;
    }

    @Query(() => GraphQLInt, { name: `get${suffix}Count` })
    async getCount() {
      const x = await dataSource.manager.count(objectType);

      return x;
    }

    @Query(() => [objectType], { name: `getAll${suffix}` })
    getAll(@Args() { skip, take }: PaginationArgs) {
      return dataSource.manager.find(objectType, { skip, take });
    }

    @Mutation(() => objectType, { name: `delete${suffix}` })
    @Authorized()
    async delete(@Arg('uuid') uuid: string): Promise<DeleteResult> {
      const result = await dataSource.manager.delete(objectType, { uuid });

      return result;
    }
  }

  return BaseResolver;
}
