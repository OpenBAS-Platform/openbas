import React, { FunctionComponent, useContext } from 'react';
import * as R from 'ramda';
import { useNavigate } from 'react-router-dom';
import InjectDefinition from '../components/injects/InjectDefinition';
import { InjectContext, PermissionsContext } from '../components/Context';
import type { Inject, Tag } from '../../../utils/api-types';
import { useHelper } from '../../../store';
import type { InjectHelper } from '../../../actions/injects/inject-helper';
import type { TagsHelper } from '../../../actions/helper';
import { useAppDispatch } from '../../../utils/hooks';
import { fetchTeams } from '../../../actions/teams/team-actions';
import { createAtomicTesting } from '../../../actions/atomic_testings/atomic-testing-actions';
import useDataLoader from '../../../utils/ServerSideEvent';
import type { TeamStore } from '../../../actions/teams/Team';
import type { TeamsHelper } from '../../../actions/teams/team-helper';

interface Props {
  contractId: string;
  // as we don't know the type of the content of a contract we need to put any here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contractContent: any;
  handleClose: () => void;
  handleBack: () => void;
  handleReset: () => void;
}

const AtomicTestingCreationDetails: FunctionComponent<Props> = ({
  contractId, contractContent, handleClose, handleBack, handleReset,
}) => {
  const navigate = useNavigate();
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

  const onAddAtomicTesting = async (data: Inject) => {
    const toCreate = R.pipe(
      R.assoc('inject_tags', R.pluck('id', data.inject_tags)),
      R.assoc('inject_title', data.inject_title),
      R.assoc('inject_all_teams', data.inject_all_teams),
      R.assoc('inject_asset_groups', data.inject_asset_groups),
      R.assoc('inject_assets', data.inject_assets),
      R.assoc('inject_content', data.inject_content),
      R.assoc('inject_contract', data.inject_contract),
      R.assoc('inject_description', data.inject_description),
      R.assoc('inject_documents', data.inject_documents),
      R.assoc('inject_teams', data.inject_teams),
      R.assoc('inject_type', data.inject_type),
    )(data);
    const result = await dispatch(createAtomicTesting(toCreate));
    navigate(`/admin/atomic_testings/${result.result}`);
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
      injectorContracts={[contractContent]}
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

export default AtomicTestingCreationDetails;
