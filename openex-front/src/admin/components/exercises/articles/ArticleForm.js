import React, { useState } from 'react';
import { Form } from 'react-final-form';
import { Button, Box, Grid, Typography, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';
import { AttachmentOutlined, ArrowDropDownOutlined, ArrowDropUpOutlined } from '@mui/icons-material';
import { useFormatter } from '../../../../components/i18n';
import TextField from '../../../../components/TextField';
import Autocomplete from '../../../../components/Autocomplete';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchChannels } from '../../../../actions/Channel';
import { fetchDocuments } from '../../../../actions/Document';
import { fetchExercises } from '../../../../actions/Exercise';
import ChannelIcon from '../../components/channels/ChannelIcon';
import MarkDownField from '../../../../components/MarkDownField';
import DocumentType from '../../components/documents/DocumentType';
import ItemTags from '../../../../components/ItemTags';
import DocumentPopover from '../../components/documents/DocumentPopover';
import ArticleAddDocuments from './ArticleAddDocuments';

const useStyles = makeStyles(() => ({
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
  documentsIds,
  editing,
}) => {
  const { t } = useFormatter();
  const classes = useStyles();
  const dispatch = useDispatch();
  const [documentsSortBy, setDocumentsSortBy] = useState('document_name');
  const [documentsOrderAsc, setDocumentsOrderAsc] = useState(true);
  const [documents, setDocuments] = useState(documentsIds || []);
  // Validation
  const validate = (values) => {
    const errors = {};
    const requiredFields = ['article_name', 'article_channel'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  };
  // Fetching data
  const { channels, exercisesMap, documentsMap, tagsMap } = useHelper(
    (helper) => ({
      channels: helper.getChannels(),
      exercisesMap: helper.getExercisesMap(),
      documentsMap: helper.getDocumentsMap(),
      tagsMap: helper.getTagsMap(),
    }),
  );
  useDataLoader(() => {
    dispatch(fetchChannels());
    dispatch(fetchExercises());
    dispatch(fetchDocuments());
  });
  const handleAddDocuments = (docsIds) => setDocuments([...documents, ...docsIds]);
  const handleRemoveDocument = (docId) => setDocuments(documents.filter((n) => n !== docId));
  // Preparing data
  const sortedChannels = R.sortWith([R.ascend(R.prop('channel_name'))], channels).map(
    (n) => ({ id: n.channel_id, label: n.channel_name, type: n.channel_type }),
  );
  const currentChannel = sortedChannels.find(
    (m) => m.id === initialValues.article_channel,
  );
  const formData = { ...initialValues, article_channel: currentChannel };

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
      {({ handleSubmit, submitting, values }) => {
        return (
          <form id="articleForm" onSubmit={handleSubmit}>
            <Typography variant="h2" style={{ marginTop: 0 }}>
              {t('Information')}
            </Typography>
            <Autocomplete
              size="small"
              name="article_channel"
              label={t('Channel')}
              fullWidth={true}
              multiple={false}
              options={sortedChannels}
              renderOption={(renderProps, option) => (
                <Box component="li" {...renderProps}>
                  <div className={classes.icon}>
                    <ChannelIcon type={option.type} />
                  </div>
                  <div className={classes.text}>{t(option.label)}</div>
                </Box>
              )}
              classes={{ clearIndicator: classes.autoCompleteIndicator }}
            />
            <TextField
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
              style={{ marginTop: 20 }}
            />
            <Grid container={true} spacing={3} style={{ marginTop: 0 }}>
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
              {t('Documents')}
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
              {values.article_channel?.type && (
                <ArticleAddDocuments
                  exerciseId={exerciseId}
                  articleDocumentsIds={documents}
                  handleAddDocuments={handleAddDocuments}
                  channelType={values.article_channel.type}
                />
              )}
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
        );
      }}
    </Form>
  );
};

export default ArticleForm;
