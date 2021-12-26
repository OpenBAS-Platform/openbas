import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import { withStyles } from '@material-ui/core/styles';
import { CenterFocusStrongOutlined } from '@material-ui/icons';
import Typography from '@material-ui/core/Typography';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import { fetchObjectives } from '../../../../actions/Objective';
import { fetchGroups } from '../../../../actions/Group';
import ObjectivePopover from './ObjectivePopover';
import CreateObjective from './CreateObjective';
import ObjectiveView from './ObjectiveView';

i18nRegister({
  fr: {
    Objectives: 'Objectifs',
    'You do not have any objectives in this exercise.':
      "Vous n'avez aucun objectif dans cet exercice.",
    'Objective view': "Vue de l'objectif",
  },
});

const styles = (theme) => ({
  container: {
    paddingBottom: '50px',
  },
  empty: {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center',
  },
  priority: {
    fontSize: 18,
    fontWeight: 500,
    marginRight: '50px',
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
});

class IndexObjective extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openObjective: false,
      currentObjective: {},
    };
  }

  componentDidMount() {
    this.props.fetchObjectives(this.props.exerciseId);
    this.props.fetchGroups();
  }

  handleOpenObjective(objective) {
    this.setState({ currentObjective: objective, openObjective: true });
  }

  handleCloseObjective() {
    this.setState({ openObjective: false });
  }

  render() {
    const { classes } = this.props;
    const { exerciseId, objectives } = this.props;
    const userCanUpdate = this.props.exercise?.user_can_update;
    return (
      <div className={classes.container}>
        <Typography variant="h5" style={{ float: 'left' }}>
          <T>Objectives</T>
        </Typography>
        <div className="clearfix" />
        {objectives.length === 0 && (
          <div className={classes.empty}>
            <T>You do not have any objectives in this exercise.</T>
          </div>
        )}
        <List>
          {objectives.map((objective) => (
              <div key={objective.objective_id}>
                <ListItem
                  onClick={this.handleOpenObjective.bind(this, objective)}
                  button={true}
                  divider={true}
                >
                  <ListItemIcon>
                    <CenterFocusStrongOutlined />
                  </ListItemIcon>
                  <ListItemText
                    primary={objective.objective_title}
                    secondary={objective.objective_description}
                  />
                  <div className={classes.priority}>
                    {objective.objective_priority}
                  </div>
                  {userCanUpdate && (
                    <ListItemSecondaryAction>
                      <ObjectivePopover
                        exerciseId={exerciseId}
                        objective={objective}
                      />
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              </div>
          ))}
        </List>
        <Dialog
          open={this.state.openObjective}
          onClose={this.handleCloseObjective.bind(this)}
          fullWidth={true}
          maxWidth="xs"
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
              onClick={this.handleCloseObjective.bind(this)}
            >
              <T>Close</T>
            </Button>
          </DialogActions>
        </Dialog>
        {userCanUpdate && (
          <CreateObjective exerciseId={exerciseId} />
        )}
      </div>
    );
  }
}

IndexObjective.propTypes = {
  exerciseId: PropTypes.string,
  objectives: PropTypes.array,
  fetchObjectives: PropTypes.func.isRequired,
};

const filterObjectives = (objectives, exerciseId) => {
  const objectivesFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.objective_exercise === exerciseId),
    R.sortWith([R.ascend(R.prop('objective_priority'))]),
  );
  return objectivesFilterAndSorting(objectives);
};

const select = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  const exercise = state.referential.entities.exercises[ownProps.id];
  const objectives = filterObjectives(state.referential.entities.objectives, exerciseId);
  return { exerciseId, exercise, objectives };
};

export default R.compose(
  connect(select, { fetchObjectives, fetchGroups }),
  withStyles(styles),
)(IndexObjective);
