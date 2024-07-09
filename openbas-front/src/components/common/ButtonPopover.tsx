import { Menu, MenuItem, ToggleButton, ToggleButtonProps } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import React, { FunctionComponent, useState } from 'react';
import { useFormatter } from '../i18n';

export interface ButtonPopoverEntry {
  label: string;
  action: () => void | React.Dispatch<React.SetStateAction<boolean>>;
  disabled?: boolean;
}

interface Props {
  entries: ButtonPopoverEntry[];
  buttonProps?: ToggleButtonProps;
}

const ButtonPopover: FunctionComponent<Props> = ({
  entries,
  buttonProps,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  return (
    <>
      <ToggleButton
        value="popover"
        size="large"
        color={'primary'}
        onClick={(ev) => {
          ev.stopPropagation();
          setAnchorEl(ev.currentTarget);
        }}
        style={{ ...buttonProps }}
      >
        <MoreVert fontSize="small" color="primary" />
      </ToggleButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {entries.map((entry, idx) => {
          return (
            <MenuItem
              key={idx}
              disabled={entry.disabled}
              onClick={() => {
                entry.action();
                setAnchorEl(null);
              }}
            >
              {t(entry.label)}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default ButtonPopover;
