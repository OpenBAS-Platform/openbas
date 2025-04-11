import { Tooltip } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import useEnterpriseEdition from '../../../../utils/hooks/useEnterpriseEdition';

const useStyles = makeStyles<{ isClickable: boolean }>()((theme, { isClickable }) => ({
  container: {
    fontSize: 'xx-small',
    height: 14,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 21,
    margin: 'auto',
    borderRadius: theme.borderRadius,
    border: `1px solid ${theme.palette.ee.main}`,
    color: theme.palette.ee.main,
    backgroundColor: theme.palette.ee.background,
    cursor: isClickable ? 'pointer' : 'default',
  },
  containerFloating: {
    float: 'left',
    fontSize: 'xx-small',
    height: 14,
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 21,
    margin: '2px 0 0 6px',
    borderRadius: theme.borderRadius,
    border: `1px solid ${theme.palette.ee.main}`,
    color: theme.palette.ee.main,
    backgroundColor: theme.palette.ee.background,
    cursor: isClickable ? 'pointer' : 'default',
  },
}));

const EEChip = ({ clickable = true, floating = false, onClick = undefined }: {
  clickable?: boolean;
  onClick?: (value: boolean) => void;
  floating?: boolean;
}) => {
  const { classes } = useStyles({ isClickable: clickable });
  const isEnterpriseEdition = useEnterpriseEdition();

  return (
    <Tooltip
      title="Enterprise Edition Feature"
      className={floating ? classes.containerFloating : classes.container}
      onClick={() => clickable && !isEnterpriseEdition && onClick && onClick(true)}
    >
      <span>
        EE
      </span>
    </Tooltip>
  );
};

export default EEChip;
