import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { TableColumn } from '../column/entity.js';
import { getDataSource } from '../data-source.js';
import { Table } from './entity.js';

@Resolver(() => Table)
export class TableResolver {
  @FieldResolver(() => [TableColumn], { nullable: true })
  async columns(
    @Ctx() ctx,
    @Root() table: Table
  ): Promise<Array<TableColumn> | undefined> {
    const ds = getDataSource(ctx.zones);

    const res = await Promise.all(
      ds.map(async source =>
        source.manager
          .findAndCountBy(TableColumn, {
            tblId: table.id,
          })
          .then(res => ({
            count: res[1],
            items: res[0],
          }))
      )
    );

    return res.reduce((acc, curr) => {
      const { items } = curr;
      acc.push(
        ...items.map(s => {
          return s;
        })
      );
      return acc;
    }, []);
  }
}
