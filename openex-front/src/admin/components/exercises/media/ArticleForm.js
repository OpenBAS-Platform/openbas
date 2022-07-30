import React, { useState } from 'react';
import { Form } from 'react-final-form';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { makeStyles } from '@mui/styles';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { ListItemIcon } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import {
  AttachmentOutlined,
  ArrowDropDownOutlined,
  ArrowDropUpOutlined,
} from '@mui/icons-material';
import { useFormatter } from '../../../../components/i18n';
import { TextField } from '../../../../components/TextField';
import { Autocomplete } from '../../../../components/Autocomplete';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchMedias } from '../../../../actions/Media';
import { fetchDocuments } from '../../../../actions/Document';
import { fetchExercises } from '../../../../actions/Exercise';
import MediaIcon from '../../medias/MediaIcon';
import { MarkDownField } from '../../../../components/MarkDownField';
import DocumentType from '../../documents/DocumentType';
import ItemTags from '../../../../components/ItemTags';
import DocumentPopover from '../../documents/DocumentPopover';
import ArticleAddDocuments from './ArticleAddDocuments';

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
  itemHead: {
    paddingLeft: 10,
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  item: {
    paddingLeft: 10,
    height: 50,
  },
  bodyItem: {
    height: '100%',
    fontSize: 13,
  },
  itemIcon: {
    color: theme.palette.primary.main,
  },
}));

