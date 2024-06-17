import { Menu, MenuItem, ToggleButton } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import React, { FunctionComponent, useState } from 'react';
import { CSVLink } from 'react-csv';
import { Data } from 'react-csv/lib/core';
import { useFormatter } from '../i18n';

export interface ButtonPopoverEntry {
  label: string;
  type?: string;
  data?: Data;
  filename?: string;
  action?: () => void | React.Dispatch<React.SetStateAction<boolean>>;
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
      <ToggleButton
        value="popover"
        size="small"
        onClick={(ev) => {
          ev.stopPropagation();
          setAnchorEl(ev.currentTarget);
        }}
      >
        <MoreVert fontSize="small" color="primary" />
      </ToggleButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {entries.map((entry, idx) => {
          if (entry.type === 'export') {
            return (
              <MenuItem key={idx}>
                <CSVLink
                  data={entry.data || []}
                  filename={entry.filename || 'data.xls'}
                >
                  {t(entry.label)}
                </CSVLink>
              </MenuItem>
            );
          }
          return (
            <MenuItem
              key={idx}
              disabled={entry.disabled}
              onClick={() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                entry.action && entry.action();
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
