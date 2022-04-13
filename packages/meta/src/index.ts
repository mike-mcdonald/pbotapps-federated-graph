import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import { config as loadenv } from "dotenv";
import express from "express";
import passport from "passport";
import { Strategy as AnonymousStrategy } from "passport-anonymous";
import { BearerStrategy } from "passport-azure-ad";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { ApplicationResolver } from "./application/resolver.js";
import { customAuthChecker } from "./auth.js";
import AppDataSource from "./data-source.js";
import { User } from "./user/entity.js";

if (process.env.NODE_ENV !== "production") {
  loadenv();
}

async function bootstrap() {
  // to initialize initial connection with the database, register all entities
  // and "synchronize" database schema, call "initialize()" method of a newly created database
  // once in your application bootstrap

  try {
    await AppDataSource.initialize();
    console.log("✅  TypeORM connection intialized!");
  } catch (err) {
    throw new Error("Failed to initialize database");
  }

  const schema = await buildSchema({
    resolvers: [ApplicationResolver],
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
        console.log("verifying the user");
        console.log(token, "was the token retreived");
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
    console.log("Serializing user", JSON.stringify(user));
    done(null, { uuid });
  });

  passport.deserializeUser((user: User, done) => {
    console.log("De-serializing user", JSON.stringify(user));
    done(null, user);
  });

  app.use(passport.initialize());
  app.use(passport.authenticate(["oauth-bearer", "anonymous"]));

  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    context: ({ req }) => {
      const user = req.user || null;
      return { user };
    },
  });

  await server.start();

  server.applyMiddleware({ app });

  // The `listen` method launches a web server.
  app.listen(process.env.PORT || 4000);

  console.log(`🚀  Server ready at http://localhost:4000${server.graphqlPath}`);
}

bootstrap();