const inlineStylesHeaders = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  document_name: {
    float: 'left',
    width: '35%',
    fontSize: 12,
    fontWeight: '700',
  },
  document_type: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  document_tags: {
    float: 'left',
    width: '30%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  document_name: {
    float: 'left',
    width: '35%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  document_type: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  document_tags: {
    float: 'left',
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const ArticleForm = ({
  exerciseId,
  onSubmit,
  handleClose,
  initialValues,
  imagesIds,
  editing,
}) => {
  const { t } = useFormatter();
  const classes = useStyles();
  const dispatch = useDispatch();
  const [documentsSortBy, setDocumentsSortBy] = useState('document_name');
  const [documentsOrderAsc, setDocumentsOrderAsc] = useState(true);
  const [documents, setDocuments] = useState(imagesIds || []);
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
  const { medias, exercisesMap, documentsMap, tagsMap } = useHelper(
    (helper) => ({
      medias: helper.getMedias(),
      exercisesMap: helper.getExercisesMap(),
      documentsMap: helper.getDocumentsMap(),
      tagsMap: helper.getTagsMap(),
    }),
  );
  useDataLoader(() => {
    dispatch(fetchMedias());
    dispatch(fetchExercises());
    dispatch(fetchDocuments());
  });
  const handleAddDocuments = (documentsIds) => setDocuments([...documents, ...documentsIds]);
  const handleRemoveDocument = (documentId) => setDocuments(documents.filter((n) => n !== documentId));
  // Preparing data
  const sortedMedias = R.sortWith([R.ascend(R.prop('media_name'))], medias).map(
    (n) => ({ id: n.media_id, label: n.media_name, type: n.media_type }),
  );
  const currentMedia = sortedMedias.find(
    (m) => m.id === initialValues.article_media,
  );
  const formData = { ...initialValues, article_media: currentMedia };

  const documentsReverseBy = (field) => {
    setDocumentsSortBy(field);
    setDocumentsOrderAsc(!documentsSortBy);
  };

  const documentsSortHeader = (field, label, isSortable) => {
    const sortComponent = documentsOrderAsc ? (
      <ArrowDropDownOutlined style={inlineStylesHeaders.iconSort} />
    ) : (
      <ArrowDropUpOutlined style={inlineStylesHeaders.iconSort} />
    );
    if (isSortable) {
      return (
        <div
          style={inlineStylesHeaders[field]}
          onClick={() => documentsReverseBy(field)}
        >
          <span>{t(label)}</span>
          {documentsSortBy === field ? sortComponent : ''}
        </div>
      );
    }
    return (
      <div style={inlineStylesHeaders[field]}>
        <span>{t(label)}</span>
      </div>
    );
  };

  const submitForm = (data) => {
    return onSubmit({ ...data, article_documents: documents });
  };

  // Rendering
  return (
    <Form
      keepDirtyOnReinitialize={true}
      initialValues={formData}
      onSubmit={submitForm}
      validate={validate}
      mutators={{
        setValue: ([field, value], state, { changeValue }) => {
          changeValue(state, field, () => value);
        },
      }}
    >
      {({ handleSubmit, submitting }) => (
        <form id="articleForm" onSubmit={handleSubmit}>
          <Typography variant="h2" style={{ marginTop: 0 }}>
            {t('Information')}
          </Typography>
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
          <MarkDownField
            name="article_content"
            label={t('Content')}
            fullWidth={true}
            style={{ marginTop: 20, height: 300 }}
          />
          <Grid container={true} spacing={3} style={{ marginTop: -40 }}>
            <Grid item={true} xs={4}>
              <TextField
                variant="standard"
                name="article_comments"
                fullWidth={true}
                type="number"
                label={t('Comments')}
              />
            </Grid>
            <Grid item={true} xs={4}>
              <TextField
                variant="standard"
                name="article_shares"
                fullWidth={true}
                type="number"
                label={t('Shares')}
              />
            </Grid>
            <Grid item={true} xs={4}>
              <TextField
                variant="standard"
                name="article_likes"
                fullWidth={true}
                type="number"
                label={t('Likes')}
              />
            </Grid>
          </Grid>
          <Typography variant="h2" style={{ marginTop: 30 }}>
            {t('Images')}
          </Typography>
          <List>
            <ListItem
              classes={{ root: classes.itemHead }}
              divider={false}
              style={{ paddingTop: 0 }}
            >
              <ListItemIcon>
                <span
                  style={{
                    padding: '0 8px 0 8px',
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  &nbsp;
                </span>
              </ListItemIcon>
              <ListItemText
                primary={
                  <div>
                    {documentsSortHeader('document_name', 'Name', true)}
                    {documentsSortHeader('document_type', 'Type', true)}
                    {documentsSortHeader('document_tags', 'Tags', true)}
                  </div>
                }
              />
              <ListItemSecondaryAction>&nbsp;</ListItemSecondaryAction>
            </ListItem>
            {documents.map((documentId) => {
              const document = documentsMap[documentId] || {};
              return (
                <ListItem
                  key={document.document_id}
                  classes={{ root: classes.item }}
                  divider={true}
                  button={true}
                  component="a"
                  href={`/api/documents/${document.document_id}/file`}
                >
                  <ListItemIcon>
                    <AttachmentOutlined />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <div>
                        <div
                          className={classes.bodyItem}
                          style={inlineStyles.document_name}
                        >
                          {document.document_name}
                        </div>
                        <div
                          className={classes.bodyItem}
                          style={inlineStyles.document_type}
                        >
                          <DocumentType
                            type={document.document_type}
                            variant="list"
                          />
                        </div>
                        <div
                          className={classes.bodyItem}
                          style={inlineStyles.document_tags}
                        >
                          <ItemTags
                            variant="list"
                            tags={document.document_tags}
                          />
                        </div>
                      </div>
                    }
                  />
                  <ListItemSecondaryAction>
                    <DocumentPopover
                      exerciseId={exerciseId}
                      document={document}
                      exercisesMap={exercisesMap}
                      tagsMap={tagsMap}
                      removeChoice={t('Remove from the media pressure')}
                      onRemoveDocument={handleRemoveDocument}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
            <ArticleAddDocuments
              exerciseId={exerciseId}
              articleDocumentsIds={documents}
              handleAddDocuments={handleAddDocuments}
            />
          </List>
          <div style={{ float: 'right', marginTop: 20 }}>
            <Button
              onClick={handleClose}
              style={{ marginRight: 10 }}
              disabled={submitting}
            >
              {t('Cancel')}
            </Button>
            <Button color="secondary" type="submit" disabled={submitting}>
              {editing ? t('Update') : t('Create')}
            </Button>
          </div>
        </form>
      )}
    </Form>
  );
};

export default ArticleForm;
