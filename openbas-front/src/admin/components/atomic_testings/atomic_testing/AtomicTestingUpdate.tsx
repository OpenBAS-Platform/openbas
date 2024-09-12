import React, { FunctionComponent, useContext } from 'react';
import * as R from 'ramda';
import type { TeamStore } from '../../../../actions/teams/Team';
import UpdateInject from '../../common/injects/UpdateInject';
import type { Inject, InjectResultDTO } from '../../../../utils/api-types';
import { updateAtomicTesting } from '../../../../actions/atomic_testings/atomic-testing-actions';
import { InjectResultDtoContext, InjectResultDtoContextType } from '../InjectResultDtoContext';
import { useHelper } from '../../../../store';
import type { TeamsHelper } from '../../../../actions/teams/team-helper';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { fetchTeams } from '../../../../actions/teams/team-actions';
import { useAppDispatch } from '../../../../utils/hooks';
import { MESSAGING$ } from '../../../../utils/Environment';

interface Props {
  atomic: InjectResultDTO;
  open: boolean;
  handleClose: () => void;
}

const AtomicTestingUpdate: FunctionComponent<Props> = ({
  atomic,
  open,
  handleClose,
}) => {
  // Standard hooks
  const dispatch = useAppDispatch();

  // Fetching data
  const { teams } = useHelper((helper: TeamsHelper) => ({
    teams: helper.getTeams(),
  }));
  useDataLoader(() => {
    dispatch(fetchTeams());
  });

  const { updateInjectResultDto } = useContext<InjectResultDtoContextType>(InjectResultDtoContext);
  const onUpdateAtomicTesting = async (data: Inject) => {
    const toUpdate = R.pipe(
      R.pick([
        'inject_tags',
        'inject_title',
        'inject_type',
        'inject_injector_contract',
        'inject_description',
        'inject_content',
        'inject_all_teams',
        'inject_documents',
        'inject_assets',
        'inject_asset_groups',
        'inject_teams',
        'inject_tags',
      ]),
    )(data);
    updateAtomicTesting(atomic.inject_id, toUpdate).then((result: { data: InjectResultDTO }) => {
      updateInjectResultDto(result.data);
    });
  };

  return (
    <UpdateInject
      open={open}
      handleClose={handleClose}
      onUpdateInject={onUpdateAtomicTesting}
      injectId={atomic.inject_id}
      isAtomic
      teamsFromExerciseOrScenario={teams?.filter((team: TeamStore) => !team.team_contextual) ?? []}
    />
  );
};

export default AtomicTestingUpdate;
