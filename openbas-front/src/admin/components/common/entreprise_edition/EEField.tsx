import { FunctionComponent } from 'react';
import * as React from 'react';
import { makeStyles } from '@mui/styles';
import EEChip from './EEChip';
import { useFormatter } from '../../../../components/i18n';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles({
  labelRoot: {
    '& .MuiFormLabel-root': {
      zIndex: 1,
    },
  },
});

interface EEFieldProps {
  children: React.ReactElement;
}

const EEField: FunctionComponent<EEFieldProps> = ({
  children,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const component = React.cloneElement(children, {
    label: <>{t(children.props.label)}<EEChip /></>,
  });
  return (
    <div className={classes.labelRoot}>
      {component}
    </div>
  );
};

export default EEField;
