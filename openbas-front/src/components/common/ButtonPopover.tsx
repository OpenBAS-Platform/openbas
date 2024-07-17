import { IconButton, Menu, MenuItem, ToggleButton, ToggleButtonProps } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import React, { FunctionComponent, useState } from 'react';
import { useFormatter } from '../i18n';

export interface ButtonPopoverEntry {
  label: string;
  action: () => void | React.Dispatch<React.SetStateAction<boolean>>;
  disabled?: boolean;
}

export type VariantButtonPopover = 'toggle' | 'icon';

interface Props {
  entries: ButtonPopoverEntry[];
  buttonProps?: ToggleButtonProps;
  variant?: VariantButtonPopover;
}

const ButtonPopover: FunctionComponent<Props> = ({
  entries,
  buttonProps,
  variant = 'toggle',
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  return (
    <>
      {variant === 'toggle'
        && <ToggleButton
          value="popover"
          size="small"
          color={'primary'}
          onClick={(ev) => {
            ev.stopPropagation();
            setAnchorEl(ev.currentTarget);
          }}
          style={{ ...buttonProps }}
           >
          <MoreVert fontSize="small" color="primary" />
        </ToggleButton>
      }
      {variant === 'icon'
        && <IconButton
          value="popover"
          size="large"
          color={'primary'}
          onClick={(ev) => {
            ev.stopPropagation();
            setAnchorEl(ev.currentTarget);
          }}
          style={{ ...buttonProps }}
           >
          <MoreVert />
        </IconButton>
      }
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {entries.map((entry) => {
          return (
            <MenuItem
              key={entry.label}
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
