import { Args, Ctx, Query, Resolver } from 'type-graphql';
import { getDataSource } from '../data-source.js';
import { Zone, ZoneType } from '../zone/entity.js';
import { Schema } from './entity.js';
import { FindSchemaInput } from './input.js';

export async function findSchema(
  context: { zones: Array<string> },
  args: FindSchemaInput
): Promise<Array<Schema>> {
  const { schema } = args;

  let zones: ZoneType[] | undefined = args.zone
    ? [args.zone]
    : context.zones
    ? (context.zones as ZoneType[])
    : undefined;

  if (!zones)
    throw new Error(
      `Could not determine zone. Either pass a zone explicitly, or resolve this from a zone object.`
    );

  const res = zones.map(async zone => {
    const ds = getDataSource(zone).shift();

    return ds.manager
      .findAndCountBy(
        Schema,
        schema
          ? {
              name: schema,
            }
          : {}
      )
      .then(res => {
        return res[0].map(s => {
          const z = new Zone();
          z.name = zone;
          return {
            ...s,
            zone: Promise.resolve(z),
          };
        });
      });
  });

  const x = await Promise.all(res);

  return x.reduce((acc, curr) => {
    acc.push(...curr);
    return acc;
  }, []);
}

@Resolver(() => Schema)
export class SchemaResolver {
  @Query(() => [Schema])
  findSchema(
    @Ctx() ctx,
    @Args() args: FindSchemaInput
  ): Promise<Array<Schema>> {
    return findSchema(ctx, args);
  }
}
