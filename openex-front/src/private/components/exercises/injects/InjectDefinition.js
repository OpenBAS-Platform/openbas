import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import withStyles from '@mui/styles/withStyles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Form } from 'react-final-form';
import { connect } from 'react-redux';
import {
  ArrowDropDownOutlined,
  ArrowDropUpOutlined,
  AttachmentOutlined,
  CastForEducationOutlined,
  CloseRounded,
} from '@mui/icons-material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import inject18n from '../../../../components/i18n';
import { fetchInjectAudiences, updateInject } from '../../../../actions/Inject';
import { fetchDocuments } from '../../../../actions/Document';
import ItemTags from '../../../../components/ItemTags';
import { storeHelper } from '../../../../actions/Schema';
import AudiencePopover from '../audiences/AudiencePopover';
import ItemBoolean from '../../../../components/ItemBoolean';
import InjectAddAudiences from './InjectAddAudiences';
import { isExerciseReadOnly } from '../../../../utils/Exercise';
import { TextField } from '../../../../components/TextField';
import { SwitchField } from '../../../../components/SwitchField';
import { EnrichedTextField } from '../../../../components/EnrichedTextField';
import InjectAddDocuments from './InjectAddDocuments';
import Loader from '../../../../components/Loader';
import DocumentType from '../../documents/DocumentType';
import DocumentPopover from '../../documents/DocumentPopover';
import { Select } from '../../../../components/Select';

