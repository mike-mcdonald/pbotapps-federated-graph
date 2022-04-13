import { Arg, Args, Authorized, Mutation, Query, Resolver } from "type-graphql";
import AppDataSource from "../data-source.js";
import { Application } from "./entity.js";
import { ApplicationArgs, NewApplicationInput } from "./input.js";

@Resolver(Application)
export class ApplicationResolver {
  @Query(() => Application)
  async application(@Arg("uuid") uuid: string) {
    const application = await AppDataSource.manager.findOneBy(Application, {
      uuid,
    });
    if (!application) {
      throw new Error(uuid);
    }
    return application;
  }

  @Query(() => [Application])
  applications(@Args() { skip, take }: ApplicationArgs) {
    return AppDataSource.manager.find(Application, { skip, take });
  }

  @Mutation(() => Application)
  @Authorized()
  async addApplication(
    @Arg("newApplicationData") newApplicationData: NewApplicationInput
  ): Promise<Application> {
    let application = AppDataSource.manager.create(Application, {
      ...newApplicationData,
    });
    application = await AppDataSource.manager.save(application);
    return application;
  }

  //   @Mutation((returns) => Boolean)
  //   @Authorized(Roles.Admin)
  //   async removeApplication(@Arg("id") id: string) {
  //     try {
  //       await this.ApplicationService.removeById(id);
  //       return true;
  //     } catch {
  //       return false;
  //     }
  //   }
}
