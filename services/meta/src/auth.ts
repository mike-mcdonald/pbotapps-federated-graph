import { AbilityBuilder, Ability } from '@casl/ability';
import { AuthChecker } from 'type-graphql';
import AppDataSource from './data-source.js';
import { Rule } from './rule/entity';
import { User } from './user/entity';

async function defineAbility(user: User) {
  const { can, cannot, rules } = new AbilityBuilder(Ability);

  const r = (await user.rules) || [];

  r.forEach(r => {
    r.inverted
      ? cannot(r.action, r.subject, r.fields, r.conditions)
      : can(r.action, r.subject, r.fields, r.conditions);
  });

  return new Ability(rules);
}

export const customAuthChecker: AuthChecker<
  { application: string; user: User },
  Partial<Rule>
> = async ({ context }, abilities) => {
  if (!context.user) {
    return false;
  }

  if (!abilities || !abilities.length) return context.user ? true : false;

  const u = await AppDataSource.manager.findOneBy(User, {
    uuid: context.user.uuid,
    rules: { application: { uuid: context.application } },
  });

  if (!u) return false;

  console.log(`Checking '${u}' for abilities '${abilities}'...`);

  const userAbilities = await defineAbility(u);

  return abilities.every(rule =>
    userAbilities.can(rule.action, rule.subject, rule.fields)
  );
};
