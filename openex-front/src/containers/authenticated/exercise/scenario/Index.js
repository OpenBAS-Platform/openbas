import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { withStyles } from '@material-ui/core/styles';
import {
  EmailOutlined,
  SmsOutlined,
  InputOutlined,
} from '@material-ui/icons';
import { green, red } from '@material-ui/core/colors';
import { dateFormat } from '../../../../utils/Time';
import { i18nRegister } from '../../../../utils/Messages';
import { T } from '../../../../components/I18n';
import { SearchField } from '../../../../components/SearchField';
import { fetchAudiences } from '../../../../actions/Audience';
import { downloadFile } from '../../../../actions/File';
import {
  fetchInjects,
  fetchInjectTypes,
  fetchInjectTypesExerciseSimple,
} from '../../../../actions/Inject';
import { fetchGroups } from '../../../../actions/Group';
import * as Constants from '../../../../constants/ComponentTypes';
import CreateInject from './CreateInject';
import InjectPopover from './InjectPopover';
import InjectView from './InjectView';
import { storeBrowser } from '../../../../actions/Schema';

i18nRegister({
  fr: {
    'This event is empty.': 'Cet événement est vide.',
    'This incident is empty.': 'Cet incident est vide.',
    Title: 'Titre',
    Date: 'Date',
    Author: 'Auteur',
    'linked subobjective(s)': 'sous-objectif(s) lié(s)',
  },
});

