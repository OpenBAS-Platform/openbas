import { Popover } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type React from 'react';
import { type ReactNode } from 'react';
import { useState } from 'react';

type Props = {
  simpleText: string;
  richText: ReactNode;
};

const ElementWithPopoverFragment = (props: Props) => {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <span onMouseOver={handlePopoverOpen} onMouseOut={handlePopoverClose}>{props.simpleText}</span>
      <Popover
        id="mouse-over-popover"
        sx={{ pointerEvents: 'none' }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <div style={{ padding: theme.spacing(2) }}>{props.richText}</div>
      </Popover>
    </>
  );
};

export default ElementWithPopoverFragment;
