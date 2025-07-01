import { useState } from 'react';

import { searchAssetGroupAsOption, searchAssetGroupLinkedToFindingsAsOption } from '../../../../actions/asset_groups/assetgroup-action';
import { searchEndpointAsOption, searchEndpointLinkedToFindingsAsOption } from '../../../../actions/assets/endpoint-actions';
import { searchAttackPatternsByNameAsOption } from '../../../../actions/AttackPattern';
import { searchExerciseLinkedToFindingsAsOption } from '../../../../actions/exercises/exercise-action';
import { searchInjectorsByNameAsOption } from '../../../../actions/injectors/injector-action';
import { searchInjectLinkedToFindingsAsOption, searchTargetOptions } from '../../../../actions/injects/inject-action';
import { searchKillChainPhasesByNameAsOption } from '../../../../actions/kill_chain_phases/killChainPhase-action';
import { searchOrganizationsByNameAsOption } from '../../../../actions/organizations/organization-actions';
import { searchScenarioAsOption, searchScenarioCategoryAsOption } from '../../../../actions/scenarios/scenario-actions';
import { searchSimulationAsOptions } from '../../../../actions/simulations/simulation-action';
import { searchTagAsOption } from '../../../../actions/tags/tag-action';
import { searchTeamsAsOption } from '../../../../actions/teams/team-actions';
import { type GroupOption, type Option } from '../../../../utils/Option';
import { useFormatter } from '../../../i18n';
import { SIMULATIONS } from './constants';

const useSearchOptions = () => {
  // Standard hooks
  const { t } = useFormatter();

  const [options, setOptions] = useState<GroupOption[] | Option[]>([]);

  const searchOptions = (filterKey: string, search: string = '', contextId: string = '', defaultValues: GroupOption[] = []) => {
    switch (filterKey) {
      case SIMULATIONS:
      case 'base_simulation_side':
        searchSimulationAsOptions(search).then((response) => {
          setOptions([...defaultValues, ...response.data.map((d: Option) => ({
            ...d,
            group: 'Values',
          }))]);
        });
        break;
      case 'injector_contract_injector':
      case 'inject_injector_contract':
        searchInjectorsByNameAsOption(search).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'injector_contract_kill_chain_phases':
      case 'scenario_kill_chain_phases':
      case 'exercise_kill_chain_phases':
      case 'inject_kill_chain_phases':
        searchKillChainPhasesByNameAsOption(search).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'payload_attack_patterns':
      case 'base_attack_patterns_side':
      case 'inject_attack_patterns':
        searchAttackPatternsByNameAsOption(search).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'target_asset_groups':
        searchTargetOptions(contextId, 'ASSETS_GROUPS', search).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'target_assets':
      case 'target_endpoint':
        searchTargetOptions(contextId, 'ASSETS', search).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'target_teams':
        searchTargetOptions(contextId, 'TEAMS').then((response) => {
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
        searchTagAsOption(search).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'finding_asset_groups':
        searchAssetGroupLinkedToFindingsAsOption(search, contextId).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'inject_asset_groups':
        searchAssetGroupAsOption(search, contextId).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'finding_assets':
        searchEndpointLinkedToFindingsAsOption(search, contextId).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'inject_assets':
      case 'base_endpoint_side':
        searchEndpointAsOption(search, contextId).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'inject_teams':
        searchTeamsAsOption(search, contextId).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'finding_inject_id':
        searchInjectLinkedToFindingsAsOption(search, contextId).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'finding_simulation':
        searchExerciseLinkedToFindingsAsOption(search, contextId).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'finding_scenario':
      case 'exercise_scenario':
        searchScenarioAsOption(search).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'scenario_category':
        searchScenarioCategoryAsOption(search).then((response: { data: Option[] }) => {
          setOptions(response.data.map(d => ({
            id: d.id,
            label: t(d.label),
          })));
        });
        break;
      case 'user_organization':
        searchOrganizationsByNameAsOption(search).then((response: { data: Option[] }) => {
          setOptions(response.data.map(d => ({
            id: d.id,
            label: t(d.label),
          })));
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
