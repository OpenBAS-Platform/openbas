import React, { FunctionComponent, useContext, useState } from 'react';
import * as R from 'ramda';
import { useNavigate } from 'react-router-dom';
import type { InjectResultDTO, Inject } from '../../../../utils/api-types';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import ButtonPopover, { ButtonPopoverEntry } from '../../../../components/common/ButtonPopover';
import DialogDelete from '../../../../components/common/DialogDelete';
import { deleteAtomicTesting, fetchAtomicTestingForUpdate, updateAtomicTesting } from '../../../../actions/atomic_testings/atomic-testing-actions';
import { useHelper } from '../../../../store';
import { AtomicTestingResultContext } from '../../common/Context';
import useDataLoader from '../../../../utils/ServerSideEvent';
import type { AtomicTestingHelper } from '../../../../actions/atomic_testings/atomic-testing-helper';
import UpdateInject from '../../common/injects/UpdateInject';
import type { TeamsHelper } from '../../../../actions/teams/team-helper';
import { fetchTeams } from '../../../../actions/teams/team-actions';
import type { TeamStore } from '../../../../actions/teams/Team';
import { isNotEmptyField } from '../../../../utils/utils';

interface Props {
  atomic: InjectResultDTO;
  openEdit?: boolean;
  setOpenEdit?: React.Dispatch<React.SetStateAction<boolean>>;
}

const AtomicPopover: FunctionComponent<Props> = ({
  atomic,
  openEdit,
  setOpenEdit,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Fetching data
  const { inject, teams } = useHelper((helper: AtomicTestingHelper & TeamsHelper) => ({
    inject: helper.getInject(atomic.inject_id),
    teams: helper.getTeams(),
  }));
  useDataLoader(() => {
    dispatch(fetchAtomicTestingForUpdate(atomic.inject_id));
    dispatch(fetchTeams());
  });

  // Context
  const { onLaunchAtomicTesting } = useContext(AtomicTestingResultContext);

  // Edition
  const [edition, setEdition] = useState(false);
  const handleEdit = () => setEdition(true);
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
    await dispatch(updateAtomicTesting(inject.inject_id, toUpdate));
    onLaunchAtomicTesting();
  };

  // Deletion
  const [deletion, setDeletion] = useState(false);
  const handleDelete = () => setDeletion(true);
  const submitDelete = () => {
    dispatch(deleteAtomicTesting(atomic.inject_id));
    setDeletion(false);
    navigate('/admin/atomic_testings');
  };
  // Button Popover
  const entries: ButtonPopoverEntry[] = [
    { label: 'Update', action: setOpenEdit ? () => setOpenEdit(true) : handleEdit },
    { label: 'Delete', action: handleDelete },
  ];
  return (
    <>
      <ButtonPopover entries={entries} />
      <UpdateInject
        injectorContract={JSON.parse(atomic.inject_injector_contract.injector_contract_content)}
        open={isNotEmptyField(openEdit) ? openEdit : edition}
        handleClose={() => (setOpenEdit ? setOpenEdit(false) : setEdition(false))}
        onUpdateInject={onUpdateAtomicTesting}
        inject={inject}
        isAtomic={true}
        teamsFromExerciseOrScenario={teams?.filter((team: TeamStore) => !team.team_contextual)}
      />
      <DialogDelete
        open={deletion}
        handleClose={() => setDeletion(false)}
        handleSubmit={submitDelete}
        text={t('Do you want to delete this atomic testing ?')}
      />
    </>
  );
};

export default AtomicPopover;
