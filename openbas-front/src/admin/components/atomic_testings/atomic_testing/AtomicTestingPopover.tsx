import React, { FunctionComponent, useContext, useState } from 'react';
import * as R from 'ramda';
import { useNavigate } from 'react-router-dom';
import type { AtomicTestingOutput, Inject } from '../../../../utils/api-types';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import ButtonPopover, { ButtonPopoverEntry } from '../../../../components/common/ButtonPopover';
import DialogDelete from '../../../../components/common/DialogDelete';
import { deleteAtomicTesting, fetchAtomicTestingForUpdate, updateAtomicTesting } from '../../../../actions/atomic_testings/atomic-testing-actions';
import { useHelper } from '../../../../store';
import { AtomicTestingResultContext } from '../../components/Context';
import useDataLoader from '../../../../utils/ServerSideEvent';
import type { AtomicTestingHelper } from '../../../../actions/atomic_testings/atomic-testing-helper';
import UpdateInject from '../../common/injects/UpdateInject';

interface Props {
  atomic: AtomicTestingOutput;
}

const AtomicPopover: FunctionComponent<Props> = ({
  atomic,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Fetching data
  const { inject } = useHelper((helper: AtomicTestingHelper) => ({
    inject: helper.getInject(atomic.atomic_id),
  }));
  useDataLoader(() => {
    dispatch(fetchAtomicTestingForUpdate(atomic.atomic_id));
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
        'inject_contract',
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
    dispatch(deleteAtomicTesting(atomic.atomic_id));
    setDeletion(false);
    navigate('/admin/atomic_testings');
  };
  // Button Popover
  const entries: ButtonPopoverEntry[] = [
    { label: 'Update', action: handleEdit },
    { label: 'Delete', action: handleDelete },
  ];

  return (
    <>
      <ButtonPopover entries={entries} />
      <UpdateInject
        injectorContract={JSON.parse(atomic.atomic_injector_contract.injector_contract_content)}
        open={edition}
        handleClose={() => setEdition(false)}
        onUpdateInject={onUpdateAtomicTesting}
        inject={inject}
        isAtomic
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
