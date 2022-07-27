import React, { useEffect } from 'react';
import * as R from 'ramda';
import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import { useDispatch } from 'react-redux';
import { fetchMedias } from '../../../actions/Media';
import { useFormatter } from '../../../components/i18n';
import { useHelper } from '../../../store';
import MediaIcon from './MediaIcon';

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

const MediasFilter = (props) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchMedias());
  }, []);
  const medias = useHelper((helper) => helper.getMedias());
  const { onAddMedia, onClearMedia, onRemoveMedia, currentMedias, fullWidth } = props;
  const mediaColor = (type) => {
    switch (type) {
      case 'newspaper':
        return '#3f51b5';
      case 'microblogging':
        return '#00bcd4';
      case 'tv':
        return '#ff9800';
      default:
        return '#ef41e1';
    }
  };
  const mediaTransform = (n) => ({
    id: n.media_id,
    label: n.media_name,
    color: mediaColor(n.media_type),
    type: n.media_type,
  });
  const mediasOptions = medias.map(mediaTransform);
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
        options={mediasOptions}
        onChange={(event, value, reason) => {
          // When removing, a null change is fired
          // We handle directly the remove through the chip deletion.
          if (value !== null) onAddMedia(value);
          if (reason === 'clear' && fullWidth) onClearMedia();
        }}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderOption={(p, option) => (
          <Box component="li" {...p}>
            <div className={classes.icon} style={{ color: option.color }}>
              <MediaIcon type={option.type} />
            </div>
            <div className={classes.text}>{option.label}</div>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            label={t('Medias')}
            size="small"
            fullWidth={true}
            {...params}
          />
        )}
      />
      {!fullWidth && (
        <div className={classes.filters}>
          {R.map(
            (currentMedia) => (
              <Chip
                key={currentMedia.id}
                classes={{ root: classes.filter }}
                label={currentMedia.label}
                onDelete={() => onRemoveMedia(currentMedia.id)}
              />
            ),
            currentMedias,
          )}
        </div>
      )}
    </div>
  );
};

export default MediasFilter;
