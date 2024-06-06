import React, { FunctionComponent, useContext, useState } from 'react';
import * as R from 'ramda';
import { useNavigate } from 'react-router-dom';
import type { Inject, InjectResultDTO } from '../../../../utils/api-types';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import ButtonPopover, { ButtonPopoverEntry } from '../../../../components/common/ButtonPopover';
import DialogDelete from '../../../../components/common/DialogDelete';
import { deleteAtomicTesting, updateAtomicTesting } from '../../../../actions/atomic_testings/atomic-testing-actions';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import UpdateInject from '../../common/injects/UpdateInject';
import type { TeamsHelper } from '../../../../actions/teams/team-helper';
import { fetchTeams } from '../../../../actions/teams/team-actions';
import type { TeamStore } from '../../../../actions/teams/Team';
import { isNotEmptyField } from '../../../../utils/utils';
import { InjectResultDtoContext, InjectResultDtoContextType } from '../InjectResultDtoContext';
import type { InjectHelper } from '../../../../actions/injects/inject-helper';

interface Props {
  atomic: InjectResultDTO;
  openEdit?: boolean;
  setOpenEdit?: React.Dispatch<React.SetStateAction<boolean>>;
}

const AtomicTestingPopover: FunctionComponent<Props> = ({
  atomic,
  openEdit,
  setOpenEdit,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Fetching data
  const { updateInjectResultDto } = useContext<InjectResultDtoContextType>(InjectResultDtoContext);
  const { teams } = useHelper((helper: TeamsHelper) => ({
    teams: helper.getTeams(),
  }));
  useDataLoader(() => {
    dispatch(fetchTeams());
  });

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
    updateAtomicTesting(atomic.inject_id, toUpdate).then((result: { data: InjectResultDTO }) => {
      updateInjectResultDto(result.data);
    });
  };

  // Deletion
  const [deletion, setDeletion] = useState(false);
  const handleDelete = () => setDeletion(true);
  const submitDelete = () => {
    deleteAtomicTesting(atomic.inject_id).then(() => {
      setDeletion(false);
      navigate('/admin/atomic_testings');
    });
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
        open={isNotEmptyField(openEdit) ? openEdit : edition}
        handleClose={() => (setOpenEdit ? setOpenEdit(false) : setEdition(false))}
        onUpdateInject={onUpdateAtomicTesting}
        injectId={atomic.inject_id}
        isAtomic
        teamsFromExerciseOrScenario={teams?.filter((team: TeamStore) => !team.team_contextual) ?? []}
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

export default AtomicTestingPopover;
