import React, { FunctionComponent } from 'react';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import { makeStyles } from '@mui/styles';
import ListItem from '@mui/material/ListItem';
import type { Article, Media } from '../../../../utils/api-types';
import type { InjectExpectationsStore } from '../injects/expectations/Expectation';
import { useFormatter } from '../../../../components/i18n';
import type { Theme } from '../../../../components/Theme';
import colorStyles from '../../../../components/Color';
import MediaIcon from '../../medias/MediaIcon';

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
  media: Media;
  article: Article
  expectation: InjectExpectationsStore;
}

const MediaExpectation: FunctionComponent<Props> = ({
  media,
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
        key={media.media_id}
        divider
        sx={{ pl: 8 }}
        classes={{ root: classes.item }}
      >
        <ListItemIcon>
          <MediaIcon type={media.media_type} size="small" />
        </ListItemIcon>
        <ListItemText
          primary={
            <div className={classes.container}>
              <div className={classes.details}>
                <div className={classes.title}> {media.media_name} </div>
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

export default MediaExpectation;
