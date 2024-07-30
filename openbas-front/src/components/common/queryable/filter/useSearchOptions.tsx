import { useState } from 'react';
import { searchInjectorsByNameAsOption } from '../../../../actions/injectors/injector-action';
import { Option } from '../../../../utils/Option';
import { searchKillChainPhasesByNameAsOption } from '../../../../actions/kill_chain_phases/killChainPhase-action';
import { searchTagAsOption } from '../../../../actions/tags/tag-action';

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
        searchKillChainPhasesByNameAsOption(search).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'scenario_tags':
        searchTagAsOption(search).then((response) => {
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
