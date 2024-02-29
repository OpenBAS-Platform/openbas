import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import withStyles from '@mui/styles/withStyles';
import {
  Button,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Switch,
  Typography,
} from '@mui/material';
import { Form } from 'react-final-form';
import { connect } from 'react-redux';
import {
  ArrowDropDownOutlined,
  ArrowDropUpOutlined,
  AttachmentOutlined,
  CloseRounded,
  ControlPointOutlined,
  DeleteOutlined,
  EmojiEventsOutlined,
  GroupsOutlined,
  HelpOutlineOutlined,
} from '@mui/icons-material';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import inject18n from '../../../../components/i18n';
import { fetchInjectTeams, updateInjectForExercise } from '../../../../actions/Inject';
import { fetchDocuments } from '../../../../actions/Document';
import { fetchChannels } from '../../../../actions/channels/channel-action';
import { fetchChallenges } from '../../../../actions/Challenge';
import ItemTags from '../../../../components/ItemTags';
import { storeHelper } from '../../../../actions/Schema';
import TeamPopover from '../teams/TeamPopover';
import ItemBoolean from '../../../../components/ItemBoolean';
import InjectAddTeams from './InjectAddTeams';
import TextField from '../../../../components/TextField';
import SwitchField from '../../../../components/SwitchField';
import EnrichedTextField from '../../../../components/EnrichedTextField';
import InjectAddDocuments from './InjectAddDocuments';
import Loader from '../../../../components/Loader';
import DocumentType from '../documents/DocumentType';
import DocumentPopover from '../documents/DocumentPopover';
import Select from '../../../../components/Select';
import ArticlePopover from '../articles/ArticlePopover';
import InjectAddArticles from './InjectAddArticles';
import ChannelIcon from '../channels/ChannelIcon';
import ChallengePopover from '../challenges/ChallengePopover';
import InjectAddChallenges from './InjectAddChallenges';
import AvailableVariablesDialog from '../../exercises/variables/AvailableVariablesDialog';
import InjectExpectations from './expectations/InjectExpectations';
import EndpointsList from '../../assets/endpoints/EndpointsList';
import EndpointPopover from '../../assets/endpoints/EndpointPopover';
import InjectAddEndpoints from '../../exercises/injects/endpoints/InjectAddEndpoints';
import AssetGroupsList from '../../assets/asset_groups/AssetGroupsList';
import AssetGroupPopover from '../../assets/asset_groups/AssetGroupPopover';
import InjectAddAssetGroups from '../../exercises/injects/assetgroups/InjectAddAssetGroups';

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
  allTeams: {
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
  team_name: {
    float: 'left',
    width: '30%',
    fontSize: 12,
    fontWeight: '700',
  },
  team_users_number: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  team_users_enabled_number: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  team_tags: {
    float: 'left',
    width: '30%',
    fontSize: 12,
    fontWeight: '700',
  },
  article_channel_type: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  article_channel_name: {
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
  team_name: {
    float: 'left',
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  team_users_number: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  team_users_enabled_number: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  team_tags: {
    float: 'left',
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  article_channel_type: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  article_channel_name: {
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
      allTeams: props.inject.inject_all_teams,
      teamsIds: props.inject.inject_teams,
      assetIds: props.inject.inject_assets,
      assetGroupIds: props.inject.inject_asset_groups,
      documents: props.inject.inject_documents,
      expectations: props.inject.inject_content?.expectations || [],
      teamsSortBy: 'team_name',
      teamsOrderAsc: true,
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
    this.props.fetchDocuments();
    this.props.fetchChannels();
    this.props.fetchChallenges();
  }

  toggleAll() {
    this.setState({ allTeams: !this.state.allTeams });
  }

  handleOpenVariables() {
    this.setState({ openVariables: true });
  }

  handleCloseVariables() {
    this.setState({ openVariables: false });
  }

  // Teams
  handleAddTeams(teamsIds) {
    this.setState({
      teamsIds: [...this.state.teamsIds, ...teamsIds],
    });
  }

  handleRemoveTeam(teamId) {
    this.setState({
      teamsIds: this.state.teamsIds.filter((a) => a !== teamId),
    });
  }

  // Assets
  handleAddAssets(assetIds) {
    this.setState({
      assetIds,
    });
  }

  handleRemoveAsset(assetId) {
    this.setState({
      assetIds: this.state.assetIds.filter((a) => a !== assetId),
    });
  }

  // Asset Groups
  handleAddAssetGroups(assetGroupIds) {
    this.setState({
      assetGroupIds,
    });
  }

  handleRemoveAssetGroup(assetGroupId) {
    this.setState({
      assetGroupIds: this.state.assetGroupIds.filter((a) => a !== assetGroupId),
    });
  }

  // Articles
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

  // Challenges
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

  // Documents
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

  // Expectations
  handleExpectations(expectations) {
    this.setState({ expectations });
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

  teamsReverseBy(field) {
    this.setState({
      teamsSortBy: field,
      teamsOrderAsc: !this.state.teamsOrderAsc,
    });
  }

  teamsSortHeader(field, label, isSortable) {
    const { t } = this.props;
    const { teamsSortBy, teamsOrderAsc } = this.state;
    const sortComponent = teamsOrderAsc ? (
      <ArrowDropDownOutlined style={inlineStylesHeaders.iconSort} />
    ) : (
      <ArrowDropUpOutlined style={inlineStylesHeaders.iconSort} />
    );
    if (isSortable) {
      return (
        <div
          style={inlineStylesHeaders[field]}
          onClick={this.teamsReverseBy.bind(this, field)}
        >
          <span>{t(label)}</span>
          {teamsSortBy === field ? sortComponent : ''}
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
    const finalData = {};
    const hasArticles = injectType.fields
      .map((f) => f.key)
      .includes('articles');
    if (hasArticles) {
      finalData.articles = this.state.articlesIds;
    }
    const hasChallenges = injectType.fields
      .map((f) => f.key)
      .includes('challenges');
    if (hasChallenges) {
      finalData.challenges = this.state.challengesIds;
    }
    const hasExpectations = injectType.fields
      .map((f) => f.key)
      .includes('expectations');
    if (hasExpectations) {
      finalData.expectations = this.state.expectations;
    }
    injectType.fields
      .filter(
        (f) => !['teams', 'assets', 'assetgroups', 'articles', 'challenges', 'attachments', 'expectations'].includes(
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
    const { allTeams, teamsIds, assetIds, assetGroupIds, documents } = this.state;
    const values = {
      inject_title: inject.inject_title,
      inject_contract: inject.inject_contract,
      inject_description: inject.inject_description,
      inject_tags: inject.inject_tags,
      inject_depends_duration: inject.inject_depends_duration,
      inject_depends_from_another: inject.inject_depends_from_another,
      inject_content: finalData,
      inject_all_teams: allTeams,
      inject_teams: teamsIds,
      inject_assets: assetIds,
      inject_asset_groups: assetGroupIds,
      inject_documents: documents,
    };
    return this.props
      .onUpdateInject(this.props.inject.inject_id, values)
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
          (f) => !['teams', 'assets', 'assetgroups', 'articles', 'challenges', 'attachments', 'expectations'].includes(
            f.key,
          ),
        )
        .forEach((field) => {
          const value = values[field.key];
          if (field.mandatory && (value === undefined || R.isEmpty(value))) {
            errors[field.key] = t('This field is required.');
          }
          if (field.mandatoryGroups) {
            const { mandatoryGroups } = field;
            const conditionOk = mandatoryGroups?.some((mandatoryKey) => {
              const v = values[mandatoryKey];
              return v !== undefined && !R.isEmpty(v);
            });
            // If condition are not filled
            if (!conditionOk) {
              const labels = mandatoryGroups.map((key) => injectType.fields.find((f) => f.key === key).label).join(', ');
              errors[field.key] = t(`One of this field is required : ${labels}.`);
            }
          }
        });
    }
    return errors;
  }

  renderFields(renderedFields, values, attachedDocs) {
    const { classes, t } = this.props;
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
                  disabled={this.props.permissions.readOnly}
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
                  disabled={this.props.permissions.readOnly}
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
                  disabled={this.props.permissions.readOnly}
                />
              );
            case 'checkbox':
              return (
                <SwitchField
                  key={field.key}
                  name={field.key}
                  label={t(field.label)}
                  style={{ marginTop: 20 }}
                  disabled={this.props.permissions.readOnly}
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
                            disabled={this.props.permissions.readOnly}
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
                                disabled={this.props.permissions.readOnly}
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
                                  disabled={this.props.permissions.readOnly}
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
                                  disabled={this.props.permissions.readOnly}
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
                                    disabled={this.props.permissions.readOnly}
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
                                      disabled={this.props.permissions.readOnly}
                                    />
                                  )}
                                {field.cardinality === 'n' && (
                                  <IconButton
                                    onClick={() => fields.remove(index)}
                                    aria-haspopup="true"
                                    size="small"
                                    disabled={this.props.permissions.readOnly}
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
                  disabled={this.props.permissions.readOnly}
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
                  disabled={this.props.permissions.readOnly}
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
                  disabled={this.props.permissions.readOnly}
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
                  disabled={this.props.permissions.readOnly}
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
                  disabled={this.props.permissions.readOnly}
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
      injectTypes,
      teamsMap,
      endpointsMap,
      assetGroupsMap,
      documentsMap,
      articlesMap,
      channelsMap,
      challengesMap,
      teamsFromExerciseOrScenario,
      articlesFromExerciseOrScenario,
    } = this.props;
    if (!inject) {
      return <Loader variant="inElement" />;
    }
    const {
      allTeams,
      teamsIds,
      assetIds,
      assetGroupIds,
      documents,
      expectations,
      teamsSortBy,
      teamsOrderAsc,
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
    // -- TEAMS --
    const teams = teamsIds
      .map((a) => teamsMap[a])
      .filter((a) => a !== undefined);
    const sortTeams = R.sortWith(
      teamsOrderAsc
        ? [R.ascend(R.prop(teamsSortBy))]
        : [R.descend(R.prop(teamsSortBy))],
    );
    const sortedTeams = sortTeams(teams.map((n) => ({
      team_users_enabled_number: this.props.teamsUsers.filter((o) => o.team_id === n.team_id).length,
      ...n,
    })));
    const hasTeams = injectType.fields
      .map((f) => f.key)
      .includes('teams');
    // -- ASSETS --
    const hasAssets = injectType.fields
      .map((f) => f.key)
      .includes('assets');
    const assets = assetIds
      .map((a) => endpointsMap[a])
      .filter((a) => a !== undefined);
    // -- ASSET GROUPS --
    const hasAssetGroups = injectType.fields
      .map((f) => f.key)
      .includes('assetgroups');
    const assetGroups = assetGroupIds
      .map((a) => assetGroupsMap[a])
      .filter((a) => a !== undefined);
    // -- ARTICLES --
    const articles = articlesIds
      .map((a) => articlesMap[a])
      .filter((a) => a !== undefined)
      .map((a) => ({
        ...a,
        article_channel_type: channelsMap[a.article_channel]?.channel_type || '',
        article_channel_name: channelsMap[a.article_channel]?.channel_name || '',
      }));
    const sortArticles = R.sortWith(
      articlesOrderAsc
        ? [R.ascend(R.prop(articlesSortBy))]
        : [R.descend(R.prop(articlesSortBy))],
    );
    const sortedArticles = sortArticles(articles);
    const hasArticles = injectType.fields
      .map((f) => f.key)
      .includes('articles');
    // -- CHALLENGES --
    const challenges = challengesIds
      .map((a) => challengesMap[a])
      .filter((a) => a !== undefined);
    const sortChallenges = R.sortWith(
      challengesOrderAsc
        ? [R.ascend(R.prop(challengesSortBy))]
        : [R.descend(R.prop(challengesSortBy))],
    );
    const sortedChallenges = sortChallenges(challenges);
    const hasChallenges = injectType.fields
      .map((f) => f.key)
      .includes('challenges');
    // -- DOCUMENTS --
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
    const hasAttachments = injectType.fields
      .map((f) => f.key)
      .includes('attachments');
    // -- EXPECTATIONS --
    const hasExpectations = injectType.fields
      .map((f) => f.key)
      .includes('expectations');
    const predefinedExpectations = injectType.fields.filter(
      (f) => f.key === 'expectations',
    ).flatMap((f) => f.predefinedExpectations);
    const expectationsNotManual = injectType.fields.filter(
      (f) => f.expectation === true,
    );

    const initialValues = { ...inject.inject_content };
    // Enrich initialValues with default contract value
    const builtInFields = [
      'teams',
      'assets',
      'assetgroups',
      'articles',
      'challenges',
      'attachments',
      'expectations',
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
                {hasTeams && (
                  <div>
                    <Typography variant="h2" style={{ float: 'left' }}>
                      {t('Targeted teams')}
                    </Typography>
                    <FormGroup
                      row={true}
                      classes={{ root: classes.allTeams }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={allTeams}
                            onChange={this.toggleAll.bind(this)}
                            color="primary"
                            disabled={this.props.permissions.readOnly}
                          />
                        }
                        label={<strong>{t('All teams')}</strong>}
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
                              {this.teamsSortHeader(
                                'team_name',
                                'Name',
                                true,
                              )}
                              {this.teamsSortHeader(
                                'team_users_number',
                                'Players',
                                true,
                              )}
                              {this.teamsSortHeader(
                                'team_users_enabled_number',
                                'Enabled players',
                                true,
                              )}
                              {this.teamsSortHeader(
                                'team_tags',
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
                      {allTeams ? (
                        <ListItem
                          classes={{ root: classes.item }}
                          divider={true}
                        >
                          <ListItemIcon>
                            <GroupsOutlined />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.team_name}
                                >
                                  <i>{t('All teams')}</i>
                                </div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.team_users_number}
                                >
                                  <strong>
                                    {this.props.allUsersNumber}
                                  </strong>
                                </div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.team_users_enabled_number}
                                >
                                  <strong>
                                    {this.props.usersNumber}
                                  </strong>
                                </div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.team_tags}
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
                          {sortedTeams.map((team) => (
                            <ListItem
                              key={team.team_id}
                              classes={{ root: classes.item }}
                              divider={true}
                            >
                              <ListItemIcon>
                                <GroupsOutlined />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <div>
                                    <div
                                      className={classes.bodyItem}
                                      style={inlineStyles.team_name}
                                    >
                                      {team.team_name}
                                    </div>
                                    <div
                                      className={classes.bodyItem}
                                      style={inlineStyles.team_users_number}
                                    >
                                      {team.team_users_number}
                                    </div>
                                    <div
                                      className={classes.bodyItem}
                                      style={inlineStyles.team_users_enabled_number}
                                    >
                                      {team.team_users_enabled_number}
                                    </div>
                                    <div
                                      className={classes.bodyItem}
                                      style={inlineStyles.team_tags}
                                    >
                                      <ItemTags
                                        variant="list"
                                        tags={team.team_tags}
                                      />
                                    </div>
                                  </div>
                                }
                              />
                              <ListItemSecondaryAction>
                                <TeamPopover
                                  team={team}
                                  onRemoveTeam={this.handleRemoveTeam.bind(
                                    this,
                                  )}
                                  disabled={this.props.permissions.readOnly}
                                />
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                          <InjectAddTeams
                            teams={teamsFromExerciseOrScenario}
                            injectTeamsIds={teamsIds}
                            handleAddTeams={this.handleAddTeams.bind(
                              this,
                            )}
                          />
                        </div>
                      )}
                    </List>
                  </div>
                )}
                {hasAssets && (
                  <>
                    <Typography variant="h2" style={{ float: 'left' }}>
                      {t('Targeted assets')}
                    </Typography>
                    <EndpointsList
                      endpoints={assets}
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore: Endpoint property handle by EndpointsList
                      actions={<EndpointPopover inline onRemoveEndpointFromInject={this.handleRemoveAsset.bind(this)} />}
                    />
                    <InjectAddEndpoints
                      endpointIds={assetIds}
                      onSubmit={this.handleAddAssets.bind(this)}
                      filter={(e) => Object.keys(e.asset_sources).length > 0 && injectType.context['collector-ids']?.includes(Object.keys(e.asset_sources))}
                    />
                  </>
                )}
                {hasAssetGroups && (
                  <>
                    <Typography variant="h2" style={{ float: 'left', marginTop: hasAssets ? 30 : 0 }}>
                      {t('Targeted asset groups')}
                    </Typography>
                    <AssetGroupsList
                      assetGroups={assetGroups}
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore: Endpoint property handle by EndpointsList
                      actions={<AssetGroupPopover inline onRemoveAssetGroupFromInject={this.handleRemoveAssetGroup.bind(this)} />}
                    />
                    <InjectAddAssetGroups assetGroupIds={assetGroupIds} onSubmit={this.handleAddAssetGroups.bind(this)} />
                  </>
                )}
                {hasArticles && (
                  <div>
                    <Typography
                      variant="h2"
                      style={{ marginTop: hasTeams ? 30 : 0 }}
                    >
                      {t('Channel pressure to publish')}
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
                                'article_channel_type',
                                'Type',
                                true,
                              )}
                              {this.articlesSortHeader(
                                'article_channel_name',
                                'Channel',
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
                            <ChannelIcon
                              type={article.article_channel_type}
                              variant="inline"
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.article_channel_type}
                                >
                                  {t(article.article_channel_type || 'Unknown')}
                                </div>
                                <div
                                  className={classes.bodyItem}
                                  style={inlineStyles.article_channel_name}
                                >
                                  {article.article_channel_name}
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
                              article={article}
                              onRemoveArticle={this.handleRemoveArticle.bind(
                                this,
                              )}
                              disabled={this.props.permissions.readOnly}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                      <InjectAddArticles
                        articles={articlesFromExerciseOrScenario}
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
                      style={{ marginTop: hasTeams ? 30 : 0 }}
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
                              inline
                              challenge={challenge}
                              onRemoveChallenge={this.handleRemoveChallenge.bind(
                                this,
                              )}
                              disabled={this.props.permissions.readOnly}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                      <InjectAddChallenges
                        injectChallengesIds={challengesIds}
                        handleAddChallenges={this.handleAddChallenges.bind(
                          this,
                        )}
                      />
                    </List>
                  </div>
                )}
                <div style={{ marginTop: (hasTeams || hasAssets || hasAssetGroups) ? 30 : 0 }}>
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
                    disabled={submitting || this.props.permissions.readOnly}
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
                {(hasExpectations || expectationsNotManual.length > 0)
                  && <>
                    <Typography variant="h2" style={{ marginTop: 30 }}>
                      {t('Inject expectations')}
                    </Typography>
                    {expectationsNotManual.length > 0 && (
                      <div>
                        <div style={{ marginTop: -15 }}>
                          {this.renderFields(
                            expectationsNotManual.filter((f) => {
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
                    {hasExpectations
                      && <InjectExpectations
                        predefinedExpectationDatas={predefinedExpectations}
                        expectationDatas={expectations}
                        handleExpectations={this.handleExpectations.bind(this)}
                         />
                    }
                  </>
                }
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
                                  variant="inList"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    this.toggleAttachment(document.document_id);
                                  }}
                                  disabled={
                                    this.props.permissions.readOnly
                                    || !hasAttachments
                                  }
                                />
                              </div>
                            </div>
                          }
                        />
                        <ListItemSecondaryAction>
                          <DocumentPopover
                            inline
                            document={document}
                            onRemoveDocument={this.handleRemoveDocument.bind(
                              this,
                            )}
                            onToggleAttach={
                              hasAttachments
                                ? this.toggleAttachment.bind(this)
                                : null
                            }
                            attached={document.document_attached}
                            disabled={this.props.permissions.readOnly}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                    <InjectAddDocuments
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
                    disabled={submitting || this.props.permissions.readOnly}
                  >
                    {t('Update')}
                  </Button>
                </div>
              </form>
            )}
          </Form>
        </div>
        <AvailableVariablesDialog
          uriVariable={this.props.uriVariable}
          variables={this.props.variablesFromExerciseOrScenario}
          open={openVariables}
          handleClose={this.handleCloseVariables.bind(this)}
          injectType={injectType}
        />
      </div>
    );
  }
}

InjectDefinition.propTypes = {
  t: PropTypes.func,
  nsdt: PropTypes.func,
  injectId: PropTypes.string,
  inject: PropTypes.object,
  fetchInjectTeams: PropTypes.func,
  fetchChannels: PropTypes.func,
  fetchChallenges: PropTypes.func,
  updateInject: PropTypes.func,
  handleClose: PropTypes.func,
  injectTypes: PropTypes.array,
  fetchDocuments: PropTypes.func,
  tagsMap: PropTypes.object,
  teamsFromExerciseOrScenario: PropTypes.array,
  articlesFromExerciseOrScenario: PropTypes.array,
  variablesFromExerciseOrScenario: PropTypes.array,
  permissions: PropTypes.object,
  onUpdateInject: PropTypes.func,
  uriVariable: PropTypes.string,
  allUsersNumber: PropTypes.number,
  usersNumber: PropTypes.number,
  teamsUsers: PropTypes.object,
};

const select = (state, ownProps) => {
  const helper = storeHelper(state);
  const { injectId } = ownProps;
  const inject = helper.getInject(injectId);
  const documentsMap = helper.getDocumentsMap();
  const teamsMap = helper.getTeamsMap();
  const endpointsMap = helper.getEndpointsMap();
  const assetGroupsMap = helper.getAssetGroupMaps();
  const channelsMap = helper.getChannelsMap();
  const articlesMap = helper.getArticlesMap();
  const challengesMap = helper.getChallengesMap();
  return {
    inject,
    documentsMap,
    teamsMap,
    endpointsMap,
    assetGroupsMap,
    articlesMap,
    channelsMap,
    challengesMap,
  };
};

export default R.compose(
  connect(select, {
    fetchInjectTeams,
    updateInject: updateInjectForExercise,
    fetchDocuments,
    fetchChannels,
    fetchChallenges,
  }),
  inject18n,
  withStyles(styles),
)(InjectDefinition);
