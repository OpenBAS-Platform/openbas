import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { injectIntl } from 'react-intl';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import withStyles from '@mui/styles/withStyles';
import {
  CenterFocusStrongOutlined,
  EmailOutlined,
  GroupOutlined,
  InputOutlined,
  KeyboardArrowDownOutlined,
  SmsOutlined,
} from '@mui/icons-material';
import { green, red } from '@mui/material/colors';
import { T } from '../../../components/I18n';
import { i18nRegister } from '../../../utils/Messages';
import { downloadFile } from '../../../actions/File';
import InjectView from './scenario/InjectView';
import ObjectiveView from './objective/ObjectiveView';
import AudiencePopover from './AudiencePopover';
import AudiencesPopover from './AudiencesPopover';
import MiniMap from './MiniMap';
import { storeBrowser } from '../../../actions/Schema';

i18nRegister({
  fr: {
    'Main objectives': 'Objectifs principaux',
    Audiences: 'Audiences',
    players: 'joueurs',
    'You do not have any objectives in this exercise.':
      "Vous n'avez aucun objectif dans cet exercice.",
    'You do not have any audiences in this exercise.':
      "Vous n'avez aucune audience dans cet exercice.",
    Scenario: 'Scénario',
    'Inject view': "Vue de l'injection",
    'Incident view': "Vue de l'incident",
    'Objective view': "Vue de l'objectif",
    'Audience view': "Vue de l'audience",
    'Event view': "Vue de l'événement",
    'View all': 'Voir tout',
    'Audiences of the inject': "Audiences de l'injection",
    'Map of players and injects': 'Carte des joueurs et des injections',
  },
});

