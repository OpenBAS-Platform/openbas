import React, { FunctionComponent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AtomicTestingOutput } from '../../../../utils/api-types';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import ButtonPopover, { ButtonPopoverEntry } from '../../../../components/common/ButtonPopover';
import DialogDelete from '../../../../components/common/DialogDelete';
import { deleteAtomicTesting, fetchAtomicTestingForUpdate } from '../../../../actions/atomictestings/atomic-testing-actions';
import useDataLoader from '../../../../utils/ServerSideEvent';

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
  useDataLoader(() => {
    dispatch(fetchAtomicTestingForUpdate(atomic.atomic_id));
  });

  // Edition
  const [edition, setEdition] = useState(false);
  const handleEdit = () => setEdition(true);

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
