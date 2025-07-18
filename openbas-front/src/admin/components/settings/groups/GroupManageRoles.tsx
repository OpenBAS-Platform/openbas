import { SecurityOutlined } from '@mui/icons-material';
import { Box, Button, Checkbox, Divider } from '@mui/material';
import { type FC, useEffect, useState } from 'react';

import { fetchRoles } from '../../../../actions/roles/roles-actions';
import Drawer from '../../../../components/common/Drawer';
import { useFormatter } from '../../../../components/i18n';
import type { Role } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';

interface GroupManageRolesProps {
  // initialState: string[];
  open: boolean;
  onClose: () => void;
  // onSubmit: (userIds: string[]) => void;
}

const GroupManageRoles: FC<GroupManageRolesProps> = (
  {
    open,
    onClose,
  },
) => {
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const handleToggleRole = (roleId: string) => {
    setSelectedRoleIds(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId],
    );
  };

  const fetchRolesToLoad = () => {
    setLoading(true);
    return dispatch(fetchRoles())
      .then((result: { entities: { roles: Record<string, Role> } }) => {
        const rolesArray = Object.values(result.entities.roles);
        setRoles(rolesArray);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (open) {
      fetchRolesToLoad();
    }
  }, [open]);
  return (
    <Drawer
      open={open}
      handleClose={onClose}
      title={t('Manage the roles of this group')}
    >
      <Box>
        {roles.map(role => (
          <div key={role.role_id}>
            <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              >
                <SecurityOutlined />
                <p>{role.role_name}</p>
              </div>
              <Checkbox
                checked={selectedRoleIds.includes(role.role_id)}
                onChange={() => handleToggleRole(role.role_id)}
              />
            </Box>
            <Divider />
          </div>
        ))}

        <div style={{
          float: 'right',
          marginTop: 20,
        }}
        >
          <Button variant="contained" style={{ marginRight: 10 }} onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button variant="contained" color="secondary" onClick={() => { console.log('ok'); }}>
            {t('Update')}
          </Button>
        </div>
      </Box>
    </Drawer>
  );
};

export default GroupManageRoles;