const styles = (theme) => ({
  empty: {
    marginTop: 15,
    fontSize: 16,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  nested2: {
    paddingLeft: theme.spacing(8),
  },
  enabled: {
    color: green[500],
  },
  disabled: {
    color: red[500],
  },
});

class IndexExercise extends Component {
  constructor(props) {
    super(props);
    this.state = {
      incidentsOpened: {},
      openViewInject: false,
      currentInject: {},
      openViewAudience: false,
      currentAudience: {},
      openViewObjective: false,
      currentObjective: {},
      openObjectives: false,
      openAudiences: false,
      currentInjectAudiences: [],
      openInjectAudiences: false,
    };
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

  handleCloseViewEvent() {
    this.setState({ openViewEvent: false });
  }

  handleToggleIncident(incidentId) {
    const { incidentsOpened } = this.state;
    incidentsOpened[incidentId] = incidentsOpened[incidentId] !== null
      ? !incidentsOpened[incidentId]
      : true;
    this.setState({ incidentsOpened });
  }

  handleOpenViewInject(inject) {
    this.setState({ currentInject: inject, openViewInject: true });
  }

  handleCloseViewInject() {
    this.setState({ openViewInject: false });
  }

  handleOpenViewAudience(audience) {
    this.setState({ currentAudience: audience, openViewAudience: true });
  }

  handleCloseViewAudience() {
    this.setState({ openViewAudience: false });
  }

  handleOpenViewObjective(objective) {
    this.setState({ currentObjective: objective, openViewObjective: true });
  }

  handleCloseViewObjective() {
    this.setState({ openViewObjective: false });
  }

  handleOpenObjectives() {
    this.setState({ openObjectives: true });
  }

  handleCloseObjectives() {
    this.setState({ openObjectives: false });
  }

  handleOpenAudiences() {
    this.setState({ openAudiences: true });
  }

  handleCloseAudiences() {
    this.setState({ openAudiences: false });
  }

  handleOpenInjectAudiences(audiences, event) {
    event.stopPropagation();
    this.setState({
      currentInjectAudiences: audiences,
      openInjectAudiences: true,
    });
  }

  handleCloseInjectAudiences() {
    this.setState({ openInjectAudiences: false });
  }

  downloadAttachment(fileId, fileName) {
    return this.props.downloadFile(fileId, fileName);
  }

  render() {
    const { classes } = this.props;
    const exerciseUsers = this.props.exercise.getUsers();
    const exerciseObjectives = this.props.exercise.getObjectives();
    return (
      <div>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Typography variant="h5" style={{ float: 'left' }}>
              <T>Main objectives</T>
            </Typography>
            <div className="clearfix" style={{ marginBottom: 8 }} />
            {exerciseObjectives.length === 0 && (
              <div className={classes.empty}>
                <T>You do not have any objectives in this exercise.</T>
              </div>
            )}
            <List>
              {R.take(3, exerciseObjectives).map((objective) => (
                <ListItem
                  key={objective.objective_id}
                  divider={true}
                  button={true}
                  onClick={this.handleOpenViewObjective.bind(this, objective)}
                >
                  <ListItemIcon>
                    <CenterFocusStrongOutlined />
                  </ListItemIcon>
                  <ListItemText
                    primary={objective.objective_title}
                    secondary={objective.objective_description}
                  />
                </ListItem>
              ))}
            </List>
            {exerciseObjectives > 3 && (
              <div
                onClick={this.handleOpenObjectives.bind(this)}
                className={classes.expand}
              >
                <KeyboardArrowDownOutlined />
              </div>
            )}
            <Dialog
              open={this.state.openObjectives}
              onClose={this.handleCloseObjectives.bind(this)}
              maxWidth="md"
              fullWidth={true}
            >
              <DialogTitle>
                <T>Main objectives</T>
              </DialogTitle>
              <DialogContent>
                <List>
                  {exerciseObjectives.map((objective) => (
                    <ListItem
                      key={objective.objective_id}
                      divider={true}
                      button={true}
                      onClick={this.handleOpenViewObjective.bind(
                        this,
                        objective,
                      )}
                    >
                      <ListItemIcon>
                        <CenterFocusStrongOutlined />
                      </ListItemIcon>
                      <ListItemText
                        primary={objective.objective_title}
                        secondary={objective.objective_description}
                      />
                    </ListItem>
                  ))}
                </List>
                <DialogActions>
                  <Button
                    variant="outlined"
                    onClick={this.handleCloseObjectives.bind(this)}
                  >
                    <T>Close</T>
                  </Button>
                </DialogActions>
              </DialogContent>
            </Dialog>
            <Dialog
              open={this.state.openViewObjective}
              onClose={this.handleCloseViewObjective.bind(this)}
              maxWidth="md"
              fullWidth={true}
            >
              <DialogTitle>
                {R.propOr('-', 'objective_title', this.state.currentObjective)}
              </DialogTitle>
              <DialogContent>
                <ObjectiveView objective={this.state.currentObjective} />
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  onClick={this.handleCloseViewObjective.bind(this)}
                >
                  <T>Close</T>
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h5" style={{ float: 'left' }}>
              Audiences
            </Typography>
            <AudiencesPopover exerciseId={this.props.exerciseId} />
            <div className="clearfix" />
            {this.props.audiences.length === 0 && (
              <div className={classes.empty}>
                <T>You do not have any audiences in this exercise.</T>
              </div>
            )}
            <List>
              {R.take(3, this.props.audiences).map((audience) => {
                const playersText = `${
                  audience.audience_users_number
                } ${this.props.intl.formatMessage({ id: 'players' })}`;
                return (
                  <ListItem
                    key={audience.audience_id}
                    onClick={this.handleOpenViewAudience.bind(this, audience)}
                    button={true}
                    divider={true}
                  >
                    <ListItemIcon
                      className={
                        audience.audience_enabled
                          ? classes.enabled
                          : classes.disabled
                      }
                    >
                      <GroupOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={audience.audience_name}
                      secondary={playersText}
                    />
                    <ListItemSecondaryAction>
                      <AudiencePopover
                        exerciseId={this.props.exerciseId}
                        audience={audience}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
            {this.props.audiences.length > 3 && (
              <div
                onClick={this.handleOpenAudiences.bind(this)}
                className={classes.expand}
              >
                <KeyboardArrowDownOutlined />
              </div>
            )}
            <Dialog
              open={this.state.openAudiences}
              onClose={this.handleCloseAudiences.bind(this)}
              maxWidth="md"
              fullWidth={true}
            >
              <DialogTitle>
                <T>Audiences</T>
              </DialogTitle>
              <DialogContent>
                <List>
                  {this.props.audiences.map((audience) => {
                    const playersText = `${
                      audience.audience_users_number
                    } ${this.props.intl.formatMessage({ id: 'players' })}`;
                    return (
                      <ListItem
                        key={audience.audience_id}
                        button={true}
                        divider={true}
                        onClick={this.handleOpenViewAudience.bind(
                          this,
                          audience,
                        )}
                      >
                        <ListItemIcon
                          className={
                            audience.audience_enabled
                              ? classes.enabled
                              : classes.disabled
                          }
                        >
                          <GroupOutlined />
                        </ListItemIcon>
                        <ListItemText
                          primary={audience.audience_name}
                          secondary={playersText}
                        />
                        <ListItemSecondaryAction>
                          <AudiencePopover
                            exerciseId={this.props.exerciseId}
                            audience={audience}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  onClick={this.handleCloseAudiences.bind(this)}
                >
                  <T>Close</T>
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5">
              <T>Map of players and injects</T>
            </Typography>
            {this.props.exercise && (
              <MiniMap
                zoom={4}
                center={
                  this.props.exercise.exercise_latitude
                  && this.props.exercise.exercise_longitude
                    ? [
                      this.props.exercise.exercise_latitude,
                      this.props.exercise.exercise_longitude,
                    ]
                    : [48.8566969, 2.3514616]
                }
                users={exerciseUsers}
                injects={this.props.exercise.getInjects()}
              />
            )}
          </Grid>
        </Grid>
        <Dialog
          open={this.state.openViewInject}
          onClose={this.handleCloseViewInject.bind(this)}
          maxWidth="md"
          fullWidth={true}
        >
          <DialogTitle>
            {R.propOr('-', 'inject_title', this.state.currentInject)}
          </DialogTitle>
          <DialogContent>
            <InjectView
              downloadAttachment={this.downloadAttachment.bind(this)}
              inject={this.state.currentInject}
              audiences={this.props.audiences}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseViewInject.bind(this)}
            >
              <T>Close</T>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.openInjectAudiences}
          onClose={this.handleCloseInjectAudiences.bind(this)}
          maxWidth="md"
          fullWidth={true}
        >
          <DialogTitle>
            <t>Audiences of the inject</t>
          </DialogTitle>
          <DialogContent>
            <List>
              {this.state.currentInjectAudiences.map((data) => {
                const audience = R.find(
                  (a) => a.audience_id === data.audience_id,
                )(this.props.audiences);
                const audienceId = R.propOr(
                  data.audience_id,
                  'audience_id',
                  audience,
                );
                const audienceName = R.propOr('-', 'audience_name', audience);
                const audienceUsers = R.propOr([], 'audience_users', audience);
                const audienceEnabled = R.propOr(
                  false,
                  'audience_enabled',
                  audience,
                );
                const playersText = `${
                  audienceUsers.length
                } ${this.props.intl.formatMessage({ id: 'players' })}`;
                return (
                  <ListItem
                    key={audienceId}
                    onClick={this.handleOpenViewAudience.bind(this, audience)}
                    button={true}
                    divider={true}
                  >
                    <ListItemIcon
                      className={
                        audienceEnabled ? classes.enabled : classes.disabled
                      }
                    >
                      <GroupOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={audienceName}
                      secondary={playersText}
                    />
                  </ListItem>
                );
              })}
            </List>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseInjectAudiences.bind(this)}
            >
              <T>Close</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

IndexExercise.propTypes = {
  exerciseId: PropTypes.string,
  objectives: PropTypes.array,
  audiences: PropTypes.array,
  exercise: PropTypes.object,
  intl: PropTypes.object,
  downloadFile: PropTypes.func,
  exerciseInjects: PropTypes.array,
};

const select = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  const browser = storeBrowser(state);
  const exercise = browser.getExercise(exerciseId);
  const audiences = exercise.getAudiences();
  return { exerciseId, exercise, audiences };
};

export default R.compose(
  connect(select, { downloadFile }),
  withStyles(styles),
  injectIntl,
)(IndexExercise);
