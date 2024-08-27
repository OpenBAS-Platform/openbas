import { useState } from 'react';
import { searchInjectorsByNameAsOption } from '../../../../actions/injectors/injector-action';
import { Option } from '../../../../utils/Option';
import { searchKillChainPhasesByNameAsOption } from '../../../../actions/kill_chain_phases/killChainPhase-action';
import { searchTagAsOption } from '../../../../actions/tags/tag-action';
import { searchScenarioAsOption, searchScenarioCategoryAsOption } from '../../../../actions/scenarios/scenario-actions';
import { searchAttackPatternsByNameAsOption } from '../../../../actions/AttackPattern';

const useSearchOptions = () => {
  const [options, setOptions] = useState<Option[]>([]);

  const searchOptions = (filterKey: string, search: string = '') => {
    switch (filterKey) {
      case 'injector_contract_injector':
        searchInjectorsByNameAsOption(search).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'injector_contract_kill_chain_phases':
      case 'scenario_kill_chain_phases':
      case 'exercise_kill_chain_phases':
        searchKillChainPhasesByNameAsOption(search).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'payload_attack_patterns':
        searchAttackPatternsByNameAsOption(search).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'scenario_tags':
      case 'exercise_tags':
        searchTagAsOption(search).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'exercise_scenario':
        searchScenarioAsOption(search).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'scenario_category':
        searchScenarioCategoryAsOption(search).then((response) => {
          setOptions(response.data);
        });
        break;
      default:
    }
  };

  return {
    options,
    setOptions,
    searchOptions,
  };
};

export default useSearchOptions;
