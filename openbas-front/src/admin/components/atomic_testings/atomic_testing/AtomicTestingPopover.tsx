import React, { FunctionComponent, useContext, useState } from 'react';
import * as R from 'ramda';
import { useNavigate } from 'react-router-dom';
import type { Inject, InjectResultDTO } from '../../../../utils/api-types';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import ButtonPopover, { PopoverEntry, VariantButtonPopover } from '../../../../components/common/ButtonPopover';
import DialogDelete from '../../../../components/common/DialogDelete';
import { deleteAtomicTesting, duplicateAtomicTesting, updateAtomicTesting } from '../../../../actions/atomic_testings/atomic-testing-actions';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import UpdateInject from '../../common/injects/UpdateInject';
import type { TeamsHelper } from '../../../../actions/teams/team-helper';
import { fetchTeams } from '../../../../actions/teams/team-actions';
import type { TeamStore } from '../../../../actions/teams/Team';
import { InjectResultDtoContext, InjectResultDtoContextType } from '../InjectResultDtoContext';
import DialogDuplicate from '../../../../components/common/DialogDuplicate';
import { isNotEmptyField } from '../../../../utils/utils';

interface Props {
  atomic: InjectResultDTO;
  openEdit?: boolean;
  setOpenEdit?: (id: string | null) => void;
  variantButtonPopover?: VariantButtonPopover;
}

const AtomicTestingPopover: FunctionComponent<Props> = ({
  atomic,
  openEdit,
  setOpenEdit,
  variantButtonPopover,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [edition, setEdition] = useState(false);
  const [deletion, setDeletion] = useState(false);
  const [duplicate, setDuplicate] = useState(false);

  // Fetching data
  const { updateInjectResultDto } = useContext<InjectResultDtoContextType>(InjectResultDtoContext);
  const { teams } = useHelper((helper: TeamsHelper) => ({
    teams: helper.getTeams(),
  }));
  useDataLoader(() => {
    dispatch(fetchTeams());
  });

  // UPDATE
  const submitUpdateAtomicTesting = async (data: Inject) => {
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
      if (setOpenEdit) {
        setOpenEdit(null);
      }
    });
  };

  // DUPLICATE
  const submitDuplicate = async () => {
    await duplicateAtomicTesting(atomic.inject_id).then((result: { data: InjectResultDTO }) => {
      navigate(`/admin/atomic_testings/${result.data.inject_id}`);
    });
    setDuplicate(false);
  };

  // DELETE
  const submitDelete = () => {
    deleteAtomicTesting(atomic.inject_id).then(() => {
      setDeletion(false);
      navigate('/admin/atomic_testings');
    });
  };

  const entries: PopoverEntry[] = [
    { label: 'Update', action: () => (isNotEmptyField(setOpenEdit) ? setOpenEdit(atomic.inject_id) : setEdition(true)) },
    { label: 'Duplicate', action: () => setDuplicate(true) },
    { label: 'Delete', action: () => setDeletion(true) }];

  return (
    <>
      <ButtonPopover entries={entries} variant={variantButtonPopover}/>
      <UpdateInject
        open={isNotEmptyField(openEdit) ? openEdit : edition}
        handleClose={() => (setOpenEdit ? setOpenEdit(null) : setEdition(false))}
        onUpdateInject={submitUpdateAtomicTesting}
        injectId={atomic.inject_id}
        isAtomic
        teamsFromExerciseOrScenario={teams?.filter((team: TeamStore) => !team.team_contextual) ?? []}
      />
      <DialogDelete
        open={deletion}
        handleClose={() => setDeletion(false)}
        handleSubmit={submitDelete}
        text={`${t('Do you want to delete this atomic testing:')} ${atomic.inject_title} ?`}
      />
      <DialogDuplicate
        open={duplicate}
        handleClose={() => setDuplicate(false)}
        handleSubmit={submitDuplicate}
        text={`${t('Do you want to duplicate this atomic testing:')} ${atomic.inject_title} ?`}
      />
    </>
  );
};

export default AtomicTestingPopover;
