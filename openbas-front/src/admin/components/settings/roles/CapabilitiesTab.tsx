import { SecurityOutlined } from '@mui/icons-material';
import { Box, Checkbox, Divider } from '@mui/material';
import { type FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { makeStyles } from 'tss-react/mui';

import { type RoleCreateInput } from './RoleForm';

interface CapabilityNode {
  name: string;
  value: string;
  checkable: boolean;
  children?: CapabilityNode[];
}

interface CapabilitiesTabProps {
  capability: CapabilityNode;
  depth?: number;
}

const useStyles = makeStyles()(() => ({
  capability_name: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
}));

const CapabilitiesTab: FC<CapabilitiesTabProps> = ({ capability, depth = 0 }) => {
  const { classes } = useStyles();
  const { control } = useFormContext<RoleCreateInput>();
  const selected = useWatch({
    control,
    name: 'role_capabilities',
  }) ?? [];

  const toggle = (checked: boolean) =>
    checked
      ? [...selected, capability.value]
      : selected.filter(v => v !== capability.value);

  return (
    <>
      <Box ml={depth * 2} display="flex" alignItems="center" gap={1} justifyContent="space-between">
        <div className={classes.capability_name}>
          <SecurityOutlined sx={{ opacity: capability.checkable ? 1 : 0.5 }} />
          <p>{capability.name}</p>
        </div>
        {capability.checkable && capability.value
          && (
            <Controller
              name="role_capabilities"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={selected.includes(capability.value)}
                  onChange={e => field.onChange(toggle(e.target.checked))}
                />
              )}
            />
          )}

      </Box>
      <Divider />

      {capability.children?.map(child => (
        <CapabilitiesTab
          key={child.name}
          capability={child}
          depth={depth + 1}
        />
      ))}
    </>
  );
};

export default CapabilitiesTab;
