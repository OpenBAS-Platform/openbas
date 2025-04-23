import { Box, Tab, Tabs } from '@mui/material';
import { Link, useLocation } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { BACK_LABEL, BACK_URI } from '../../../../../components/Breadcrumbs';
import { useFormatter } from '../../../../../components/i18n';
import type { Exercise as ExerciseType, InjectResultOverviewOutput } from '../../../../../utils/api-types';

const useStyles = makeStyles()(() => ({
  item: {
    height: 30,
    fontSize: 13,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
}));

interface Props {
  injectResultOverview: InjectResultOverviewOutput;
  exercise: ExerciseType;
  backlabel?: string | null;
  backuri?: string | null;
}

const openbasNmap = 'openbas_nmap';

const InjectIndexTabs = ({ injectResultOverview, exercise, backlabel, backuri }: Props) => {
  const { classes } = useStyles();
  const { t } = useFormatter();

  const location = useLocation();
  const tabValue = location.pathname;

  const computePath = (path: string) => {
    if (backlabel && backuri) {
      return path + `?${BACK_LABEL}=${backlabel}&${BACK_URI}=${backuri}`;
    }
    return path;
  };

  return (
    <Box mt={3} mb={0}>
      <Tabs value={tabValue}>
        <Tab
          component={Link}
          to={computePath(`/admin/simulations/${exercise.exercise_id}/injects/${injectResultOverview.inject_id}`)}
          value={`/admin/simulations/${exercise.exercise_id}/injects/${injectResultOverview.inject_id}`}
          label={t('Overview')}
          className={classes.item}
        />
        {(injectResultOverview.inject_injector_contract?.injector_contract_payload
          || injectResultOverview.inject_type === openbasNmap) && (
          <Tab
            component={Link}
            to={computePath(`/admin/simulations/${exercise.exercise_id}/injects/${injectResultOverview.inject_id}/findings`)}
            value={`/admin/simulations/${exercise.exercise_id}/injects/${injectResultOverview.inject_id}/findings`}
            label={t('Findings')}
            className={classes.item}
          />
        )}
        <Tab
          component={Link}
          to={computePath(`/admin/simulations/${exercise.exercise_id}/injects/${injectResultOverview.inject_id}/detail`)}
          value={`/admin/simulations/${exercise.exercise_id}/injects/${injectResultOverview.inject_id}/detail`}
          label={t('Execution details')}
          className={classes.item}
        />
        {
          injectResultOverview.inject_injector_contract?.injector_contract_payload && (
            <Tab
              component={Link}
              to={computePath(`/admin/simulations/${exercise.exercise_id}/injects/${injectResultOverview.inject_id}/payload_info`)}
              value={`/admin/simulations/${exercise.exercise_id}/injects/${injectResultOverview.inject_id}/payload_info`}
              label={t('Payload info')}
              className={classes.item}
            />
          )
        }
      </Tabs>
    </Box>
  );
};
export default InjectIndexTabs;