const styles = () => ({
  toolbar: {
    position: 'fixed',
    top: 0,
    right: 320,
    zIndex: '5000',
    backgroundColor: 'none',
  },
  title: {
    float: 'left',
    fontSize: '13px',
    textTransform: 'uppercase',
  },
  subobjectives: {
    float: 'left',
    fontSize: '12px',
  },
  empty: {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center',
  },
  search: {
    float: 'right',
  },
  inject_date: {
    float: 'left',
    width: '30%',
    padding: '5px 0 0 0',
  },
  inject_user: {
    width: '40%',
    float: 'left',
    padding: '5px 0 0 0',
  },
  inject_audiences: {
    float: 'left',
    padding: '5px 0 0 0',
    fontWeight: 600,
  },
  enabled: {
    color: green[500],
  },
  disabled: {
    color: red[500],
  },
});

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: 'inject_date',
      orderAsc: true,
      searchTerm: '',
      openView: false,
      currentInject: {},
    };
  }

  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId);
    // eslint-disable-next-line consistent-return
    this.props.fetchInjectTypes().then((value) => {
      if (value.result.length !== 0) {
        // Build object from array
        const injectTypes = {};
        value.result.map((type) => {
          injectTypes[type] = {
            type,
          };
          return true;
        });
        return {
          inject_types: injectTypes,
        };
      }
    });
    this.props.fetchInjects(this.props.exerciseId);
    this.props.fetchGroups();
  }

  reloadEvent() {
    this.props.fetchIncidents(this.props.exerciseId);
    this.props.fetchInjects(this.props.exerciseId);
  }

  handleSearchInjects(event) {
    this.setState({ searchTerm: event.target.value });
  }

  // TODO replace with sortWith after Ramdajs new release
  // eslint-disable-next-line class-methods-use-this
  ascend(a, b) {
    // eslint-disable-next-line no-nested-ternary
    return a < b ? -1 : a > b ? 1 : 0;
  }

  // eslint-disable-next-line class-methods-use-this
  descend(a, b) {
    // eslint-disable-next-line no-nested-ternary
    return a > b ? -1 : a < b ? 1 : 0;
  }

  // eslint-disable-next-line class-methods-use-this
  selectIcon(type) {
    switch (type) {
      case 'openex_email':
        return <EmailOutlined />;
      case 'openex_ovh_sms':
        return <SmsOutlined />;
      case 'openex_manual':
        return <InputOutlined />;
      default:
        return <InputOutlined />;
    }
  }

  handleOpenView(inject) {
    this.setState({ currentInject: inject, openView: true });
  }

  handleCloseView() {
    this.setState({ openView: false });
  }

  downloadAttachment(fileId, fileName) {
    return this.props.downloadFile(fileId, fileName);
  }

  renderInjects(rawInjects) {
    const {
      classes, exerciseId, eventId,
    } = this.props;
    const keyword = this.state.searchTerm;
    const filterByKeyword = (n) => keyword === ''
      || n.inject_title.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
      || n.inject_description.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
      || JSON.stringify(n.inject_content).toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    const injects = rawInjects.filter((i) => filterByKeyword(i));
    const eventIsUpdatable = R.propOr(true, 'user_can_update', this.props.event);
    const userCanUpdate = this.props.exercise?.user_can_update;
    return (
      <div>
        {injects.length === 0 && (
          <div className={classes.empty}>
            <T>This exercise is empty.</T>
          </div>
        )}
        <List>
          {injects.map((inject) => {
            // Setup variables
            const injectId = R.propOr(Math.random(), 'inject_id', inject);
            const injectTitle = R.propOr('-', 'inject_title', inject);
            const injectDescription = R.propOr(
              '-',
              'inject_description',
              inject,
            );
            const injectDate = R.prop('inject_date', inject);
            const injectType = R.propOr('-', 'inject_type', inject);
            const injectAudiences = R.propOr([], 'inject_audiences', inject);
            const injectUsersNumber = R.propOr(
              '-',
              'inject_users_number',
              inject,
            );
            const injectEnabled = R.propOr(true, 'inject_enabled', inject);
            const injectTypeInHere = R.propOr(
              false,
              injectType,
              this.props.inject_types,
            );
            const injectDisabled = !injectTypeInHere;
            // Return the dom
            return (
              <ListItem
                key={injectId}
                onClick={this.handleOpenView.bind(this, inject)}
                button={true}
                divider={true}
              >
                <ListItemIcon
                  className={
                    !injectEnabled || injectDisabled
                      ? classes.disabled
                      : classes.enabled
                  }
                >
                  {this.selectIcon(injectType)}
                </ListItemIcon>
                <ListItemText
                  primary={injectTitle}
                  secondary={injectDescription}
                />
                <div style={{ width: 500 }}>
                  <div className={classes.inject_date}>
                    {dateFormat(injectDate)}
                  </div>
                  <div className={classes.inject_audiences}>
                    {injectUsersNumber.toString()} <T>players</T>
                  </div>
                  <div className="clearfix" />
                </div>
                <ListItemSecondaryAction>
                  <InjectPopover
                    type={Constants.INJECT_SCENARIO}
                    exerciseId={exerciseId}
                    eventId={eventId}
                    inject={inject}
                    injectAudiencesIds={injectAudiences}
                    audiences={this.props.audiences}
                    inject_types={this.props.inject_types}
                    userCanUpdate={userCanUpdate}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
        <Dialog
          open={this.state.openView}
          onClose={this.handleCloseView.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>
            {R.propOr('-', 'inject_title', this.state.currentInject)}
          </DialogTitle>
          <DialogContent>
            <InjectView
              downloadAttachment={this.downloadAttachment.bind(this)}
              inject={this.state.currentInject}
              audiences={this.props.audiences}
              subaudiences={this.props.subaudiences}
            />
          </DialogContent>
          <DialogActions>
            <DialogActions>
              <Button
                variant="outlined"
                onClick={this.handleCloseView.bind(this)}
              >
                <T>Close</T>
              </Button>
            </DialogActions>
          </DialogActions>
        </Dialog>
        {eventIsUpdatable && userCanUpdate && (
          <CreateInject
            exerciseId={exerciseId}
            inject_types={this.props.inject_types}
            audiences={this.props.audiences}
            subaudiences={this.props.subaudiences}
          />
        )}
      </div>
    );
  }

  render() {
    const { classes, event, injects } = this.props;
    if (event) {
      return (
        <div className={classes.container}>
          <div className={classes.search}>
            <SearchField onChange={this.handleSearchInjects.bind(this)} />
          </div>
          <div className="clearfix" />
          {this.renderInjects(injects)}
        </div>
      );
    }
    return <div className={classes.container}> &nbsp; </div>;
  }
}

Index.propTypes = {
  exerciseId: PropTypes.string,
  audiences: PropTypes.array,
  event: PropTypes.object,
  incident: PropTypes.object,
  incidents: PropTypes.array,
  inject_types: PropTypes.object,
  injects: PropTypes.object,
  allIncidents: PropTypes.array,
  fetchAudiences: PropTypes.func,
  fetchInjectTypes: PropTypes.func,
  fetchInjectTypesExerciseSimple: PropTypes.func,
  fetchInjects: PropTypes.func,
  fetchGroups: PropTypes.func,
  downloadFile: PropTypes.func,
};

const select = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  const browser = storeBrowser(state);
  const exercise = browser.getExercise(exerciseId);
  const audiences = exercise.getAudiences();
  const event = exercise.getEvents();
  const injects = exercise.getInjects();
  // endregion
  return {
    exerciseId,
    exercise,
    event,
    audiences,
    injects,
    inject_types: state.referential.entities.inject_types,
  };
};

export default R.compose(
  connect(select, {
    fetchAudiences,
    fetchInjectTypes,
    fetchInjectTypesExerciseSimple,
    fetchInjects,
    fetchGroups,
    downloadFile,
  }),
  withStyles(styles),
)(Index);
