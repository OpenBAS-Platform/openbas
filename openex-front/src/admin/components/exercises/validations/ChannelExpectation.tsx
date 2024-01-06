import React, { FunctionComponent } from 'react';
import { ListItem, ListItemIcon, ListItemText, Chip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import type { Article, Channel } from '../../../../utils/api-types';
import type { InjectExpectationsStore } from '../injects/expectations/Expectation';
import { useFormatter } from '../../../../components/i18n';
import type { Theme } from '../../../../components/Theme';
import colorStyles from '../../../../components/Color';
import ChannelIcon from '../../medias/channels/ChannelIcon';

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
    gap: theme.spacing(2),
  },
  details: {
    display: 'flex',
  },
  title: {
    width: '200px',
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
  channel: Channel;
  article: Article;
  expectation: InjectExpectationsStore;
}

const ChannelExpectation: FunctionComponent<Props> = ({
  channel,
  article,
  expectation,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();

  const validated = expectation.inject_expectation_result !== null;
  let label = t('Pending reading');
  if (validated) {
    label = `${t('Validated')} (${expectation.inject_expectation_score})`;
  }

  return (
    <>
      <ListItem
        key={channel.channel_id}
        divider
        sx={{ pl: 8 }}
        classes={{ root: classes.item }}
      >
        <ListItemIcon>
          <ChannelIcon type={channel.channel_type} size="small" />
        </ListItemIcon>
        <ListItemText
          primary={
            <div className={classes.container}>
              <div className={classes.details}>
                <div className={classes.title}> {channel.channel_name} </div>
                {article.article_name}
              </div>
              <div className={classes.chip}>
                <Chip
                  classes={{ root: classes.points }}
                  label={expectation.inject_expectation_expected_score}
                />
                <Chip
                  classes={{ root: classes.chipInList }}
                  style={
                    validated
                      ? colorStyles.green
                      : colorStyles.grey
                  }
                  label={label}
                />
              </div>
            </div>
          }
        />
      </ListItem>
    </>
  );
};

export default ChannelExpectation;
