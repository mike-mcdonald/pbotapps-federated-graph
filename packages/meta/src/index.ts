import { ApolloServer } from "apollo-server";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { ApplicationResolver } from "./application/resolver.js";
import AppDataSource from "./data-source.js";

async function bootstrap() {
  // to initialize initial connection with the database, register all entities
  // and "synchronize" database schema, call "initialize()" method of a newly created database
  // once in your application bootstrap

  AppDataSource.initialize()
    .then(() => {
      console.log("TypeORM connection intialized!");
    })
    .catch((error) => console.log(error));

  const schema = await buildSchema({
    resolvers: [ApplicationResolver],
  });

  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  const server = new ApolloServer({ schema });

  // The `listen` method launches a web server.
  const { url } = await server.listen();

  console.log(`🚀  Server ready at ${url}`);
}

bootstrap();
