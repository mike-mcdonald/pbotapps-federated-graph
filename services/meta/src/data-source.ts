import { NamingStrategy } from '@pbotapps/common';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'cockroachdb',
  host: 'localhost',
  port: 26257,
  username: 'meta',
  password: 'meta',
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
