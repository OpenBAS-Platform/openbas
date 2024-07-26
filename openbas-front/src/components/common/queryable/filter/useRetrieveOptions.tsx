import { useState } from 'react';
import { searchInjectorByIdAsOptions } from '../../../../actions/injectors/injector-action';
import { Option } from '../../../../utils/Option';
import { searchKillChainPhasesByIdAsOption } from '../../../../actions/kill_chain_phases/killChainPhase-action';

const useRetrieveOptions = () => {
  const [options, setOptions] = useState<Option[]>([]);

  const searchOptions = (filterKey: string, ids: string[]) => {
    switch (filterKey) {
      case 'injector_contract_injector':
        searchInjectorByIdAsOptions(ids).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'injector_contract_kill_chain_phases':
        searchKillChainPhasesByIdAsOption(ids).then((response) => {
          setOptions(response.data);
        });
        break;
      default:
        setOptions(ids.map((id) => ({ id, label: id })));
        break;
    }
  };

  return { options, searchOptions };
};

export default useRetrieveOptions;
