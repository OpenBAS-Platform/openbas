import { IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import React, { FunctionComponent, useState } from 'react';
import { useFormatter } from '../i18n';

export interface ButtonPopoverEntry {
  label: string;
  action: () => void;
  disabled?: boolean;
}

interface Props {
  entries: ButtonPopoverEntry[];
}

const ButtonPopover: FunctionComponent<Props> = ({
  entries,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  return (
    <>
      <IconButton
        onClick={(ev) => {
          ev.stopPropagation();
          setAnchorEl(ev.currentTarget);
        }}
        aria-haspopup="true"
        aria-label="More actions"
        size="large"
      >
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {entries.map((entry, idx) => {
          return (
            <MenuItem key={idx}
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
