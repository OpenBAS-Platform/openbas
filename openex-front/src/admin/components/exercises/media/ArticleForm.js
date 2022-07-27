import React from 'react';
import { Form } from 'react-final-form';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { makeStyles } from '@mui/styles';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';
import { useFormatter } from '../../../../components/i18n';
import { TextField } from '../../../../components/TextField';
import { Autocomplete } from '../../../../components/Autocomplete';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchMedias } from '../../../../actions/Media';
import MediaIcon from '../../medias/MediaIcon';
import { EnrichedTextField } from '../../../../components/EnrichedTextField';

const useStyles = makeStyles((theme) => ({
  duration: {
    marginTop: 20,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    border: `1px solid ${theme.palette.primary.main}`,
    padding: 15,
  },
  trigger: {
    fontFamily: ' Consolas, monaco, monospace',
    fontSize: 12,
    paddingTop: 15,
    color: theme.palette.primary.main,
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
}));

const ArticleForm = ({ onSubmit, handleClose, initialValues, editing }) => {
  const { t } = useFormatter();
  const classes = useStyles();
  const dispatch = useDispatch();
  // Validation
  const validate = (values) => {
    const errors = {};
    const requiredFields = ['article_name', 'article_media'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  };
  // Fetching data
  const { medias } = useHelper((helper) => ({ medias: helper.getMedias() }));
  useDataLoader(() => {
    dispatch(fetchMedias());
  });
  // Preparing data
  const sortedMedias = R.sortWith([R.ascend(R.prop('media_name'))], medias).map(
    (n) => ({ id: n.media_id, label: n.media_name, type: n.media_type }),
  );
  const currentMedia = sortedMedias.find(
    (m) => m.id === initialValues.article_media,
  );
  const formData = { ...initialValues, article_media: currentMedia };
  // Rendering
  return (
    <Form
      keepDirtyOnReinitialize={true}
      initialValues={formData}
      onSubmit={onSubmit}
      validate={validate}
      mutators={{
        setValue: ([field, value], state, { changeValue }) => {
          changeValue(state, field, () => value);
        },
      }}
    >
      {({ handleSubmit, submitting, pristine }) => (
        <form id="articleForm" onSubmit={handleSubmit}>
          <Autocomplete
            variant="standard"
            size="small"
            name="article_media"
            label={t('Media')}
            fullWidth={true}
            multiple={false}
            options={sortedMedias}
            renderOption={(renderProps, option) => (
              <Box component="li" {...renderProps}>
                <div className={classes.icon}>
                  <MediaIcon type={option.type} />
                </div>
                <div className={classes.text}>{t(option.label)}</div>
              </Box>
            )}
            classes={{ clearIndicator: classes.autoCompleteIndicator }}
          />
          <TextField
            variant="standard"
            name="article_name"
            fullWidth={true}
            style={{ marginTop: 20 }}
            label={t('Title')}
          />
          <TextField
            variant="standard"
            name="article_author"
            fullWidth={true}
            style={{ marginTop: 20 }}
            label={t('Author')}
          />
          <EnrichedTextField
            name="article_content"
            label={t('Content')}
            fullWidth={true}
            style={{ marginTop: 20, height: 300 }}
          />
          <div style={{ float: 'right', marginTop: 20 }}>
            <Button
              onClick={handleClose}
              style={{ marginRight: 10 }}
              disabled={submitting}
            >
              {t('Cancel')}
            </Button>
            <Button
              color="secondary"
              type="submit"
              disabled={pristine || submitting}
            >
              {editing ? t('Update') : t('Create')}
            </Button>
          </div>
        </form>
      )}
    </Form>
  );
};

export default ArticleForm;
