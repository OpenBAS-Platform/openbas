import { makeStyles } from '@mui/styles';
import { CSSProperties, FunctionComponent } from 'react';

const useStyles = makeStyles(() => ({
}));

const inlineStyles: Record<string, CSSProperties> = {
  inject_title: {
    width: '40%',
    cursor: 'default',
  },
  tracking_sent_date: {
    width: '40%',
  },
  status_name: {
    width: '20%',
  },
};

interface Props {
  goTo?: (testId: string) => string;
}

const ScenarioTests: FunctionComponent<Props> = ({
  goTo,
}) => {
};

export default ScenarioTests;
