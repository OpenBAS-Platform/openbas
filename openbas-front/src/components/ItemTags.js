import React from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { makeStyles, useTheme } from '@mui/styles';
import { Chip, Slide } from '@mui/material';
import { hexToRGB } from '../utils/Colors';
import { useFormatter } from './i18n';
import { useHelper } from '../store';
import { truncate } from '../utils/String';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const useStyles = makeStyles(() => ({
  tag: {
    height: 25,
    fontSize: 12,
    margin: '0 7px 7px 0',
    borderRadius: 4,
  },
  tagInList: {
    fontSize: 12,
    height: 20,
    float: 'left',
    marginRight: 7,
    borderRadius: 4,
  },
  tagInLargeList: {
    fontSize: 12,
    height: 25,
    float: 'left',
    marginRight: 7,
    borderRadius: 4,
  },
  tagInSearch: {
    height: 25,
    fontSize: 12,
    margin: '0 7px 0 0',
    borderRadius: 4,
  },
}));

const ItemTags = (props) => {
  const { tags, variant } = props;
  const { t } = useFormatter();
  const theme = useTheme();
  const classes = useStyles();
  let style = classes.tag;
  if (variant === 'list') {
    style = classes.tagInList;
  }
  if (variant === 'largeList') {
    style = classes.tagInLargeList;
  }
  if (variant === 'search') {
    style = classes.tagInSearch;
  }
  const resolvedTags = useHelper((helper) => {
    const allTags = helper.getTags() ?? [];
    return allTags.filter((tag) => (tags ?? []).includes(tag.tag_id));
  });
  const orderedTags = R.sortWith([R.ascend(R.prop('tag_name'))], resolvedTags);
  return (
    <div>
      {orderedTags.length > 0 ? (
        R.map(
          (tag) => (
            <Chip
              key={tag.tag_id}
              variant="outlined"
              classes={{ root: style }}
              label={truncate(tag.tag_name, 10)}
              style={{
                color: tag.tag_color,
                borderColor: tag.tag_color,
                backgroundColor: hexToRGB(tag.tag_color),
              }}
            />
          ),
          R.take(3, orderedTags),
        )
      ) : (
        <Chip
          classes={{ root: style }}
          variant="outlined"
          label={t('No tag')}
          style={{
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            borderColor: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            backgroundColor: hexToRGB(
              theme.palette.mode === 'dark' ? '#ffffff' : 'transparent',
            ),
          }}
        />
      )}
    </div>
  );
};

ItemTags.propTypes = {
  variant: PropTypes.string,
  onClick: PropTypes.func,
  tags: PropTypes.array,
};

export default ItemTags;
