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
  entries: PopoverEntry[];
  openEdit?: boolean;
  openDelete?: boolean;
  openDuplicate?: boolean;
  setOpenEdit?: (open: boolean) => void;
  setOpenDelete?: (open: boolean) => void;
  setOpenDuplicate?: (open: boolean) => void;
  variantButtonPopover?: VariantButtonPopover;
  teams?: TeamStore[];
}

const AtomicTestingPopover: FunctionComponent<Props> = ({
  atomic,
  entries,
  openEdit,
  openDelete,
  openDuplicate,
  setOpenEdit,
  setOpenDelete,
  setOpenDuplicate,
  variantButtonPopover,
  teams,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const navigate = useNavigate();

  const [deletion, setDeletion] = useState(false);
  const [edition, setEdition] = useState(false);
  const [duplicate, setDuplicate] = useState(false);

  // Fetching data
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
      if (setOpenEdit) {
        setOpenEdit(false);
      }
    });
  };

  const submitDelete = () => {
    deleteAtomicTesting(atomic.inject_id).then(() => {
      if (setOpenDelete) {
        setOpenDelete(false);
      }
      navigate('/admin/atomic_testings');
    });
  };

  const submitDuplicate = async () => {
    await duplicateAtomicTesting(atomic.inject_id).then((result: { data: InjectResultDTO }) => {
      navigate(`/admin/atomic_testings/${result.data.inject_id}`);
    });
    if (setOpenDuplicate) {
      setOpenDuplicate(false);
    }
  };

  const submitDuplicateHandler = () => {
    submitDuplicate();
  };

  return (
    <>
      <ButtonPopover entries={entries} variant={variantButtonPopover} />
      <UpdateInject
        open={isNotEmptyField(openEdit) ? openEdit : edition}
        handleClose={() => (setOpenEdit ? setOpenEdit(false) : setEdition(false))}
        onUpdateInject={onUpdateAtomicTesting}
        inject={atomic}
        injectId={atomic.inject_id}
        isAtomic
        teamsFromExerciseOrScenario={teams?.filter((team: TeamStore) => !team.team_contextual) ?? []}
      />
      <DialogDelete
        open={isNotEmptyField(openDelete) ? openDelete : deletion}
        handleClose={() => (setOpenDelete ? setOpenDelete(false) : setDeletion(false))}
        handleSubmit={submitDelete}
        text={`${t('Do you want to delete this atomic testing:')} ${atomic.inject_title} ?`}
      />
      <DialogDuplicate
        open={isNotEmptyField(openDuplicate) ? openDuplicate : duplicate}
        handleClose={() => (setOpenDuplicate ? setOpenDuplicate(false) : setDuplicate(false))}
        handleSubmit={submitDuplicateHandler}
        text={`${t('Do you want to duplicate this atomic testing:')} ${atomic.inject_title} ?`}
      />
    </>
  );
};

export default AtomicTestingPopover;
