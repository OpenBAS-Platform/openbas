import {
  AttachmentOutlined,
  ControlPointOutlined,
  DeleteOutlined,
  EmojiEventsOutlined,
  GroupsOutlined,
  HelpOutlineOutlined,
  RotateLeftOutlined,
} from '@mui/icons-material';
import {
  Button,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import { withStyles } from '@mui/styles';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { Component } from 'react';
import { connect } from 'react-redux';

import { fetchChallenges } from '../../../../actions/Challenge';
import { fetchChannels } from '../../../../actions/channels/channel-action';
import { fetchDocuments } from '../../../../actions/Document';
import { fetchInjectTeams } from '../../../../actions/Inject';
import { storeHelper } from '../../../../actions/Schema';
import FieldArray from '../../../../components/fields/FieldArray';
import MultipleFileLoader from '../../../../components/fields/MultipleFileLoader';
import RichTextField from '../../../../components/fields/RichTextField';
import SelectField from '../../../../components/fields/SelectField';
import SwitchField from '../../../../components/fields/SwitchField';
import TextField from '../../../../components/fields/TextField';
import inject18n from '../../../../components/i18n';
import ItemBoolean from '../../../../components/ItemBoolean';
import ItemTags from '../../../../components/ItemTags';
import Loader from '../../../../components/Loader';
import arraysEqual from '../../../../utils/ArrayUtils';
import AssetGroupPopover from '../../assets/asset_groups/AssetGroupPopover';
import AssetGroupsList from '../../assets/asset_groups/AssetGroupsList';
import EndpointPopover from '../../assets/endpoints/EndpointPopover';
import EndpointsList from '../../assets/endpoints/EndpointsList';
import ChallengePopover from '../../components/challenges/ChallengePopover';
import ChannelIcon from '../../components/channels/ChannelIcon';
import DocumentPopover from '../../components/documents/DocumentPopover';
import DocumentType from '../../components/documents/DocumentType';
import InjectAddAssetGroups from '../../simulations/simulation/injects/asset_groups/InjectAddAssetGroups';
import InjectAddEndpoints from '../../simulations/simulation/injects/endpoints/InjectAddEndpoints';
import AvailableVariablesDialog from '../../simulations/simulation/variables/AvailableVariablesDialog';
import ArticlePopover from '../articles/ArticlePopover';
import InjectExpectations from './expectations/InjectExpectations';
import InjectAddArticles from './InjectAddArticles';
import InjectAddChallenges from './InjectAddChallenges';
import InjectAddTeams from './InjectAddTeams';
import InjectTeamsList from './teams/InjectTeamsList';

const styles = theme => ({
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
    marginTop: -10,
  },
  errorColor: {
    color: theme.palette.error.main,
  },
  inline: {
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
  },
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
});

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
      availableTeamIds: props.availableTeamIds || [],
      teamsIds: props.inject.inject_teams || [],
      assetIds: props.inject.inject_assets || [],
      assetGroupIds: props.inject.inject_asset_groups || [],
      articlesIds: props.inject.inject_content?.articles || [],
      challengesIds: props.inject.inject_content?.challenges || [],
      documents: props.inject.inject_documents || [],
      expectations: props.inject.inject_content?.expectations || [],
      documentsSortBy: 'document_name',
      documentsOrderAsc: true,
      articlesSortBy: 'article_name',
      articlesOrderAsc: true,
      challengesSortBy: 'challenge_name',
      challengesOrderAsc: true,
      openVariables: false,
    };
  }

  componentDidMount() {
    this.props.fetchDocuments();
    this.props.fetchChannels();
    this.props.fetchChallenges();
    this.props.setInjectDetailsState(this.state);
  }

  componentDidUpdate(prevProps) {
    const { inject } = prevProps;

    const updateStateIfChanged = (currentValue, newValue, stateKey) => {
      if (Array.isArray(newValue) && Array.isArray(currentValue)) {
        if (!arraysEqual(newValue, currentValue)) {
          this.setState({ [stateKey]: newValue || [] });
        }
      } else if (currentValue !== newValue) {
        this.setState({ [stateKey]: newValue });
      }
    };

    updateStateIfChanged(inject.inject_all_teams, this.props.inject.inject_all_teams, 'allTeams');
    updateStateIfChanged(inject.inject_teams || [], this.props.inject.inject_teams || [], 'teamsIds');
    updateStateIfChanged(inject.inject_assets || [], this.props.inject.inject_assets || [], 'assetIds');
    updateStateIfChanged(inject.inject_asset_groups || [], this.props.inject.inject_asset_groups || [], 'assetGroupIds');
    updateStateIfChanged(inject.inject_content?.articles || [], this.props.inject.inject_content?.articles || [], 'articlesIds');
    updateStateIfChanged(inject.inject_content?.challenges || [], this.props.inject.inject_content?.challenges || [], 'challengesIds');
    updateStateIfChanged(inject.inject_documents || [], this.props.inject.inject_documents || [], 'documents');
    updateStateIfChanged(inject.inject_content?.expectations || [], this.props.inject.inject_content?.expectations || [], 'expectations');
  }

  toggleAll() {
    this.setState({ allTeams: !this.state.allTeams }, () => this.props.setInjectDetailsState(this.state));
  }

  handleOpenVariables() {
    this.setState({ openVariables: true });
  }

  handleCloseVariables() {
    this.setState({ openVariables: false });
  }

  // Teams
  handleModifyTeams(teamsIds) {
    this.setState({
      teamsIds: [...teamsIds],
    }, () => this.props.setInjectDetailsState(this.state));
  }

  handleRemoveTeam(teamId) {
    this.setState({
      teamsIds: this.state.teamsIds.filter(a => a !== teamId),
    }, () => this.props.setInjectDetailsState(this.state));
  }

  // Assets
  handleAddAssets(assetIds) {
    this.setState({
      assetIds,
    }, () => this.props.setInjectDetailsState(this.state));
  }

  handleRemoveAsset(assetId) {
    this.setState({
      assetIds: this.state.assetIds.filter(a => a !== assetId),
    }, () => this.props.setInjectDetailsState(this.state));
  }

  // Asset Groups
  handleAddAssetGroups(assetGroupIds) {
    this.setState({
      assetGroupIds,
    }, () => this.props.setInjectDetailsState(this.state));
  }

  handleRemoveAssetGroup(assetGroupId) {
    this.setState({
      assetGroupIds: this.state.assetGroupIds.filter(a => a !== assetGroupId),
    }, () => this.props.setInjectDetailsState(this.state));
  }

  // Articles
  handleAddArticles(articlesIds) {
    this.setState({
      articlesIds: [...this.state.articlesIds, ...articlesIds],
    }, () => this.props.setInjectDetailsState(this.state));
  }

  handleRemoveArticle(articleId) {
    this.setState({
      articlesIds: this.state.articlesIds.filter(a => a !== articleId),
    }, () => this.props.setInjectDetailsState(this.state));
  }

  // Challenges
  handleAddChallenges(challengesIds) {
    this.setState({
      challengesIds: [...this.state.challengesIds, ...challengesIds],
    }, () => this.props.setInjectDetailsState(this.state));
  }

  handleRemoveChallenge(challengeId) {
    this.setState({
      challengesIds: this.state.challengesIds.filter(a => a !== challengeId),
    }, () => this.props.setInjectDetailsState(this.state));
  }

  // Documents
  handleAddDocuments(documents) {
    this.setState({
      documents,
    }, () => this.props.setInjectDetailsState(this.state));
  }

  handleRemoveDocument(documentId) {
    this.setState({
      documents: this.state.documents.filter(
        d => d.document_id !== documentId,
      ),
    }, () => this.props.setInjectDetailsState(this.state));
  }

  // Expectations
  handleExpectations(expectations) {
    this.setState({ expectations }, () => this.props.setInjectDetailsState(this.state));
  }

  toggleAttachment(documentId) {
    this.setState({
      documents: this.state.documents.map(d => (d.document_id === documentId
        ? {
            document_id: d.document_id,
            document_attached: !d.document_attached,
          }
        : d)),
    }, () => this.props.setInjectDetailsState(this.state));
  }

  renderFields(renderedFields, values, attachedDocs) {
    const { classes, t, control, register } = this.props;
    return (
      <>
        {renderedFields.map((field) => {
          switch (field.type) {
            case 'textarea':
              return field.richText
                ? (
                    <RichTextField
                      key={field.key}
                      name={field.key}
                      label={`${t(field.label)}${field.mandatory ? '*' : ''}`}
                      fullWidth={true}
                      style={{ marginTop: 20, height: 250 }}
                      disabled={this.props.permissions.readOnly || field.readOnly}
                      askAi={true}
                      inInject={true}
                      control={control}
                    />
                  )
                : (
                    <TextField
                      variant="standard"
                      key={field.key}
                      inputProps={register(field.key)}
                      fullWidth={true}
                      multiline={true}
                      rows={10}
                      label={`${t(field.label)}${field.mandatory ? '*' : ''}`}
                      style={{ marginTop: 20 }}
                      disabled={this.props.permissions.readOnly || field.readOnly}
                      askAi={true}
                      inInject={true}
                      control={this.props.control}
                    />
                  );
            case 'number':
              return (
                <TextField
                  variant="standard"
                  key={field.key}
                  inputProps={register(field.key)}
                  fullWidth={true}
                  type="number"
                  label={`${t(field.label)}${field.mandatory ? '*' : ''}`}
                  style={{ marginTop: 20 }}
                  disabled={this.props.permissions.readOnly || field.readOnly}
                  control={control}
                />
              );
            case 'checkbox':
              return (
                <SwitchField
                  key={field.key}
                  name={field.key}
                  label={`${t(field.label)}${field.mandatory ? '*' : ''}`}
                  style={{ marginTop: 20 }}
                  disabled={this.props.permissions.readOnly || field.readOnly}
                  control={control}
                />
              );
            case 'tuple': {
              return (
                <div key={field.key}>
                  <FieldArray
                    name={field.key}
                    control={control}
                    renderLabel={(append) => {
                      return (
                        <div style={{ marginTop: 20 }}>
                          <InputLabel
                            variant="standard"
                            shrink={true}
                            disabled={this.props.permissions.readOnly}
                          >
                            {`${t(field.label)}${field.mandatory ? '*' : ''}`}
                            {field.cardinality === 'n' && (
                              <IconButton
                                onClick={() => append({
                                  type: 'text',
                                  key: '',
                                  value: '',
                                })}
                                aria-haspopup="true"
                                size="medium"
                                style={{ marginTop: -2 }}
                                disabled={this.props.permissions.readOnly || field.readOnly}
                                color="primary"
                              >
                                <ControlPointOutlined />
                              </IconButton>
                            )}
                          </InputLabel>
                        </div>
                      );
                    }}
                    renderField={(name, index, remove) => {
                      return (
                        <List key={name.id} style={{ marginTop: -20 }}>
                          <ListItem
                            key={`${field.key}_list_${index}`}
                            classes={{ root: classes.tuple }}
                            divider={false}
                          >
                            <SelectField
                              variant="standard"
                              name={`${field.key}.${index}.type`}
                              fullWidth={true}
                              label={t('Type')}
                              style={{ marginRight: 20 }}
                              disabled={this.props.permissions.readOnly || field.readOnly}
                              control={control}
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
                            </SelectField>
                            <TextField
                              variant="standard"
                              fullWidth={true}
                              label={t('Key')}
                              style={{ marginRight: 20 }}
                              disabled={this.props.permissions.readOnly || field.readOnly}
                              inputProps={register(`${field.key}.${index}.key`)}
                              control={control}
                            />
                            {values
                            && values[field.key]
                            && values[field.key][index]
                            && values[field.key][index].type
                            === 'attachment' ? (
                                  <TextField
                                    variant="standard"
                                    fullWidth={true}
                                    label={t('Value')}
                                    style={{ marginRight: 20 }}
                                    disabled={this.props.permissions.readOnly || field.readOnly}
                                    inputProps={register(`${field.key}.${index}.value`)}
                                    control={control}
                                  >
                                    {attachedDocs.map(doc => (
                                      <MenuItem
                                        key={doc.document_id}
                                        value={doc.document_id}
                                      >
                                        <ListItemText>
                                          {doc.document_name}
                                        </ListItemText>
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                ) : (
                                  <TextField
                                    variant="standard"
                                    fullWidth={true}
                                    label={t('Value')}
                                    style={{ marginRight: 20 }}
                                    disabled={this.props.permissions.readOnly || field.readOnly}
                                    inputProps={register(`${field.key}.${index}.value`)}
                                    control={control}
                                  />
                                )}
                            {field.cardinality === 'n' && (
                              <IconButton
                                onClick={() => remove(index)}
                                aria-haspopup="true"
                                size="small"
                                disabled={this.props.permissions.readOnly || field.readOnly}
                                color="primary"
                              >
                                <DeleteOutlined />
                              </IconButton>
                            )}
                          </ListItem>
                        </List>
                      );
                    }}
                  />
                </div>
              );
            }
            case 'select': {
              const renderMultipleValuesFct = v => v.map(a => field.choices[a]).join(', ');
              const renderSingleValueFct = v => (field.expectation
                ? t(field.choices[v] || 'Unknown')
                : field.choices[v]);
              const renderValueFct = field.cardinality === 'n' ? renderMultipleValuesFct : renderSingleValueFct;
              const multipleItemDisplayFct = v => field.expectation ? t(v || 'Unknown') : v;

              return (
                <SelectField
                  variant="standard"
                  label={`${t(field.label)}${field.mandatory ? '*' : ''}`}
                  key={field.key}
                  multiple={field.cardinality === 'n'}
                  renderValue={v => renderValueFct(v)}
                  name={field.key}
                  fullWidth={true}
                  style={{ marginTop: 20 }}
                  control={control}
                  disabled={this.props.permissions.readOnly || field.readOnly}
                >
                  {Object.entries(field.choices)
                    .sort((a, b) => a[1].localeCompare(b[1]))
                    .map(([k, v]) => (
                      <MenuItem key={k} value={k}>
                        <ListItemText>
                          {field.cardinality === 'n' ? v : multipleItemDisplayFct(v)}
                        </ListItemText>
                      </MenuItem>
                    ))}
                </SelectField>
              );
            }
            case 'dependency-select': {
              const depValue = values[field.dependencyField];
              const choices = field.choices[depValue] ?? {};
              const renderMultipleValuesFct = v => v.map(a => choices[a]).join(', ');
              const renderSingleValueFct = v => (field.expectation ? t(choices[v] || 'Unknown') : choices[v]);
              const renderValueFct = field.cardinality === 'n' ? renderMultipleValuesFct : renderSingleValueFct;
              const multipleItemDisplayFct = v => field.expectation ? t(v || 'Unknown') : v;

              return (
                <SelectField
                  variant="standard"
                  label={`${t(field.label)}${field.mandatory ? '*' : ''}`}
                  key={field.key}
                  multiple={field.cardinality === 'n'}
                  renderValue={v => renderValueFct(v)}
                  disabled={this.props.permissions.readOnly || field.readOnly}
                  name={field.key}
                  fullWidth={true}
                  control={control}
                  style={{ marginTop: 20 }}
                >
                  {Object.entries(choices)
                    .sort((a, b) => a[1].localeCompare(b[1]))
                    .map(([k, v]) => (
                      <MenuItem key={k} value={k}>
                        <ListItemText>
                          {field.cardinality === 'n' ? multipleItemDisplayFct(v) : v}
                        </ListItemText>
                      </MenuItem>
                    ))}
                </SelectField>
              );
            }
            default:
              return (
                <TextField
                  variant="standard"
                  key={field.key}
                  inputProps={register(field.key)}
                  fullWidth={true}
                  label={`${t(field.label)}${field.mandatory ? '*' : ''}`}
                  style={{ marginTop: 20 }}
                  disabled={this.props.permissions.readOnly || field.readOnly}
                  control={control}
                />
              );
          }
        })}
      </>
    );
  }

  resetDefaultvalues(setFieldValue, builtInFields, injectorContract) {
    injectorContract.fields
      .filter(f => !builtInFields.includes(f.key) && !f.expectation)
      .forEach((field) => {
        let defaultValue = field.cardinality === '1' ? R.head(field.defaultValue) : field.defaultValue;
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
      });
  }

  render() {
    const {
      t,
      classes,
      setValue,
      values,
      submitting,
      inject,
      injectorContract,
      endpointsMap,
      documentsMap,
      articlesMap,
      channelsMap,
      challengesMap,
      articlesFromExerciseOrScenario,
      isAtomic,
    } = this.props;
    if (!inject) {
      return <Loader variant="inElement" />;
    }
    const {
      allTeams,
      teamsIds,
      availableTeamIds,
      assetIds,
      assetGroupIds,
      documents,
      expectations,
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
    // -- TEAMS --
    const fieldTeams = injectorContract.fields.filter(n => n.key === 'teams').at(0);
    const hasTeams = injectorContract.fields
      .map(f => f.key)
      .includes('teams');
    // -- ASSETS --
    const fieldAssets = injectorContract.fields.filter(n => n.key === 'assets').at(0);
    const hasAssets = injectorContract.fields
      .map(f => f.key)
      .includes('assets');
    const assets = assetIds
      .map(a => ({ asset_id: a, ...endpointsMap[a], type: 'static' }))
      .filter(a => a !== undefined);
    // -- ASSET GROUPS --
    const hasAssetGroups = injectorContract.fields
      .map(f => f.key)
      .includes('assetgroups');
    // -- ARTICLES --
    const articles = articlesIds
      .map(a => articlesMap[a])
      .filter(a => a !== undefined)
      .map(a => ({
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
    const fieldArticles = injectorContract.fields.filter(n => n.key === 'articles').at(0);
    const hasArticles = injectorContract.fields
      .map(f => f.key)
      .includes('articles');
    // -- CHALLENGES --
    const challenges = challengesIds
      .map(a => challengesMap[a])
      .filter(a => a !== undefined);
    const sortChallenges = R.sortWith(
      challengesOrderAsc
        ? [R.ascend(R.prop(challengesSortBy))]
        : [R.descend(R.prop(challengesSortBy))],
    );
    const sortedChallenges = sortChallenges(challenges);
    const fieldChallenges = injectorContract.fields.filter(n => n.key === 'challenges').at(0);
    const hasChallenges = injectorContract.fields
      .map(f => f.key)
      .includes('challenges');
    // -- DOCUMENTS --
    const docs = documents
      .map(d => (documentsMap[d.document_id]
        ? {
            ...documentsMap[d.document_id],
            document_attached: d.document_attached,
          }
        : undefined))
      .filter(d => d !== undefined);
    const attachedDocs = docs.filter(n => n.document_attached);
    const sortDocuments = R.sortWith(
      documentsOrderAsc
        ? [R.ascend(R.prop(documentsSortBy))]
        : [R.descend(R.prop(documentsSortBy))],
    );
    const sortedDocuments = sortDocuments(docs);
    const fieldAttachements = injectorContract.fields.filter(n => n.key === 'attachments').at(0);
    const hasAttachments = injectorContract.fields
      .map(f => f.key)
      .includes('attachments');
    // -- EXPECTATIONS --
    const hasExpectations = injectorContract.fields
      .map(f => f.key)
      .includes('expectations');
    const predefinedExpectations = injectorContract.fields.filter(
      f => f.key === 'expectations',
    ).flatMap(f => f.predefinedExpectations);
    const expectationsNotManual = injectorContract.fields.filter(
      f => f.expectation === true,
    );
    const builtInFields = [
      'teams',
      'assets',
      'assetgroups',
      'articles',
      'challenges',
      'attachments',
      'expectations',
    ];
    return (
      <>
        {hasTeams && (
          <>
            <Typography variant="h5" style={{ fontWeight: 500, float: 'left' }}>
              {t('Targeted teams')}
            </Typography>
            <FormGroup row={true} classes={{ root: classes.allTeams }}>
              <FormControlLabel
                control={(
                  <Switch
                    checked={allTeams}
                    onChange={this.toggleAll.bind(this)}
                    color="primary"
                    size="small"
                    disabled={this.props.permissions.readOnly || fieldTeams.readOnly}
                  />
                )}
                label={<strong>{t('All teams')}</strong>}
              />
            </FormGroup>
            <div className="clearfix" />
            <List>
              {allTeams ? (
                <ListItem classes={{ root: classes.item }} divider={true}>
                  <ListItemIcon>
                    <GroupsOutlined />
                  </ListItemIcon>
                  <ListItemText
                    primary={(
                      <>
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
                          <ItemTags variant="reduced-view" tags={[]} />
                        </div>
                      </>
                    )}
                  />
                  <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
                </ListItem>
              ) : (
                <>
                  <InjectTeamsList
                    teamIds={teamsIds}
                    handleRemoveTeam={this.handleRemoveTeam.bind(this)}
                  />
                  <InjectAddTeams
                    injectTeamsIds={teamsIds}
                    availableTeamIds={availableTeamIds}
                    handleModifyTeams={this.handleModifyTeams.bind(this)}
                  />
                </>
              )}
            </List>
          </>
        )}
        {hasAssets && (
          <>
            <Typography variant="h5" style={{ fontWeight: 500, marginTop: hasTeams ? 20 : 0 }}>
              {t('Targeted assets')}
            </Typography>
            <EndpointsList
              endpoints={assets}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore: Endpoint property handle by EndpointsList
              actions={
                <EndpointPopover inline onRemoveEndpointFromInject={this.handleRemoveAsset.bind(this)} onDelete={this.handleRemoveAsset.bind(this)} />
              }
            />
            <InjectAddEndpoints
              endpointIds={assetIds}
              onSubmit={this.handleAddAssets.bind(this)}
              disabled={fieldAssets.readOnly}
              platforms={injectorContract.platforms}
              payloadArch={inject.inject_injector_contract?.injector_contract_arch}
            />
          </>
        )}
        {hasAssetGroups && (
          <>
            <Typography variant="h5" style={{ fontWeight: 500, marginTop: hasTeams || hasAssets ? 20 : 0 }}>
              {t('Targeted asset groups')}
            </Typography>
            <AssetGroupsList
              assetGroupIds={assetGroupIds}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore: Endpoint property handle by EndpointsList
              actions={
                <AssetGroupPopover inline onRemoveAssetGroupFromInject={this.handleRemoveAssetGroup.bind(this)} />
              }
            />
            <InjectAddAssetGroups assetGroupIds={assetGroupIds} onSubmit={this.handleAddAssetGroups.bind(this)} />
          </>
        )}
        {hasArticles && (
          <>
            <Typography variant="h5" style={{ fontWeight: 500, marginTop: hasTeams || hasAssets || hasAssetGroups ? 20 : 0 }}>
              {t('Media pressure to publish')}
            </Typography>
            <List>
              {sortedArticles.map(article => (
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
                    primary={(
                      <>
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
                      </>
                    )}
                  />
                  <ListItemSecondaryAction>
                    <ArticlePopover
                      article={article}
                      onRemoveArticle={this.handleRemoveArticle.bind(this)}
                      disabled={this.props.permissions.readOnly || fieldArticles.readOnly}
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
          </>
        )}
        {hasChallenges && (
          <>
            <Typography variant="h5" style={{ fontWeight: 500, marginTop: hasTeams || hasAssets || hasAssetGroups || hasArticles ? 20 : 0 }}>
              {t('Challenges to publish')}
            </Typography>
            <List>
              {sortedChallenges.map(challenge => (
                <ListItem
                  key={challenge.challenge_id}
                  classes={{ root: classes.item }}
                  divider={true}
                >
                  <ListItemIcon>
                    <EmojiEventsOutlined />
                  </ListItemIcon>
                  <ListItemText
                    primary={(
                      <>
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
                            variant="reduced-view"
                            tags={challenge.challenge_tags}
                          />
                        </div>
                      </>
                    )}
                  />
                  <ListItemSecondaryAction>
                    <ChallengePopover
                      inline
                      challenge={challenge}
                      onRemoveChallenge={this.handleRemoveChallenge.bind(
                        this,
                      )}
                      disabled={this.props.permissions.readOnly || fieldChallenges.readOnly}
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
          </>
        )}
        <div style={{ marginTop: hasTeams || hasAssets || hasAssetGroups || hasArticles || hasChallenges ? 24 : 0 }}>
          <div style={{ float: 'left' }}>
            <Typography variant="h5" style={{ fontWeight: 500 }}>{t('Inject data')}</Typography>
          </div>
          <div style={{ float: 'left' }}>
            <Tooltip title={t('Reset to default values')}>
              <IconButton
                color="primary"
                variant="outlined"
                disabled={submitting || this.props.permissions.readOnly}
                onClick={() => this.resetDefaultvalues(setValue, builtInFields, injectorContract)}
                size="small"
                style={{ margin: '-12px 0 0 5px' }}
              >
                <RotateLeftOutlined />
              </IconButton>
            </Tooltip>
          </div>
          <div style={{ float: 'right' }}>
            <Button
              color="primary"
              variant="outlined"
              size="small"
              onClick={this.handleOpenVariables.bind(this)}
              startIcon={<HelpOutlineOutlined />}
              style={{ marginTop: -10 }}
            >
              {t('Available variables')}
            </Button>
          </div>
          <div className="clearfix" />
        </div>
        <>
          {this.renderFields(
            injectorContract.fields
              .filter(
                f => !builtInFields.includes(f.key) && !f.expectation,
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
        </>
        {(hasExpectations || expectationsNotManual.length > 0) && (
          <>
            <Typography variant="h5" style={{ marginTop: 20, fontWeight: 500 }}>
              {t('Inject expectations')}
            </Typography>
            {expectationsNotManual.length > 0 && (
              <>
                <div style={{ marginTop: -15 }}>
                  {this.renderFields(
                    expectationsNotManual.filter((f) => {
                      // Filter display if linked fields
                      for (let index = 0; index < f.linkedFields.length; index += 1) {
                        const linkedField = f.linkedFields[index];
                        if (linkedField.type === 'checkbox' && values[linkedField.key] === false) {
                          return false;
                        }
                        if (linkedField.type === 'select' && !f.linkedValues.includes(values[linkedField.key])) {
                          return false;
                        }
                      }
                      return true;
                    }),
                    values,
                    attachedDocs,
                  )}
                </div>
              </>
            )}
            {hasExpectations && (
              <InjectExpectations
                predefinedExpectationDatas={predefinedExpectations}
                expectationDatas={(expectations && expectations.length > 0) ? expectations : predefinedExpectations}
                handleExpectations={this.handleExpectations.bind(this)}
              />
            )}
          </>
        )}
        {!isAtomic && (
          <>
            <Typography variant="h5" style={{ fontWeight: 500, marginTop: 20 }}>
              {t('Inject documents')}
            </Typography>
            <List>
              {sortedDocuments.map(document => (
                <ListItemButton
                  key={document.document_id}
                  classes={{ root: classes.item }}
                  divider={true}
                  component="a"
                  href={`/api/documents/${document.document_id}/file`}
                >
                  <ListItemIcon>
                    <AttachmentOutlined />
                  </ListItemIcon>
                  <ListItemText
                    primary={(
                      <>
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
                            variant="reduced-view"
                            tags={document.document_tags}
                          />
                        </div>
                        <div
                          className={classes.bodyItem}
                          style={inlineStyles.document_attached}
                        >
                          <ItemBoolean
                            status={hasAttachments ? document.document_attached : null}
                            label={document.document_attached ? t('Yes') : t('No')}
                            variant="inList"
                            onClick={(event) => {
                              event.preventDefault();
                              this.toggleAttachment(document.document_id);
                            }}
                            disabled={this.props.permissions.readOnly || (hasAttachments && fieldAttachements.readOnly) || !hasAttachments}
                          />
                        </div>
                      </>
                    )}
                  />
                  <ListItemSecondaryAction>
                    <DocumentPopover
                      inline
                      document={document}
                      onRemoveDocument={this.handleRemoveDocument.bind(this)}
                      onToggleAttach={hasAttachments ? this.toggleAttachment.bind(this) : null}
                      attached={document.document_attached}
                      disabled={this.props.permissions.readOnly || (hasAttachments && fieldAttachements.readOnly)}
                    />
                  </ListItemSecondaryAction>
                </ListItemButton>
              ))}
              <MultipleFileLoader
                initialDocumentIds={documents.filter(a => !a.inject_document_attached).map(d => d.document_id)}
                handleAddDocuments={this.handleAddDocuments.bind(this)}
                hasAttachments={hasAttachments}
              />
            </List>
          </>
        )}
        <AvailableVariablesDialog
          uriVariable={this.props.uriVariable}
          variables={this.props.variablesFromExerciseOrScenario}
          open={openVariables}
          handleClose={this.handleCloseVariables.bind(this)}
          injectorContract={injectorContract}
        />
      </>
    );
  }
}

InjectDefinition.propTypes = {
  t: PropTypes.func,
  nsdt: PropTypes.func,
  injectId: PropTypes.string,
  inject: PropTypes.object,
  availableTeamIds: PropTypes.array,
  fetchInjectTeams: PropTypes.func,
  fetchChannels: PropTypes.func,
  fetchChallenges: PropTypes.func,
  handleClose: PropTypes.func,
  injectorContract: PropTypes.object,
  fetchDocuments: PropTypes.func,
  tagsMap: PropTypes.object,
  articlesFromExerciseOrScenario: PropTypes.array,
  variablesFromExerciseOrScenario: PropTypes.array,
  permissions: PropTypes.object,
  onUpdateInject: PropTypes.func,
  onCreateInject: PropTypes.func,
  uriVariable: PropTypes.string,
  allUsersNumber: PropTypes.number,
  usersNumber: PropTypes.number,
  teamsUsers: PropTypes.array,
  isAtomic: PropTypes.bool,
};

const select = (state) => {
  const helper = storeHelper(state);
  const documentsMap = helper.getDocumentsMap();
  const endpointsMap = helper.getEndpointsMap();
  const channelsMap = helper.getChannelsMap();
  const articlesMap = helper.getArticlesMap();
  const challengesMap = helper.getChallengesMap();
  return {
    documentsMap,
    endpointsMap,
    articlesMap,
    channelsMap,
    challengesMap,
  };
};

export default R.compose(
  connect(select, {
    fetchInjectTeams,
    fetchDocuments,
    fetchChannels,
    fetchChallenges,
  }),
  inject18n,
  withStyles(styles),
)(InjectDefinition);
