import React, { FunctionComponent, useContext } from 'react';
import InjectDefinition from '../../components/injects/InjectDefinition';
import { InjectContext, PermissionsContext } from '../../components/Context';
import type { Tag } from '../../../../utils/api-types';
import { useHelper } from '../../../../store';
import type { InjectHelper } from '../../../../actions/injects/inject-helper';
import type { TagsHelper } from '../../../../actions/helper';
import { useAppDispatch } from '../../../../utils/hooks';
import { fetchTeams } from '../../../../actions/teams/team-actions';
import { createAtomicTesting } from '../../../../actions/atomictestings/atomic-testing-actions';
import useDataLoader from '../../../../utils/ServerSideEvent';
import type { TeamStore } from '../../../../actions/teams/Team';
import type { TeamsHelper } from '../../../../actions/teams/team-helper';

interface Props {
  contractId: string;
  // as we don't know the type of the content of a contract we need to put any here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contractContent: any;
  handleClose: () => void;
  handleBack: () => void;
  handleReset: () => void;
}

const CreationInjectDetails: FunctionComponent<Props> = ({
  contractId, contractContent, handleClose, handleBack, handleReset,
}) => {
  const { permissions } = useContext(PermissionsContext);
  const dispatch = useAppDispatch();
  const { onUpdateInject } = useContext(InjectContext);
  const { tagsMap, teams }: {
    tagsMap: Record<string, Tag>,
    teams: TeamStore[],
  } = useHelper((helper: InjectHelper & TagsHelper & TeamsHelper) => ({
    tagsMap: helper.getTagsMap(),
    teams: helper.getTeams(),
  }));

  const onAddAtomicTesting = async (data) => {
    await dispatch(createAtomicTesting(data));
  };

  useDataLoader(() => {
    dispatch(fetchTeams());
  });

  return (
    <InjectDefinition
      inject={{
        inject_contract: contractId,
        inject_type: contractContent.config.type,
        inject_teams: [],
        inject_assets: [],
        inject_asset_groups: [],
        inject_documents: [],
        inject_tags: [],
      }}
      injectTypes={[contractContent]}
      handleClose={handleClose}
      tagsMap={tagsMap}
      permissions={permissions}
      teamsFromExerciseOrScenario={teams}
      articlesFromExerciseOrScenario={[]}
      variablesFromExerciseOrScenario={[]}
      onUpdateInject={onUpdateInject}
      uriVariable={''}
      allUsersNumber={0}
      usersNumber={0}
      teamsUsers={[]}
      atomicTestingCreation={true}
      onAddAtomicTesting={onAddAtomicTesting}
      handleBack={handleBack}
      handleReset={handleReset}
    />
  );
};

export default CreationInjectDetails;
