import { Scenario } from '../../utils/api-types';

export type ScenarioStore = Omit<Scenario, 'scenario_tags'> & {
  scenario_tags: string[] | undefined;
};
