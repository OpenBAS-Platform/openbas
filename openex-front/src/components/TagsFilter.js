import React, { useEffect } from 'react';
import * as R from 'ramda';
import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import { LabelOutlined } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { fetchTags } from '../actions/Tag';
import { useFormatter } from './i18n';
import { useHelper } from '../store';

const useStyles = makeStyles(() => ({
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
  thin: {
    height: 30,
  },
}));

const TagsFilter = (props) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchTags());
  }, []);
  const tags = useHelper((helper) => helper.getTags());
  const { onAddTag, onClearTag, onRemoveTag, currentTags, fullWidth } = props;
  const tagTransform = (n) => ({
    id: n.tag_id,
    label: n.tag_name,
    color: n.tag_color,
  });
  const tagsOptions = tags.map(tagTransform);
  return (
    <div>
      <Autocomplete
        sx={{ width: fullWidth ? '100%' : 250, float: 'left' }}
        selectOnFocus={true}
        openOnFocus={true}
        autoSelect={false}
        autoHighlight={true}
        hiddenLabel={true}
        size="small"
        options={tagsOptions}
        onChange={(event, value, reason) => {
          // When removing, a null change is fired
          // We handle directly the remove through the chip deletion.
          if (value !== null) onAddTag(value);
          if (reason === 'clear' && fullWidth) onClearTag();
        }}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderOption={(p, option) => (
          <Box component="li" {...p}>
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
      {!fullWidth && (
        <div className={classes.filters}>
          {R.map(
            (currentTag) => (
              <Chip
                key={currentTag.id}
                classes={{ root: classes.filter }}
                label={currentTag.label}
                onDelete={() => onRemoveTag(currentTag.id)}
              />
            ),
            currentTags,
          )}
        </div>
      )}
    </div>
  );
};

export default TagsFilter;
