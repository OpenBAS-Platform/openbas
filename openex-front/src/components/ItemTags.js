import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withStyles, withTheme } from '@mui/styles';
import Chip from '@mui/material/Chip';
import Slide from '@mui/material/Slide';
import { hexToRGB } from '../utils/Colors';
import inject18n from './i18n';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = () => ({
  tags: {
    margin: 0,
    padding: 0,
  },
  tag: {
    height: 25,
    fontSize: 12,
    margin: '0 7px 7px 0',
  },
  tagInList: {
    fontSize: 12,
    height: 20,
    float: 'left',
    marginRight: 7,
  },
  tagInSearch: {
    height: 25,
    fontSize: 12,
    margin: '0 7px 0 0',
  },
  tagInput: {
    margin: '4px 0 0 10px',
    float: 'right',
  },
});

class ItemTags extends Component {
  render() {
    const {
      classes, t, tags, onClick, variant, theme,
    } = this.props;
    let style = classes.tag;
    if (variant === 'list') {
      style = classes.tagInList;
    }
    if (variant === 'search') {
      style = classes.tagInSearch;
    }
    const orderedTags = R.sortWith([R.ascend(R.prop('tag_name'))], tags);
    console.log(orderedTags);
    return (
      <div>
        {orderedTags.length > 0 ? (
          R.map(
            (tag) => (
              <Chip
                key={tag.tag_id}
                variant="outlined"
                classes={{ root: style }}
                label={tag.tag_name}
                style={{
                  color: tag.tag_color,
                  borderColor: tag.tag_color,
                  backgroundColor: hexToRGB(tag.tag_color),
                }}
                onClick={
                  typeof onClick === 'function'
                    ? onClick.bind(this, tag.tag_id, tag.tag_name)
                    : null
                }
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
              borderColor:
                theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
              backgroundColor: hexToRGB(
                theme.palette.mode === 'dark' ? '#ffffff' : 'transparent',
              ),
            }}
            onClick={
              typeof onClick === 'function'
                ? onClick.bind(this, null, null)
                : null
            }
          />
        )}
      </div>
    );
  }
}

ItemTags.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func,
  theme: PropTypes.object,
  variant: PropTypes.string,
  onClick: PropTypes.func,
  tags: PropTypes.array,
};

export default R.compose(inject18n, withTheme, withStyles(styles))(ItemTags);
