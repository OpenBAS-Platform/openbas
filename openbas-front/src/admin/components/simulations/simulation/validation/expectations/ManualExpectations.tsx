import React, { FunctionComponent, useState } from 'react';
import { Alert, AlertTitle, Chip, Divider, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { AssignmentTurnedIn } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import * as R from 'ramda';
import type { InjectExpectationsStore } from '../../../../common/injects/expectations/Expectation';
import { useFormatter } from '../../../../../../components/i18n';
import type { Theme } from '../../../../../../components/Theme';
import colorStyles from '../../../../../../components/Color';
import Drawer from '../../../../../../components/common/Drawer';
import ManualExpectationsValidationForm from './ManualExpectationsValidationForm';
import ExpandableText from '../../../../../../components/common/ExpendableText';
import type { Inject } from '../../../../../../utils/api-types';
import Paper from '../../../../../../components/common/Paper';

const useStyles = makeStyles((theme: Theme) => ({
  item: {
    height: 40,
  },
  container: {
    display: 'flex',
    placeContent: 'space-between',
    fontSize: theme.typography.h3.fontSize,
  },
  chip: {
    display: 'flex',
    gap: theme.spacing(3),
  },
  chipInList: {
    height: 20,
    borderRadius: 4,
    textTransform: 'uppercase',
    width: 200,
  },
  points: {
    height: 20,
    backgroundColor: 'rgba(236, 64, 122, 0.08)',
    border: '1px solid #ec407a',
    color: '#ec407a',
  },
  validationType: {
    height: 20,
    border: '1px solid',
    borderRadius: 4,
  },
}));

interface Props {
  exerciseId: string;
  inject: Inject;
  expectations: InjectExpectationsStore[];
}

const ManualExpectations: FunctionComponent<Props> = ({
  inject,
  expectations,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();

  const [currentExpectations, setCurrentExpectations] = useState<InjectExpectationsStore[] | null>(null);

  const parentExpectation = expectations.filter((e) => !e.inject_expectation_user)[0];
  const childrenExpectations = expectations.filter((e) => e.inject_expectation_user);

  const validatedCount = expectations.filter((v) => !R.isEmpty(v.inject_expectation_results)).length;
  const isAllValidated = validatedCount === expectations.length;

  const label = isAllValidated
    ? `${t('Validated')} (${parentExpectation.inject_expectation_score})`
    : t('Pending validation');

  const style = isAllValidated ? colorStyles.green : colorStyles.orange;

  return (
    <>
      <List component="div" disablePadding>
        {expectations.length > 0 && (
        <ListItemButton
          key={expectations[0].inject_expectation_name}
          divider
          sx={{ pl: 8 }}
          classes={{ root: classes.item }}
          onClick={() => setCurrentExpectations(expectations)}
        >
          <ListItemIcon>
            <AssignmentTurnedIn fontSize="small"/>
          </ListItemIcon>
          <ListItemText
            primary={(
              <div className={classes.container}>
                {expectations[0].inject_expectation_name}
                <div className={classes.chip}>
                  <Chip
                    classes={{ root: classes.validationType }}
                    label={expectations[0].inject_expectation_group ? 'At least one player' : 'All players'}
                  />
                  <Chip
                    classes={{ root: classes.points }}
                    label={expectations[0].inject_expectation_expected_score}
                  />
                  <Chip
                    classes={{ root: classes.chipInList }}
                    style={style}
                    label={label}
                  />
                </div>
              </div>
                            )}
          />
        </ListItemButton>
        )}
      </List>
      <Drawer
        open={currentExpectations !== null}
        handleClose={() => setCurrentExpectations(null)}
        title={t('Expectations of ') + inject.inject_title}
      >
        <>
          <Alert
            severity="warning"
            variant="outlined"
            style={{ position: 'relative', marginBottom: 10 }}
          >
            <AlertTitle>
              <ExpandableText
                source={
                    expectations[0].inject_expectation_group
                      ? t('At least one player (per team) must validate the expectation')
                      : t('All players (per team) must validate the expectation')
                }
                limit={120}
              />
            </AlertTitle>
          </Alert>
          <Paper>
            <ManualExpectationsValidationForm key={parentExpectation} expectation={parentExpectation}/>
          </Paper>
          <Typography variant="h5" style={{ fontWeight: 500, margin: '10px' }}>
            {t('Players')}
          </Typography>
          <div style={{ maxHeight: '80vh', overflowY: 'auto', padding: 10 }}>
            {childrenExpectations && childrenExpectations.map((e) => (
              <div key={e.inject_expectation_id}>
                <ManualExpectationsValidationForm expectation={e}/>
                <Divider style={{ margin: '20px 0' }}/>
              </div>
            ))}
          </div>
        </>
      </Drawer>
    </>
  );
};

export default ManualExpectations;
