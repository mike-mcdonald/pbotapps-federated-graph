import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import { config as loadenv } from 'dotenv';
import express from 'express';
import passport from 'passport';
import { Strategy as AnonymousStrategy } from 'passport-anonymous';
import { BearerStrategy } from 'passport-azure-ad';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';

import { ApplicationResolver } from './application/resolver.js';
import { RuleResolver } from './rule/resolver.js';
import { UserResolver } from './user/resolver.js';
import { customAuthChecker } from './auth.js';
import AppDataSource from './data-source.js';
import { User } from './user/entity.js';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { ServerInfo } from 'apollo-server';

if (process.env.NODE_ENV !== 'production') {
  loadenv();
}

function createServerInfo(
  httpServer: Server,
  subPath: string = '/'
): ServerInfo {
  const addressInfo = httpServer.address() as AddressInfo;

  const hostname =
    addressInfo.address === '' || addressInfo.address === '::'
      ? 'localhost'
      : addressInfo.address;

  const url = new URL(subPath, `http://${hostname}:${addressInfo.port}/`);

  return {
    ...addressInfo,
    server: httpServer,
    url: url.toString(),
  };
}

export async function bootstrap() {
  // to initialize initial connection with the database, register all entities
  // and "synchronize" database schema, call "initialize()" method of a newly created database
  // once in your application bootstrap

  try {
    await AppDataSource.initialize();
    console.log('✅  TypeORM connection intialized!');
  } catch (err) {
    console.error(err);
    throw new Error('Failed to initialize database');
  }

  const schema = await buildSchema({
    resolvers: [ApplicationResolver, RuleResolver, UserResolver],
    authChecker: customAuthChecker,
  });

  const app = express();

  passport.use(
    new BearerStrategy(
      {
        identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
        clientID: process.env.AZURE_CLIENT_ID,
        validateIssuer: false,
        passReqToCallback: true,
        isB2C: false,
      },
      async function (_req, token, done) {
        try {
          let user = await AppDataSource.manager.findOneBy(User, {
            oauthId: token.oid,
          });

          if (!user) {
            user = new User();
            user.email = token.upn.toLowerCase();
            user.firstName = token.given_name;
            user.lastName = token.family_name;
            user.oauthId = token.oid;

            await AppDataSource.manager.insert(User, user);
          }

          return done(null, user, token);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  passport.use(new AnonymousStrategy());

  passport.serializeUser((user: User, done) => {
    const { uuid } = user;
    done(null, uuid);
  });

  passport.deserializeUser((user: User, done) => {
    done(null, user);
  });

  app.use(passport.initialize());
  app.use(passport.authenticate(['oauth-bearer', 'anonymous']));

  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    context: ({ req }) => {
      const user = req.user || null;
      const application = '0144ffd2-1e90-4594-a0b0-8e114ea273ea';
      return { application, user };
    },
  });

  // The `listen` method launches a web server.
  const httpServer = app.listen(process.env.PORT || 4000);
  const { url } = createServerInfo(httpServer, server.graphqlPath);

  await server.start();

  server.applyMiddleware({ app });

  console.log(`🚀  Server ready at ${url}`);

  return url;
}

bootstrap();
