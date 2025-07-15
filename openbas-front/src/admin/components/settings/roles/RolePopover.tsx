import { type FunctionComponent, useState } from 'react';

import { deleteRoles } from '../../../../actions/roles/roles-actions';
import ButtonPopover from '../../../../components/common/ButtonPopover';
import DialogDelete from '../../../../components/common/DialogDelete';
import { useFormatter } from '../../../../components/i18n';
import { type Role } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';

export interface RolePopoverProps {
  onDelete?: (result: string) => void;
  role: Role;
}

const RolePopover: FunctionComponent<RolePopoverProps> = ({ onDelete, role }) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  // Deletion
  const [deletion, setDeletion] = useState(false);

  const handleDelete = () => {
    setDeletion(true);
  };
  const submitDelete = () => {
    dispatch(deleteRoles(role.role_id)).then(
      () => {
        if (onDelete) {
          onDelete(role.role_id);
        }
      },
    );
    setDeletion(false);
  };

  // Button Popover
  const entries = [];
  if (onDelete) entries.push({
    label: 'Delete',
    action: () => handleDelete(),
  });

  return entries.length > 0 && (
    <>
      <ButtonPopover entries={entries} variant="icon" />

      <DialogDelete
        open={deletion}
        handleClose={() => setDeletion(false)}
        handleSubmit={submitDelete}
        text={`${t('Do you want to delete the role:')} ${role.role_name}?`}
      />
    </>
  );
};

export default RolePopover;
