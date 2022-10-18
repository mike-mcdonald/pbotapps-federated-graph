import { NamingStrategy } from '@pbotapps/common';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'cockroachdb',
  host: process.env.DATASOURCE_HOST,
  port: Number.parseInt(process.env.DATASOURCE_PORT),
  username: process.env.DATASOURCE_USERNAME,
  password: process.env.DATASOURCE_PASSWORD,
  database: 'meta',
  entities: ['./**/entity.js'],
  migrations: [
    /*...*/
  ],
  migrationsTableName: 'typeorm_migrations',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: false,
  namingStrategy: new NamingStrategy(),
});
