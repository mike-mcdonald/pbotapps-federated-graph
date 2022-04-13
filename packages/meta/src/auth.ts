import { AuthChecker } from "type-graphql";

export const customAuthChecker: AuthChecker<any> = ({ context }) => {
  // here we can read the user from context
  // and check his permission in the db against the `roles` argument
  // that comes from the `@Authorized` decorator, eg. ["ADMIN", "MODERATOR"]

  console.log("checking context", JSON.stringify(context));

  return context.user ? true : false; // or false if access is denied
};