const styles = (theme) => ({
  header: {
    backgroundColor: theme.palette.background.nav,
    padding: '20px 20px 20px 60px',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    left: 5,
    color: 'inherit',
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
  title: {
    float: 'left',
  },
  allAudiences: {
    float: 'right',
    marginTop: -7,
  },
  container: {
    padding: 20,
  },
});

const inlineStylesHeaders = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  audience_name: {
    float: 'left',
    width: '30%',
    fontSize: 12,
    fontWeight: '700',
  },
  audience_users_number: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  audience_enabled: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  audience_tags: {
    float: 'left',
    width: '30%',
    fontSize: 12,
    fontWeight: '700',
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
  document_attached: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  audience_name: {
    float: 'left',
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  audience_users_number: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  audience_enabled: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  audience_tags: {
    float: 'left',
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
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
  document_attached: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

class InjectDefinition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allAudiences: props.inject.inject_all_audiences,
      audiencesIds: props.inject.inject_audiences,
      documents: props.inject.inject_documents,
      audiencesSortBy: 'audience_name',
      audiencesOrderAsc: true,
      documentsSortBy: 'document_name',
      documentsOrderAsc: true,
    };
  }

  componentDidMount() {
    const { exerciseId, injectId } = this.props;
    this.props.fetchDocuments();
    this.props.fetchInjectAudiences(exerciseId, injectId);
  }

  toggleAll() {
    this.setState({ allAudiences: !this.state.allAudiences });
  }

  handleAddAudiences(audiencesIds) {
    this.setState({
      audiencesIds: [...this.state.audiencesIds, ...audiencesIds],
    });
  }

  handleRemoveAudience(audienceId) {
    this.setState({
      audiencesIds: this.state.audiencesIds.filter((a) => a !== audienceId),
    });
  }

  handleAddDocuments(documents) {
    this.setState({
      documents: [...this.state.documents, ...documents],
    });
  }

  handleRemoveDocument(documentId) {
    this.setState({
      documents: this.state.documents.filter(
        (d) => d.document_id !== documentId,
      ),
    });
  }

  toggleAttachment(documentId) {
    this.setState({
      documents: this.state.documents.map((d) => (d.document_id === documentId
        ? {
          document_id: d.document_id,
          document_attached: !d.document_attached,
        }
        : d)),
    });
  }

  audiencesReverseBy(field) {
    this.setState({
      audiencesSortBy: field,
      audiencesOrderAsc: !this.state.audiencesOrderAsc,
    });
  }

  audiencesSortHeader(field, label, isSortable) {
    const { t } = this.props;
    const { audiencesSortBy, audiencesOrderAsc } = this.state;
    const sortComponent = audiencesOrderAsc ? (
      <ArrowDropDownOutlined style={inlineStylesHeaders.iconSort} />
    ) : (
      <ArrowDropUpOutlined style={inlineStylesHeaders.iconSort} />
    );
    if (isSortable) {
      return (
        <div
          style={inlineStylesHeaders[field]}
          onClick={this.audiencesReverseBy.bind(this, field)}
        >
          <span>{t(label)}</span>
          {audiencesSortBy === field ? sortComponent : ''}
        </div>
      );
    }
    return (
      <div style={inlineStylesHeaders[field]}>
        <span>{t(label)}</span>
      </div>
    );
  }

  documentsReverseBy(field) {
    this.setState({
      documentsSortBy: field,
      documentsOrderAsc: !this.state.documentsOrderAsc,
    });
  }

  documentsSortHeader(field, label, isSortable) {
    const { t } = this.props;
    const { documentsSortBy, documentsOrderAsc } = this.state;
    const sortComponent = documentsOrderAsc ? (
      <ArrowDropDownOutlined style={inlineStylesHeaders.iconSort} />
    ) : (
      <ArrowDropUpOutlined style={inlineStylesHeaders.iconSort} />
    );
    if (isSortable) {
      return (
        <div
          style={inlineStylesHeaders[field]}
          onClick={this.documentsReverseBy.bind(this, field)}
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
  }

  onSubmit(data) {
    const { inject } = this.props;
    const { allAudiences, audiencesIds, documents } = this.state;
    const values = {
      inject_title: inject.inject_title,
      inject_contract: inject.inject_contract,
      inject_description: inject.inject_description,
      inject_tags: inject.inject_tags,
      inject_depends_duration: inject.inject_depends_duration,
      inject_depends_from_another: inject.inject_depends_from_another,
      inject_content: data,
      inject_all_audiences: allAudiences,
      inject_audiences: audiencesIds,
      inject_documents: documents,
    };
    return this.props
      .updateInject(this.props.exerciseId, this.props.inject.inject_id, values)
      .then(() => this.props.handleClose());
  }

  validate(values) {
    const { t, injectTypes, inject } = this.props;
    const errors = {};
    const injectType = R.head(
      injectTypes.filter((i) => i.contract_id === inject.inject_contract),
    );
    if (injectType && Array.isArray(injectType.fields)) {
      injectType.fields
        .filter((f) => !['audiences', 'attachments'].includes(f.key))
        .forEach((field) => {
          const value = values[field.key];
          if (field.mandatory && R.isEmpty(value)) {
            errors[field.key] = t('This field is required.');
          }
        });
    }
    return errors;
  }

  render() {
    const {
      t,
      classes,
      handleClose,
      inject,
      exerciseId,
      exercise,
      injectTypes,
      audiencesMap,
      documentsMap,
      exercisesMap,
      tagsMap,
    } = this.props;
    if (!inject) {
      return <Loader variant="inElement" />;
    }
    const {
      allAudiences,
      audiencesIds,
      documents,
      audiencesSortBy,
      audiencesOrderAsc,
      documentsSortBy,
      documentsOrderAsc,
    } = this.state;
    const injectType = R.head(
      injectTypes.filter((i) => i.contract_id === inject.inject_contract),
    );
    const audiences = audiencesIds
      .map((a) => audiencesMap[a])
      .filter((a) => a !== undefined);
    const sortAudiences = R.sortWith(
      audiencesOrderAsc
        ? [R.ascend(R.prop(audiencesSortBy))]
        : [R.descend(R.prop(audiencesSortBy))],
    );
    const sortedAudiences = sortAudiences(audiences);
    const docs = documents
      .map((d) => (documentsMap[d.document_id]
        ? {
          ...documentsMap[d.document_id],
          document_attached: d.document_attached,
        }
        : undefined))
      .filter((d) => d !== undefined);
    const sortDocuments = R.sortWith(
      documentsOrderAsc
        ? [R.ascend(R.prop(documentsSortBy))]
        : [R.descend(R.prop(documentsSortBy))],
    );
    const sortedDocuments = sortDocuments(docs);
    const hasAudiences = injectType.fields
      .map((f) => f.key)
      .includes('audiences');
    const hasAttachments = injectType.fields
      .map((f) => f.key)
      .includes('attachments');
    const initialValues = { ...inject.inject_content };
    // Enrich initialValues with default contract value
    if (inject.inject_content === null) {
      injectType.fields
        .filter((f) => !['audiences', 'attachments'].includes(f.key))
        .forEach((field) => {
          if (!initialValues[field.key]) {
            initialValues[field.key] = field.defaultValue;
          }
        });
    }
    return (
      <div>
        <div className={classes.header}>
          <IconButton
            aria-label="Close"
            className={classes.closeButton}
            onClick={handleClose.bind(this)}
            size="large"
            color="primary"
          >
            <CloseRounded fontSize="small" color="primary" />
          </IconButton>
          <Typography variant="h6" classes={{ root: classes.title }}>
            {inject.inject_title}
          </Typography>
          <div className="clearfix" />
        </div>
        <div className={classes.container}>
          <Form
            keepDirtyOnReinitialize={true}
            initialValues={initialValues}
            onSubmit={this.onSubmit.bind(this)}
            validate={this.validate.bind(this)}
            mutators={{
              setValue: ([field, value], state, { changeValue }) => {
                changeValue(state, field, () => value);
              },
            }}
          >
            {({ handleSubmit, submitting, values }) => (
              <form id="injectContentForm" onSubmit={handleSubmit}>
                {hasAudiences && (
                  <div>
                    <Typography variant="h2" style={{ float: 'left' }}>
                      {t('Targeted audiences')}
                    </Typography>
                    <FormGroup
                      row={true}
                      classes={{ root: classes.allAudiences }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={allAudiences}
                            onChange={this.toggleAll.bind(this)}
                            color="primary"
                            disabled={isExerciseReadOnly(exercise)}
                          />
                        }
                        label={<strong>{t('All audiences')}</strong>}
                      />
                    </FormGroup>
                    <div className="clearfix" />
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
                              {this.audiencesSortHeader(
                                'audience_name',
                                'Name',
                                true,
                              )}
                              {this.audiencesSortHeader(
                                'audience_users_number',
                                'Players',
                                true,
                              )}
                              {this.audiencesSortHeader(
                                'audience_enabled',
                                'Status',
                                true,
                              )}
                              {this.audiencesSortHeader(
                                'audience_tags',
                                'Tags',
                                true,
                              )}
                            </div>
                          }
                        />
                        <ListItemSecondaryAction>
                          &nbsp;
                        </ListItemSecondaryAction>
                      </ListItem>
                      {allAudiences ? (
                        <ListItem
                          classes={{ root: classes.item }}
                          divider={true}
                        >
                          <ListItemIcon>
                            <CastForEducationOutlined />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.audience_name}
                                >
                                  <i>{t('All audiences')}</i>
                                </div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.audience_users_number}
                                >
                                  <strong>
                                    {exercise.exercise_users_number}
                                  </strong>
                                </div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.audience_enabled}
                                >
                                  <ItemBoolean
                                    status={true}
                                    label={t('Enabled')}
                                    variant="list"
                                  />
                                </div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.audience_tags}
                                >
                                  <ItemTags variant="list" tags={[]} />
                                </div>
                              </div>
                            }
                          />
                          <ListItemSecondaryAction>
                            &nbsp;
                          </ListItemSecondaryAction>
                        </ListItem>
                      ) : (
                        <div>
                          {sortedAudiences.map((audience) => (
                            <ListItem
                              key={audience.audience_id}
                              classes={{ root: classes.item }}
                              divider={true}
                            >
                              <ListItemIcon>
                                <CastForEducationOutlined />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <div>
                                    <div
                                      className={classes.bodyItem}
                                      style={inlineStyles.audience_name}
                                    >
                                      {audience.audience_name}
                                    </div>
                                    <div
                                      className={classes.bodyItem}
                                      style={inlineStyles.audience_users_number}
                                    >
                                      {audience.audience_users_number}
                                    </div>
                                    <div
                                      className={classes.bodyItem}
                                      style={inlineStyles.audience_enabled}
                                    >
                                      <ItemBoolean
                                        status={audience.audience_enabled}
                                        label={
                                          audience.audience_enabled
                                            ? t('Enabled')
                                            : t('Disabled')
                                        }
                                        variant="list"
                                      />
                                    </div>
                                    <div
                                      className={classes.bodyItem}
                                      style={inlineStyles.audience_tags}
                                    >
                                      <ItemTags
                                        variant="list"
                                        tags={audience.audience_tags}
                                      />
                                    </div>
                                  </div>
                                }
                              />
                              <ListItemSecondaryAction>
                                <AudiencePopover
                                  exerciseId={exerciseId}
                                  exercise={exercise}
                                  audience={audience}
                                  onRemoveAudience={this.handleRemoveAudience.bind(
                                    this,
                                  )}
                                />
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                          <InjectAddAudiences
                            exerciseId={exerciseId}
                            injectAudiencesIds={audiencesIds}
                            handleAddAudiences={this.handleAddAudiences.bind(
                              this,
                            )}
                          />
                        </div>
                      )}
                    </List>
                  </div>
                )}
                <Typography
                  variant="h2"
                  style={{ marginTop: hasAudiences ? 30 : 0 }}
                >
                  {t('Inject data: ')}
                  <b>{injectType.name}</b>
                </Typography>
                <div style={{ marginTop: -20, overflowX: 'hidden' }}>
                  {injectType.fields
                    .filter(
                      (f) => !['audiences', 'attachments'].includes(f.key),
                    )
                    .map((field) => {
                      switch (field.type) {
                        case 'textarea':
                          return field.richText ? (
                            <EnrichedTextField
                              key={field.key}
                              name={field.key}
                              label={t(field.label)}
                              fullWidth={true}
                              style={{ marginTop: 20, height: 250 }}
                              disabled={isExerciseReadOnly(exercise)}
                            />
                          ) : (
                            <TextField
                              variant="standard"
                              key={field.key}
                              name={field.key}
                              fullWidth={true}
                              multiline={true}
                              rows={10}
                              label={t(field.label)}
                              style={{ marginTop: 20 }}
                              disabled={isExerciseReadOnly(exercise)}
                            />
                          );
                        case 'checkbox':
                          return (
                            <SwitchField
                              key={field.key}
                              name={field.key}
                              label={t(field.label)}
                              style={{ marginTop: 10 }}
                              disabled={isExerciseReadOnly(exercise)}
                            />
                          );
                        case 'select':
                          return field.cardinality === 'n' ? (
                            <Select
                              variant="standard"
                              label={t(field.label)}
                              key={field.key}
                              multiple
                              renderValue={(v) => v.map((a) => field.choices[a]).join(', ')
                              }
                              name={field.key}
                              fullWidth={true}
                              style={{ marginTop: 20 }}
                            >
                              {Object.entries(field.choices)
                                .sort((a, b) => a[0].localeCompare(b[0]))
                                .map(([k, v]) => (
                                  <MenuItem key={k} value={k}>
                                    <ListItemText>{v}</ListItemText>
                                  </MenuItem>
                                ))}
                            </Select>
                          ) : (
                            <Select
                              variant="standard"
                              label={t(field.label)}
                              key={field.key}
                              renderValue={(v) => field.choices[v]}
                              name={field.key}
                              fullWidth={true}
                              style={{ marginTop: 20 }}
                            >
                              {Object.entries(field.choices)
                                .sort((a, b) => a[0].localeCompare(b[0]))
                                .map(([k, v]) => (
                                  <MenuItem key={k} value={k}>
                                    <ListItemText>{v}</ListItemText>
                                  </MenuItem>
                                ))}
                            </Select>
                          );
                        case 'dependency-select':
                          // eslint-disable-next-line no-case-declarations
                          const depValue = values[field.dependencyField];
                          // eslint-disable-next-line no-case-declarations
                          const choices = field.choices[depValue] ?? {};
                          return field.cardinality === 'n' ? (
                            <Select
                              variant="standard"
                              label={t(field.label)}
                              key={field.key}
                              multiple
                              renderValue={(v) => v.map((a) => choices[a]).join(', ')
                              }
                              name={field.key}
                              fullWidth={true}
                              style={{ marginTop: 20 }}
                            >
                              {Object.entries(choices)
                                .sort((a, b) => a[0].localeCompare(b[0]))
                                .map(([k, v]) => (
                                  <MenuItem key={k} value={k}>
                                    <ListItemText>{v}</ListItemText>
                                  </MenuItem>
                                ))}
                            </Select>
                          ) : (
                            <Select
                              variant="standard"
                              label={t(field.label)}
                              key={field.key}
                              renderValue={(v) => choices[v]}
                              name={field.key}
                              fullWidth={true}
                              style={{ marginTop: 20 }}
                            >
                              {Object.entries(choices)
                                .sort((a, b) => a[0].localeCompare(b[0]))
                                .map(([k, v]) => (
                                  <MenuItem key={k} value={k}>
                                    <ListItemText>{v}</ListItemText>
                                  </MenuItem>
                                ))}
                            </Select>
                          );
                        default:
                          return (
                            <TextField
                              variant="standard"
                              key={field.key}
                              name={field.key}
                              fullWidth={true}
                              label={t(field.label)}
                              style={{ marginTop: 20 }}
                              disabled={isExerciseReadOnly(exercise)}
                            />
                          );
                      }
                    })}
                </div>
                <div>
                  <Typography variant="h2" style={{ marginTop: 30 }}>
                    {t('Inject documents')}
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
                            {this.documentsSortHeader(
                              'document_name',
                              'Name',
                              true,
                            )}
                            {this.documentsSortHeader(
                              'document_type',
                              'Type',
                              true,
                            )}
                            {this.documentsSortHeader(
                              'document_tags',
                              'Tags',
                              true,
                            )}
                            {this.documentsSortHeader(
                              'document_attached',
                              'Attachment',
                              true,
                            )}
                          </div>
                        }
                      />
                      <ListItemSecondaryAction>&nbsp;</ListItemSecondaryAction>
                    </ListItem>
                    {sortedDocuments.map((document) => (
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
                              <div
                                className={classes.bodyItem}
                                style={inlineStyles.document_attached}
                              >
                                <ItemBoolean
                                  status={
                                    hasAttachments
                                      ? document.document_attached
                                      : null
                                  }
                                  label={
                                    document.document_attached
                                      ? t('Yes')
                                      : t('No')
                                  }
                                  variant="list"
                                  onClick={
                                    hasAttachments
                                      ? this.toggleAttachment.bind(
                                        this,
                                        document.document_id,
                                      )
                                      : null
                                  }
                                  disabled={!hasAttachments}
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
                            onRemoveDocument={this.handleRemoveDocument.bind(
                              this,
                            )}
                            onToggleAttach={
                              hasAttachments
                                ? this.toggleAttachment.bind(this)
                                : null
                            }
                            attached={document.document_attached}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                    <InjectAddDocuments
                      exerciseId={exerciseId}
                      injectDocumentsIds={documents
                        .filter((a) => !a.inject_document_attached)
                        .map((d) => d.document_id)}
                      handleAddDocuments={this.handleAddDocuments.bind(this)}
                    />
                  </List>
                </div>
                <div style={{ float: 'right', margin: '20px 0 20px 0' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={submitting || isExerciseReadOnly(exercise)}
                  >
                    {t('Update')}
                  </Button>
                </div>
              </form>
            )}
          </Form>
        </div>
      </div>
    );
  }
}

InjectDefinition.propTypes = {
  t: PropTypes.func,
  nsdt: PropTypes.func,
  exerciseId: PropTypes.string,
  exercise: PropTypes.object,
  injectId: PropTypes.string,
  inject: PropTypes.object,
  fetchInjectAudiences: PropTypes.func,
  updateInject: PropTypes.func,
  handleClose: PropTypes.func,
  injectTypes: PropTypes.array,
  fetchDocuments: PropTypes.func,
  exercisesMap: PropTypes.object,
  tagsMap: PropTypes.object,
};

const select = (state, ownProps) => {
  const helper = storeHelper(state);
  const { injectId } = ownProps;
  const inject = helper.getInject(injectId);
  const documentsMap = helper.getDocumentsMap();
  const audiencesMap = helper.getAudiencesMap();
  return { inject, documentsMap, audiencesMap };
};

export default R.compose(
  connect(select, { fetchInjectAudiences, updateInject, fetchDocuments }),
  inject18n,
  withStyles(styles),
)(InjectDefinition);
