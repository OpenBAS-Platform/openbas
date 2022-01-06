import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withStyles } from '@mui/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { connect } from 'react-redux';
import {
  ArrowDropDownOutlined,
  ArrowDropUpOutlined,
  CastForEducationOutlined,
  CloseRounded,
} from '@mui/icons-material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import inject18n from '../../../../components/i18n';
import { fetchInjectAudiences, updateInject } from '../../../../actions/Inject';
import { fetchDocuments } from '../../../../actions/Document';
import ItemTags from '../../../../components/ItemTags';
import { storeBrowser } from '../../../../actions/Schema';
import AudiencePopover from '../audiences/AudiencePopover';
import ItemBoolean from '../../../../components/ItemBoolean';
import InjectAddAudiences from './InjectAddAudiences';
import InjectContentForm from './InjectContentForm';

const styles = (theme) => ({
  header: {
    backgroundColor: theme.palette.background.paper,
    padding: '20px 20px 20px 60px',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
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
};

class InjectDefinition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: 'audience_name',
      orderAsc: true,
    };
  }

  componentDidMount() {
    const { exerciseId, injectId } = this.props;
    this.props.fetchDocuments();
    this.props.fetchInjectAudiences(exerciseId, injectId);
  }

  buildIinitialValues() {
    return R.pick(
      [
        'inject_title',
        'inject_type',
        'inject_description',
        'inject_tags',
        'inject_content',
        'inject_all_audiences',
        'inject_country',
        'inject_city',
      ],
      this.props.inject,
    );
  }

  toggleAll() {
    const initialValues = this.buildIinitialValues();
    const inputValues = R.assoc(
      'inject_all_audiences',
      !initialValues.inject_all_audiences,
      initialValues,
    );
    this.props.updateInject(
      this.props.exerciseId,
      this.props.injectId,
      inputValues,
    );
  }

  reverseBy(field) {
    this.setState({ sortBy: field, orderAsc: !this.state.orderAsc });
  }

  sortHeader(field, label, isSortable) {
    const { t } = this.props;
    const { orderAsc, sortBy } = this.state;
    const sortComponent = orderAsc ? (
      <ArrowDropDownOutlined style={inlineStylesHeaders.iconSort} />
    ) : (
      <ArrowDropUpOutlined style={inlineStylesHeaders.iconSort} />
    );
    if (isSortable) {
      return (
        <div
          style={inlineStylesHeaders[field]}
          onClick={this.reverseBy.bind(this, field)}
        >
          <span>{t(label)}</span>
          {sortBy === field ? sortComponent : ''}
        </div>
      );
    }
    return (
      <div style={inlineStylesHeaders[field]}>
        <span>{t(label)}</span>
      </div>
    );
  }

  onSubmitContent(data) {
    const initialValues = this.buildIinitialValues();
    const inputValues = { ...initialValues, inject_content: data };
    return this.props
      .updateInject(
        this.props.exerciseId,
        this.props.inject.inject_id,
        inputValues,
      )
      .then(() => this.props.handleClose());
  }

  render() {
    const {
      t,
      classes,
      handleClose,
      inject,
      exerciseId,
      injectId,
      audiences,
      exercise,
      injectTypes,
    } = this.props;
    const sort = R.sortWith([R.ascend(R.prop('audience_name'))]);
    const sortedAudiences = sort(audiences);
    return (
      <div>
        <div className={classes.header}>
          <IconButton
            aria-label="Close"
            className={classes.closeButton}
            onClick={handleClose.bind(this)}
          >
            <CloseRounded />
          </IconButton>
          <Typography variant="h6" classes={{ root: classes.title }}>
            {R.propOr('-', 'inject_title', inject)}
          </Typography>
          <div className="clearfix" />
        </div>
        <div className={classes.container}>
          <Typography variant="h2" style={{ float: 'left' }}>
            {t('Targeted audiences')}
          </Typography>
          <FormGroup row={true} classes={{ root: classes.allAudiences }}>
            <FormControlLabel
              control={
                <Switch
                  checked={R.propOr(false, 'inject_all_audiences', inject)}
                  onChange={this.toggleAll.bind(this)}
                  color="primary"
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
                  #
                </span>
              </ListItemIcon>
              <ListItemText
                primary={
                  <div>
                    {this.sortHeader('audience_name', 'Name', true)}
                    {this.sortHeader('audience_users_number', 'Players', true)}
                    {this.sortHeader('audience_enabled', 'Status', true)}
                    {this.sortHeader('audience_tags', 'Tags', true)}
                  </div>
                }
              />
              <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
            </ListItem>
            {R.propOr(false, 'inject_all_audiences', inject) ? (
              <ListItem classes={{ root: classes.item }} divider={true}>
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
                        <strong>{exercise.exercise_users_number}</strong>
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
                <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
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
                            <ItemTags variant="list" tags={audience.tags} />
                          </div>
                        </div>
                      }
                    />
                    <ListItemSecondaryAction>
                      <AudiencePopover
                        exerciseId={exerciseId}
                        audience={audience}
                        injectId={injectId}
                        injectAudiencesIds={audiences.map((a) => a.audience_id)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                <InjectAddAudiences
                  exerciseId={exerciseId}
                  injectId={injectId}
                  injectAudiencesIds={audiences.map((a) => a.audience_id)}
                />
              </div>
            )}
          </List>
          <Typography variant="h2" style={{ marginTop: 20 }}>
            {t('Inject data')}
          </Typography>
          <InjectContentForm
            initialValues={R.propOr({}, 'inject_content', inject)}
            type={R.propOr('-', 'inject_type', inject)}
            onSubmit={this.onSubmitContent.bind(this)}
            injectTypes={injectTypes}
          />
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
  audiences: PropTypes.array,
  fetchInjectAudiences: PropTypes.func,
  updateInject: PropTypes.func,
  handleClose: PropTypes.func,
  injectTypes: PropTypes.array,
  fetchDocuments: PropTypes.func,
};

const select = (state, ownProps) => {
  const browser = storeBrowser(state);
  const { injectId, exerciseId } = ownProps;
  const inject = browser.getInject(injectId);
  return {
    inject,
    exercise: browser.getExercise(exerciseId),
    audiences: inject?.audiences || [],
  };
};

export default R.compose(
  connect(select, { fetchInjectAudiences, updateInject, fetchDocuments }),
  inject18n,
  withStyles(styles),
)(InjectDefinition);
