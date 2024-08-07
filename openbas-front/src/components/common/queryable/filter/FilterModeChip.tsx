import React, { FunctionComponent } from 'react';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import { useFormatter } from '../../../i18n';
import type { Theme } from '../../../Theme';

const useStyles = makeStyles((theme: Theme) => ({
  mode: {
    borderRadius: 4,
    fontFamily: 'Consolas, monaco, monospace',
    backgroundColor: theme.palette.action?.selected,
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
  },
  hasClickEvent: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action?.disabled,
      textDecorationLine: 'underline',
    },
  },
}));

interface Props {
  onClick?: () => void;
  mode?: 'and' | 'or';
}

const FilterModeChip: FunctionComponent<Props> = ({
  onClick,
  mode,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  if (!mode) {
    return <></>;
  }

  return (
    <div
      onClick={onClick}
      className={classNames({
        [classes.mode]: true,
        [classes.hasClickEvent]: !!onClick,
      })}
    >
      {t(mode.toUpperCase())}
    </div>
  );
};

export default FilterModeChip;
