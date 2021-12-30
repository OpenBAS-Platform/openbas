import React, { Component } from 'react';
import * as R from 'ramda';
import { withStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import { LabelOutlined } from '@mui/icons-material';
import { connect } from 'react-redux';
import { fetchTags } from '../actions/Tag';
import inject18n from './i18n';
import { storeBrowser } from '../actions/Schema';

const styles = () => ({
  input: {
    height: 50,
  },
  icon: {
    paddingTop: 4,
    display: 'inline-block',
  },
  text: {
    display: 'inline-block',
    flexGrow: 1,
    marginLeft: 10,
  },
  autoCompleteIndicator: {
    display: 'none',
  },
  filters: {
    float: 'left',
    margin: '5px 0 0 15px',
  },
  filter: {
    marginRight: 10,
  },
});

class TagsFilter extends Component {
  componentDidMount() {
    this.props.fetchTags();
  }

  render() {
    const {
      tags, t, classes, onAddTag, onRemoveRag, currentTags,
    } = this.props;
    const tagsOptions = R.map(
      (n) => ({
        id: n.tag_id,
        label: n.tag_name,
        color: n.tag_color,
      }),
      tags,
    );
    return (
      <div>
        <Autocomplete
          sx={{ width: 250, float: 'left' }}
          selectOnFocus={true}
          openOnFocus={true}
          autoSelect={false}
          autoHighlight={true}
          size="small"
          options={tagsOptions}
          onChange={(event, value) => onAddTag(value)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <div className={classes.icon} style={{ color: option.color }}>
                <LabelOutlined />
              </div>
              <div className={classes.text}>{option.label}</div>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              label={t('Tags')}
              size="small"
              fullWidth={true}
              {...params}
            />
          )}
        />
        <div className={classes.filters}>
          {R.map(
            (currentTag) => (
              <Chip
                key={currentTag.id}
                classes={{ root: classes.filter }}
                label={currentTag.label}
                onDelete={onRemoveRag.bind(this, currentTag.id)}
              />
            ),
            currentTags,
          )}
        </div>
      </div>
    );
  }
}

const select = (state) => {
  const browser = storeBrowser(state);
  return {
    tags: browser.getTags(),
  };
};

export default R.compose(
  connect(select, { fetchTags }),
  inject18n,
  withStyles(styles),
)(TagsFilter);
