import { useState } from 'react';

import { searchAssetGroupByIdAsOption } from '../../../../actions/asset_groups/assetgroup-action';
import { searchEndpointByIdAsOption } from '../../../../actions/assets/endpoint-actions';
import { searchAttackPatternsByIdAsOption } from '../../../../actions/AttackPattern';
import { searchExerciseByIdAsOption } from '../../../../actions/exercises/exercise-action';
import { searchInjectorByIdAsOptions } from '../../../../actions/injectors/injector-action';
import {
  searchInjectByIdAsOption,
  searchTargetOptionsById,
} from '../../../../actions/injects/inject-action';
import { searchKillChainPhasesByIdAsOption } from '../../../../actions/kill_chain_phases/killChainPhase-action';
import { searchOrganizationByIdAsOptions } from '../../../../actions/organizations/organization-actions';
import { searchScenarioByIdAsOption } from '../../../../actions/scenarios/scenario-actions';
import { searchTagByIdAsOption } from '../../../../actions/tags/tag-action';
import { searchTeamByIdAsOption } from '../../../../actions/teams/team-actions';
import { type Option } from '../../../../utils/Option';

const useRetrieveOptions = () => {
  const [options, setOptions] = useState<Option[]>([]);

  const searchOptions = (filterKey: string, ids: string[]) => {
    switch (filterKey) {
      case 'injector_contract_injector':
      case 'inject_injector_contract':
        searchInjectorByIdAsOptions(ids).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'injector_contract_kill_chain_phases':
      case 'scenario_kill_chain_phases':
      case 'exercise_kill_chain_phases':
      case 'inject_kill_chain_phases':
        searchKillChainPhasesByIdAsOption(ids).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'payload_attack_patterns':
      case 'base_attack_patterns_side':
        searchAttackPatternsByIdAsOption(ids).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'target_asset_groups':
        searchTargetOptionsById('ASSETS_GROUPS', ids).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'target_assets':
      case 'target_endpoint':
        searchTargetOptionsById('ASSETS', ids).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'asset_tags':
      case 'asset_group_tags':
      case 'exercise_tags':
      case 'inject_tags':
      case 'payload_tags':
      case 'scenario_tags':
      case 'target_tags':
      case 'team_tags':
      case 'finding_tags':
      case 'user_tags':
        searchTagByIdAsOption(ids).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'finding_asset_groups':
      case 'inject_asset_groups':
        searchAssetGroupByIdAsOption(ids).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'finding_assets':
      case 'inject_assets':
        searchEndpointByIdAsOption(ids).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'inject_teams':
        searchTeamByIdAsOption(ids).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'finding_inject_id':
        searchInjectByIdAsOption(ids).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'finding_simulation':
        searchExerciseByIdAsOption(ids).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'finding_scenario' :
      case 'exercise_scenario':
        searchScenarioByIdAsOption(ids).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'user_organization':
        searchOrganizationByIdAsOptions(ids).then((response) => {
          setOptions(response.data);
        });
        break;
      default:
        setOptions(ids.map(id => ({
          id,
          label: id,
        })));
        break;
    }
  };

  return {
    options,
    searchOptions,
  };
};

export default useRetrieveOptions;
