import React, { FunctionComponent } from 'react';
import ListItemIcon from '@mui/material/ListItemIcon';
import { CastForEducationOutlined } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import { Audience } from '../../../../utils/api-types';
import { useHelper } from '../../../../store.ts';
import { AudiencesHelper } from '../../../../actions/helper';
import { InjectExpectationsStore } from '../injects/expectations/Expectation';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../../components/i18n.js';
import { ListItemButton } from '@mui/material';
import { Theme } from '../../../../components/Theme';
import { colorStyles } from '../../../../components/Color.ts';

const useStyles = makeStyles((theme: Theme) => ({
  item: {
    height: 40,
  },
  container: {
    display: 'flex',
    placeContent: 'space-between',
    fontSize: theme.typography.h3.fontSize,
    '& div': {
      display: 'flex',
      gap: 20
    }
  },
  chipInList: {
    height: 20,
    borderRadius: '0',
    textTransform: 'uppercase',
    width: 200,
  },
  points: {
    height: 20,
    backgroundColor: 'rgba(236, 64, 122, 0.08)',
    border: '1px solid #ec407a',
    color: '#ec407a',
  },
}));

interface Props {
  injectExpectations: InjectExpectationsStore[];
  setCurrentExpectation: (expectation: InjectExpectationsStore) => void;
}

const ManualExpectations: FunctionComponent<Props> = ({
  injectExpectations,
  setCurrentExpectation,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();

  const { audiencesMap }: { audiencesMap: Record<string, Audience> } = useHelper((helper: AudiencesHelper) => {
    return ({
      audiencesMap: helper.getAudiencesMap(),
    });
  });

  return (
    <List component="div" disablePadding>
      {injectExpectations.map((expectation) => {
        if (!expectation.inject_expectation_audience) {
          return (<></>);
        }
        const audience = audiencesMap[expectation.inject_expectation_audience] || {};
        return (
          <ListItemButton
            key={audience.audience_id}
            divider={true}
            sx={{ pl: 4 }}
            classes={{ root: classes.item }}
            onClick={() => setCurrentExpectation(expectation)}
          >
            <ListItemIcon>
              <CastForEducationOutlined fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={(
                <div className={classes.container}>
                  {audience.audience_name}
                  <div>
                    <Chip
                      classes={{ root: classes.points }}
                      label={expectation.inject_expectation_expected_score}
                    />
                    <Chip
                      classes={{ root: classes.chipInList }}
                      style={
                        expectation.inject_expectation_result
                          ? colorStyles.green
                          : colorStyles.orange
                      }
                      label={
                        expectation.inject_expectation_result
                          ? `${t('Validated')} (${
                            expectation.inject_expectation_score
                          })`
                          : t('Pending validation')
                      }
                    />
                  </div>
                </div>
              )}
            />
          </ListItemButton>
        );
      })}
    </List>
  );
};

export default ManualExpectations;
