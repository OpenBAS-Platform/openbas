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
import InputLabel from '@mui/material/InputLabel';
import { connect } from 'react-redux';
import {
  ArrowDropDownOutlined,
  ArrowDropUpOutlined,
  AttachmentOutlined,
  CastForEducationOutlined,
  CloseRounded,
  ControlPointOutlined,
  DeleteOutlined,
  EmojiEventsOutlined,
  HelpOutlineOutlined,
} from '@mui/icons-material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import Slide from '@mui/material/Slide';
import inject18n from '../../../../components/i18n';
import { fetchInjectAudiences, updateInject } from '../../../../actions/Inject';
import { fetchDocuments } from '../../../../actions/Document';
import { fetchExerciseArticles, fetchMedias } from '../../../../actions/Media';
import { fetchChallenges } from '../../../../actions/Challenge';
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
import ArticlePopover from '../articles/ArticlePopover';
import InjectAddArticles from './InjectAddArticles';
import MediaIcon from '../../medias/MediaIcon';
import ChallengePopover from '../../challenges/ChallengePopover';
import InjectAddChallenges from './InjectAddChallenges';
import AvailableVariablesDialog from '../variables/AvailableVariablesDialog';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

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
  tuple: {
    marginTop: 5,
    paddingTop: 0,
    paddingLeft: 0,
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
  errorColor: {
    color: theme.palette.error.main,
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
  article_media_type: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  article_media_name: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  article_name: {
    float: 'left',
    width: '30%',
    fontSize: 12,
    fontWeight: '700',
  },
  article_author: {
    float: 'left',
    fontSize: 12,
    fontWeight: '700',
  },
  challenge_category: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  challenge_name: {
    float: 'left',
    width: '35%',
    fontSize: 12,
    fontWeight: '700',
  },
  challenge_tags: {
    float: 'left',
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
  article_media_type: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  article_media_name: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  article_name: {
    float: 'left',
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  article_author: {
    float: 'left',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  challenge_category: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  challenge_name: {
    float: 'left',
    width: '35%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  challenge_tags: {
    float: 'left',
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
      articlesIds: props.inject.inject_content?.articles || [],
      articlesSortBy: 'article_name',
      articlesOrderAsc: true,
      challengesIds: props.inject.inject_content?.challenges || [],
      challengesSortBy: 'challenge_name',
      challengesOrderAsc: true,
      openVariables: false,
    };
  }

  componentDidMount() {
    const { exerciseId, injectId } = this.props;
    this.props.fetchDocuments();
    this.props.fetchInjectAudiences(exerciseId, injectId);
    this.props.fetchExerciseArticles(exerciseId);
    this.props.fetchMedias();
    this.props.fetchChallenges();
  }

  toggleAll() {
    this.setState({ allAudiences: !this.state.allAudiences });
  }

  handleOpenVariables() {
    this.setState({ openVariables: true });
  }

  handleCloseVariables() {
    this.setState({ openVariables: false });
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

  handleAddArticles(articlesIds) {
    this.setState({
      articlesIds: [...this.state.articlesIds, ...articlesIds],
    });
  }

  handleRemoveArticle(articleId) {
    this.setState({
      articlesIds: this.state.articlesIds.filter((a) => a !== articleId),
    });
  }

  handleAddChallenges(challengesIds) {
    this.setState({
      challengesIds: [...this.state.challengesIds, ...challengesIds],
    });
  }

  handleRemoveChallenge(challengeId) {
    this.setState({
      challengesIds: this.state.challengesIds.filter((a) => a !== challengeId),
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

  selectTupleFieldType(name, type) {
    this.setState({
      tupleFieldTypes: R.assoc(name, type, this.state.tupleFieldTypes),
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

  articlesReverseBy(field) {
    this.setState({
      articlesSortBy: field,
      articlesOrderAsc: !this.state.articlesOrderAsc,
    });
  }

  articlesSortHeader(field, label, isSortable) {
    const { t } = this.props;
    const { articlesSortBy, articlesOrderAsc } = this.state;
    const sortComponent = articlesOrderAsc ? (
      <ArrowDropDownOutlined style={inlineStylesHeaders.iconSort} />
    ) : (
      <ArrowDropUpOutlined style={inlineStylesHeaders.iconSort} />
    );
    if (isSortable) {
      return (
        <div
          style={inlineStylesHeaders[field]}
          onClick={this.articlesReverseBy.bind(this, field)}
        >
          <span>{t(label)}</span>
          {articlesSortBy === field ? sortComponent : ''}
        </div>
      );
    }
    return (
      <div style={inlineStylesHeaders[field]}>
        <span>{t(label)}</span>
      </div>
    );
  }

  challengesReverseBy(field) {
    this.setState({
      challengesSortBy: field,
      challengesOrderAsc: !this.state.challengesOrderAsc,
    });
  }

  challengesSortHeader(field, label, isSortable) {
    const { t } = this.props;
    const { challengesSortBy, challengesOrderAsc } = this.state;
    const sortComponent = challengesOrderAsc ? (
      <ArrowDropDownOutlined style={inlineStylesHeaders.iconSort} />
    ) : (
      <ArrowDropUpOutlined style={inlineStylesHeaders.iconSort} />
    );
    if (isSortable) {
      return (
        <div
          style={inlineStylesHeaders[field]}
          onClick={this.challengesReverseBy.bind(this, field)}
        >
          <span>{t(label)}</span>
          {challengesSortBy === field ? sortComponent : ''}
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
    const { inject, injectTypes } = this.props;
    const injectType = R.head(
      injectTypes.filter((i) => i.contract_id === inject.inject_contract),
    );
    const hasArticles = injectType.fields
      .map((f) => f.key)
      .includes('articles');
    const hasChallenges = injectType.fields
      .map((f) => f.key)
      .includes('challenges');
    const finalData = {};
    if (hasArticles) {
      finalData.articles = this.state.articlesIds;
    }
    if (hasChallenges) {
      finalData.challenges = this.state.challengesIds;
    }
    injectType.fields
      .filter(
        (f) => !['audiences', 'articles', 'challenges', 'attachments'].includes(
          f.key,
        ),
      )
      .forEach((field) => {
        if (field.type === 'number') {
          finalData[field.key] = parseInt(data[field.key], 10);
        } else if (
          field.type === 'textarea'
          && field.richText
          && data[field.key]
          && data[field.key].length > 0
        ) {
          finalData[field.key] = data[field.key]
            .replaceAll(
              '&lt;#list challenges as challenge&gt;',
              '<#list challenges as challenge>',
            )
            .replaceAll(
              '&lt;#list articles as article&gt;',
              '<#list articles as article>',
            )
            .replaceAll('&lt;/#list&gt;', '</#list>');
        } else if (data[field.key] && field.type === 'tuple') {
          if (field.cardinality && field.cardinality === '1') {
            if (finalData[field.key].type === 'attachment') {
              finalData[field.key] = {
                key: data[field.key].key,
                value: `${field.tupleFilePrefix}${data[field.key].value}`,
              };
            } else {
              finalData[field.key] = R.dissoc('type', data[field.key]);
            }
          } else {
            finalData[field.key] = data[field.key].map((pair) => {
              if (pair.type === 'attachment') {
                return {
                  key: pair.key,
                  value: `${field.tupleFilePrefix}${pair.value}`,
                };
              }
              return R.dissoc('type', pair);
            });
          }
        } else {
          finalData[field.key] = data[field.key];
        }
      });
    const { allAudiences, audiencesIds, documents } = this.state;
    const values = {
      inject_title: inject.inject_title,
      inject_contract: inject.inject_contract,
      inject_description: inject.inject_description,
      inject_tags: inject.inject_tags,
      inject_depends_duration: inject.inject_depends_duration,
      inject_depends_from_another: inject.inject_depends_from_another,
      inject_content: finalData,
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
        .filter(
          (f) => !['audiences', 'articles', 'challenges', 'attachments'].includes(
            f.key,
          ),
        )
        .forEach((field) => {
          const value = values[field.key];
          if (field.mandatory && (value === undefined || R.isEmpty(value))) {
            errors[field.key] = t('This field is required.');
          }
        });
    }
    return errors;
  }

  renderFields(renderedFields, values, attachedDocs) {
    const { exercise, classes, t } = this.props;
    return (
      <div>
        {renderedFields.map((field) => {
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
            case 'number':
              return (
                <TextField
                  variant="standard"
                  key={field.key}
                  name={field.key}
                  fullWidth={true}
                  type="number"
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
                  style={{ marginTop: 20 }}
                  disabled={isExerciseReadOnly(exercise)}
                />
              );
            case 'tuple':
              return (
                <div key={field.key}>
                  <FieldArray name={field.key}>
                    {({ fields, meta }) => (
                      <div>
                        <div style={{ marginTop: 20 }}>
                          <InputLabel
                            variant="standard"
                            shrink={true}
                            disabled={isExerciseReadOnly(exercise)}
                          >
                            {t(field.label)}
                            {field.cardinality === 'n' && (
                              <IconButton
                                onClick={() => fields.push({
                                  type: 'text',
                                  key: '',
                                  value: '',
                                })
                                }
                                aria-haspopup="true"
                                size="medium"
                                style={{ marginTop: -2 }}
                                disabled={isExerciseReadOnly(exercise)}
                                color="primary"
                              >
                                <ControlPointOutlined />
                              </IconButton>
                            )}
                            {meta.error && meta.touched && (
                              <div className={classes.errorColor}>
                                {meta.error}
                              </div>
                            )}
                          </InputLabel>
                        </div>
                        <List style={{ marginTop: -20 }}>
                          {fields.map((name, index) => {
                            return (
                              <ListItem
                                key={`${field.key}_list_${index}`}
                                classes={{ root: classes.tuple }}
                                divider={false}
                              >
                                <Select
                                  variant="standard"
                                  name={`${name}.type`}
                                  fullWidth={true}
                                  label={t('Type')}
                                  style={{ marginRight: 20 }}
                                  disabled={isExerciseReadOnly(exercise)}
                                >
                                  <MenuItem key="text" value="text">
                                    <ListItemText>{t('Text')}</ListItemText>
                                  </MenuItem>
                                  {field.contractAttachment && (
                                    <MenuItem
                                      key="attachment"
                                      value="attachment"
                                    >
                                      <ListItemText>
                                        {t('Attachment')}
                                      </ListItemText>
                                    </MenuItem>
                                  )}
                                </Select>
                                <TextField
                                  variant="standard"
                                  name={`${name}.key`}
                                  fullWidth={true}
                                  label={t('Key')}
                                  style={{ marginRight: 20 }}
                                  disabled={isExerciseReadOnly(exercise)}
                                />
                                {values
                                && values[field.key]
                                && values[field.key][index]
                                && values[field.key][index].type
                                === 'attachment' ? (
                                  <Select
                                    variant="standard"
                                    name={`${name}.value`}
                                    fullWidth={true}
                                    label={t('Value')}
                                    style={{ marginRight: 20 }}
                                    disabled={isExerciseReadOnly(exercise)}
                                  >
                                    {attachedDocs.map((doc) => (
                                      <MenuItem
                                        key={doc.document_id}
                                        value={doc.document_id}
                                      >
                                        <ListItemText>
                                          {doc.document_name}
                                        </ListItemText>
                                      </MenuItem>
                                    ))}
                                  </Select>
                                  ) : (
                                  <TextField
                                    variant="standard"
                                    name={`${name}.value`}
                                    fullWidth={true}
                                    label={t('Value')}
                                    style={{ marginRight: 20 }}
                                    disabled={isExerciseReadOnly(exercise)}
                                  />
                                  )}
                                {field.cardinality === 'n' && (
                                  <IconButton
                                    onClick={() => fields.remove(index)}
                                    aria-haspopup="true"
                                    size="small"
                                    disabled={isExerciseReadOnly(exercise)}
                                    color="primary"
                                  >
                                    <DeleteOutlined />
                                  </IconButton>
                                )}
                              </ListItem>
                            );
                          })}
                        </List>
                      </div>
                    )}
                  </FieldArray>
                </div>
              );
            case 'select':
              return field.cardinality === 'n' ? (
                <Select
                  variant="standard"
                  label={t(field.label)}
                  key={field.key}
                  multiple
                  renderValue={(v) => v.map((a) => field.choices[a]).join(', ')}
                  name={field.key}
                  fullWidth={true}
                  style={{ marginTop: 20 }}
                  disabled={isExerciseReadOnly(exercise)}
                >
                  {Object.entries(field.choices)
                    .sort((a, b) => a[1].localeCompare(b[1]))
                    .map(([k, v]) => (
                      <MenuItem key={k} value={k}>
                        <ListItemText>
                          {field.expectation ? t(v || 'Unknown') : v}
                        </ListItemText>
                      </MenuItem>
                    ))}
                </Select>
              ) : (
                <Select
                  variant="standard"
                  label={t(field.label)}
                  key={field.key}
                  renderValue={(v) => (field.expectation
                    ? t(field.choices[v] || 'Unknown')
                    : field.choices[v])
                  }
                  name={field.key}
                  fullWidth={true}
                  style={{ marginTop: 20 }}
                  disabled={isExerciseReadOnly(exercise)}
                >
                  {Object.entries(field.choices)
                    .sort((a, b) => a[1].localeCompare(b[1]))
                    .map(([k, v]) => (
                      <MenuItem key={k} value={k}>
                        <ListItemText>
                          {field.expectation ? t(v || 'Unknown') : v}
                        </ListItemText>
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
                  renderValue={(v) => v.map((a) => choices[a]).join(', ')}
                  name={field.key}
                  fullWidth={true}
                  style={{ marginTop: 20 }}
                  disabled={isExerciseReadOnly(exercise)}
                >
                  {Object.entries(choices)
                    .sort((a, b) => a[1].localeCompare(b[1]))
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
                  renderValue={(v) => (field.expectation ? t(choices[v] || 'Unknown') : choices[v])
                  }
                  disabled={isExerciseReadOnly(exercise)}
                  name={field.key}
                  fullWidth={true}
                  style={{ marginTop: 20 }}
                >
                  {Object.entries(choices)
                    .sort((a, b) => a[1].localeCompare(b[1]))
                    .map(([k, v]) => (
                      <MenuItem key={k} value={k}>
                        <ListItemText>
                          {field.expectation ? t(v || 'Unknown') : v}
                        </ListItemText>
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
    );
  }

  resetDefaultvalues(setFieldValue, builtInFields) {
    const { inject, injectTypes } = this.props;
    const injectType = R.head(
      injectTypes.filter((i) => i.contract_id === inject.inject_contract),
    );
    injectType.fields
      .filter((f) => !builtInFields.includes(f.key) && !f.expectation)
      .forEach((field) => {
        if (field.cardinality && field.cardinality === '1') {
          let defaultValue = R.head(field.defaultValue);
          if (
            field.type === 'textarea'
            && field.richText
            && defaultValue
            && defaultValue.length > 0
          ) {
            defaultValue = defaultValue
              .replaceAll(
                '<#list challenges as challenge>',
                '&lt;#list challenges as challenge&gt;',
              )
              .replaceAll(
                '<#list articles as article>',
                '&lt;#list articles as article&gt;',
              )
              .replaceAll('</#list>', '&lt;/#list&gt;');
          }
          setFieldValue(field.key, defaultValue);
        } else {
          let { defaultValue } = field;
          if (
            field.type === 'textarea'
            && field.richText
            && defaultValue
            && defaultValue.length > 0
          ) {
            defaultValue = defaultValue
              .replaceAll(
                '<#list challenges as challenge>',
                '&lt;#list challenges as challenge&gt;',
              )
              .replaceAll(
                '<#list articles as article>',
                '&lt;#list articles as article&gt;',
              )
              .replaceAll('</#list>', '&lt;/#list&gt;');
          }
          setFieldValue(field.key, defaultValue);
        }
      });
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
      articlesMap,
      mediasMap,
      challengesMap,
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
      articlesOrderAsc,
      articlesSortBy,
      articlesIds,
      challengesOrderAsc,
      challengesSortBy,
      challengesIds,
      openVariables,
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
    const articles = articlesIds
      .map((a) => articlesMap[a])
      .filter((a) => a !== undefined)
      .map((a) => ({
        ...a,
        article_media_type: mediasMap[a.article_media]?.media_type || '',
        article_media_name: mediasMap[a.article_media]?.media_name || '',
      }));
    const sortArticles = R.sortWith(
      articlesOrderAsc
        ? [R.ascend(R.prop(articlesSortBy))]
        : [R.descend(R.prop(articlesSortBy))],
    );
    const sortedArticles = sortArticles(articles);
    const challenges = challengesIds
      .map((a) => challengesMap[a])
      .filter((a) => a !== undefined);
    const sortChallenges = R.sortWith(
      challengesOrderAsc
        ? [R.ascend(R.prop(challengesSortBy))]
        : [R.descend(R.prop(challengesSortBy))],
    );
    const sortedChallenges = sortChallenges(challenges);
    const docs = documents
      .map((d) => (documentsMap[d.document_id]
        ? {
          ...documentsMap[d.document_id],
          document_attached: d.document_attached,
        }
        : undefined))
      .filter((d) => d !== undefined);
    const attachedDocs = docs.filter((n) => n.document_attached);
    const sortDocuments = R.sortWith(
      documentsOrderAsc
        ? [R.ascend(R.prop(documentsSortBy))]
        : [R.descend(R.prop(documentsSortBy))],
    );
    const sortedDocuments = sortDocuments(docs);
    const hasAudiences = injectType.fields
      .map((f) => f.key)
      .includes('audiences');
    const hasArticles = injectType.fields
      .map((f) => f.key)
      .includes('articles');
    const hasChallenges = injectType.fields
      .map((f) => f.key)
      .includes('challenges');
    const hasAttachments = injectType.fields
      .map((f) => f.key)
      .includes('attachments');
    const expectations = injectType.fields.filter(
      (f) => f.expectation === true,
    );
    const initialValues = { ...inject.inject_content };
    // Enrich initialValues with default contract value
    const builtInFields = [
      'audiences',
      'articles',
      'challenges',
      'attachments',
    ];
    if (inject.inject_content === null) {
      injectType.fields
        .filter((f) => !builtInFields.includes(f.key))
        .forEach((field) => {
          if (!initialValues[field.key]) {
            if (field.cardinality && field.cardinality === '1') {
              initialValues[field.key] = R.head(field.defaultValue);
            } else {
              initialValues[field.key] = field.defaultValue;
            }
          }
        });
    }
    // Specific processing for some field
    injectType.fields
      .filter((f) => !builtInFields.includes(f.key))
      .forEach((field) => {
        if (
          field.type === 'textarea'
          && field.richText
          && initialValues[field.key]
          && initialValues[field.key].length > 0
        ) {
          initialValues[field.key] = initialValues[field.key]
            .replaceAll(
              '<#list challenges as challenge>',
              '&lt;#list challenges as challenge&gt;',
            )
            .replaceAll(
              '<#list articles as article>',
              '&lt;#list articles as article&gt;',
            )
            .replaceAll('</#list>', '&lt;/#list&gt;');
        } else if (field.type === 'tuple' && initialValues[field.key]) {
          if (field.cardinality && field.cardinality === '1') {
            if (
              initialValues[field.key].value
              && initialValues[field.key].value.includes(
                `${field.tupleFilePrefix}`,
              )
            ) {
              initialValues[field.key] = {
                type: 'attachment',
                key: initialValues[field.key].key,
                value: initialValues[field.key].value.replace(
                  `${field.tupleFilePrefix}`,
                  '',
                ),
              };
            } else {
              initialValues[field.key] = R.assoc(
                'type',
                'text',
                initialValues[field.key],
              );
            }
          } else {
            initialValues[field.key] = initialValues[field.key].map((pair) => {
              if (
                pair.value
                && pair.value.includes(`${field.tupleFilePrefix}`)
              ) {
                return {
                  type: 'attachment',
                  key: pair.key,
                  value: pair.value.replace(`${field.tupleFilePrefix}`, ''),
                };
              }
              return R.assoc('type', 'text', pair);
            });
          }
        }
      });
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
              ...arrayMutators,
              setValue: ([field, value], state, { changeValue }) => {
                changeValue(state, field, () => value);
              },
            }}
          >
            {({ form, handleSubmit, submitting, values }) => (
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
                                  disabled={isExerciseReadOnly(exercise)}
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
                {hasArticles && (
                  <div>
                    <Typography
                      variant="h2"
                      style={{ marginTop: hasAudiences ? 30 : 0 }}
                    >
                      {t('Media pressure to publish')}
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
                              {this.articlesSortHeader(
                                'article_media_type',
                                'Type',
                                true,
                              )}
                              {this.articlesSortHeader(
                                'article_media_name',
                                'Media',
                                true,
                              )}
                              {this.articlesSortHeader(
                                'article_name',
                                'Name',
                                true,
                              )}
                              {this.articlesSortHeader(
                                'article_author',
                                'Author',
                                true,
                              )}
                            </div>
                          }
                        />
                        <ListItemSecondaryAction>
                          &nbsp;
                        </ListItemSecondaryAction>
                      </ListItem>
                      {sortedArticles.map((article) => (
                        <ListItem
                          key={article.article_id}
                          classes={{ root: classes.item }}
                          divider={true}
                        >
                          <ListItemIcon>
                            <MediaIcon
                              type={article.article_media_type}
                              variant="inline"
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.article_media_type}
                                >
                                  {t(article.article_media_type || 'Unknown')}
                                </div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.article_media_name}
                                >
                                  {article.article_media_name}
                                </div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.article_name}
                                >
                                  {article.article_name}
                                </div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.article_author}
                                >
                                  {article.article_author}
                                </div>
                              </div>
                            }
                          />
                          <ListItemSecondaryAction>
                            <ArticlePopover
                              exerciseId={exerciseId}
                              exercise={exercise}
                              article={article}
                              onRemoveArticle={this.handleRemoveArticle.bind(
                                this,
                              )}
                              disabled={isExerciseReadOnly(exercise)}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                      <InjectAddArticles
                        exerciseId={exerciseId}
                        injectArticlesIds={articlesIds}
                        handleAddArticles={this.handleAddArticles.bind(this)}
                      />
                    </List>
                  </div>
                )}
                {hasChallenges && (
                  <div>
                    <Typography
                      variant="h2"
                      style={{ marginTop: hasAudiences ? 30 : 0 }}
                    >
                      {t('Challenges to publish')}
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
                              {this.challengesSortHeader(
                                'challenge_category',
                                'Category',
                                true,
                              )}
                              {this.challengesSortHeader(
                                'challenge_name',
                                'Name',
                                true,
                              )}
                              {this.challengesSortHeader(
                                'challenge_tags',
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
                      {sortedChallenges.map((challenge) => (
                        <ListItem
                          key={challenge.challenge_id}
                          classes={{ root: classes.item }}
                          divider={true}
                        >
                          <ListItemIcon>
                            <EmojiEventsOutlined />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.challenge_category}
                                >
                                  {t(challenge.challenge_category || 'Unknown')}
                                </div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.challenge_name}
                                >
                                  {challenge.challenge_name}
                                </div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.challenge_tags}
                                >
                                  <ItemTags
                                    variant="list"
                                    tags={challenge.challenge_tags}
                                  />
                                </div>
                              </div>
                            }
                          />
                          <ListItemSecondaryAction>
                            <ChallengePopover
                              challenge={challenge}
                              onRemoveChallenge={this.handleRemoveChallenge.bind(
                                this,
                              )}
                              disabled={isExerciseReadOnly(exercise)}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                      <InjectAddChallenges
                        exerciseId={exerciseId}
                        injectChallengesIds={challengesIds}
                        handleAddChallenges={this.handleAddChallenges.bind(
                          this,
                        )}
                      />
                    </List>
                  </div>
                )}
                <div style={{ marginTop: hasAudiences ? 30 : 0 }}>
                  <div style={{ float: 'left' }}>
                    <Typography variant="h2">{t('Inject data')}</Typography>
                  </div>
                  <div style={{ float: 'right' }}>
                    <Button
                      color="primary"
                      variant="outlined"
                      onClick={this.handleOpenVariables.bind(this)}
                      startIcon={<HelpOutlineOutlined />}
                    >
                      {t('Available variables')}
                    </Button>
                  </div>
                  <div className="clearfix" />
                </div>
                <div style={{ marginTop: -15 }}>
                  {this.renderFields(
                    injectType.fields
                      .filter(
                        (f) => !builtInFields.includes(f.key) && !f.expectation,
                      )
                      .filter((f) => {
                        // Filter display if linked fields
                        for (
                          let index = 0;
                          index < f.linkedFields.length;
                          index += 1
                        ) {
                          const linkedField = f.linkedFields[index];
                          if (
                            linkedField.type === 'checkbox'
                            && values[linkedField.key] === false
                          ) {
                            return false;
                          }
                          if (
                            linkedField.type === 'select'
                            && !f.linkedValues.includes(values[linkedField.key])
                          ) {
                            return false;
                          }
                        }
                        return true;
                      }),
                    values,
                    attachedDocs,
                  )}
                  <Button
                    color="secondary"
                    variant="outlined"
                    disabled={submitting || isExerciseReadOnly(exercise)}
                    onClick={this.resetDefaultvalues.bind(
                      this,
                      form.mutators.setValue,
                      builtInFields,
                    )}
                    style={{ marginTop: 10 }}
                  >
                    {t('Reset to default values')}
                  </Button>
                </div>
                {expectations.length > 0 && (
                  <div>
                    <Typography variant="h2" style={{ marginTop: 30 }}>
                      {t('Inject expectations')}
                    </Typography>
                    <div style={{ marginTop: -15 }}>
                      {this.renderFields(
                        expectations.filter((f) => {
                          // Filter display if linked fields
                          for (
                            let index = 0;
                            index < f.linkedFields.length;
                            index += 1
                          ) {
                            const linkedField = f.linkedFields[index];
                            if (
                              linkedField.type === 'checkbox'
                              && values[linkedField.key] === false
                            ) {
                              return false;
                            }
                            if (
                              linkedField.type === 'select'
                              && !f.linkedValues.includes(values[linkedField.key])
                            ) {
                              return false;
                            }
                          }
                          return true;
                        }),
                        values,
                        attachedDocs,
                      )}
                    </div>
                  </div>
                )}
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
                                  onClick={(event) => {
                                    event.preventDefault();
                                    this.toggleAttachment(document.document_id);
                                  }}
                                  disabled={
                                    isExerciseReadOnly(exercise)
                                    || !hasAttachments
                                  }
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
                            disabled={isExerciseReadOnly(exercise)}
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
                      hasAttachments={hasAttachments}
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
        <AvailableVariablesDialog
          open={openVariables}
          handleClose={this.handleCloseVariables.bind(this)}
          exerciseId={exerciseId}
          injectType={injectType}
        />
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
  fetchExerciseArticles: PropTypes.func,
  fetchMedias: PropTypes.func,
  fetchChallenges: PropTypes.func,
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
  const mediasMap = helper.getMediasMap();
  const articlesMap = helper.getArticlesMap();
  const challengesMap = helper.getChallengesMap();
  return {
    inject,
    documentsMap,
    audiencesMap,
    articlesMap,
    mediasMap,
    challengesMap,
  };
};

export default R.compose(
  connect(select, {
    fetchInjectAudiences,
    updateInject,
    fetchDocuments,
    fetchExerciseArticles,
    fetchMedias,
    fetchChallenges,
  }),
  inject18n,
  withStyles(styles),
)(InjectDefinition);
