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
import {
  CenterFocusStrongOutlined,
  CenterFocusWeakOutlined,
} from '@material-ui/icons';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import { fetchObjectives } from '../../../../actions/Objective';
import { fetchSubobjectives } from '../../../../actions/Subobjective';
import { fetchGroups } from '../../../../actions/Group';
import ObjectivePopover from './ObjectivePopover';
import SubobjectivePopover from './SubobjectivePopover';
import CreateObjective from './CreateObjective';
import ObjectiveView from './ObjectiveView';
import SubobjectiveView from './SubobjectiveView';

i18nRegister({
  fr: {
    Objectives: 'Objectifs',
    'You do not have any objectives in this exercise.':
      "Vous n'avez aucun objectif dans cet exercice.",
    'Objective view': "Vue de l'objectif",
    'Subobjective view': 'Vue du sous-objectif',
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
      openSubobjective: false,
      currentSubobjective: {},
    };
  }

  componentDidMount() {
    this.props.fetchObjectives(this.props.exerciseId);
    this.props.fetchSubobjectives(this.props.exerciseId);
    this.props.fetchGroups();
  }

  handleOpenObjective(objective) {
    this.setState({ currentObjective: objective, openObjective: true });
  }

  handleCloseObjective() {
    this.setState({ openObjective: false });
  }

  handleOpenSubobjective(subobjective) {
    this.setState({
      currentSubobjective: subobjective,
      openSubobjective: true,
    });
  }

  handleCloseSubobjective() {
    this.setState({ openSubobjective: false });
  }

  render() {
    const { classes } = this.props;
    const { exerciseId, objectives } = this.props;
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
          {objectives.map((objective) => {
            const nestedItems = objective.objective_subobjectives.map(
              (data) => {
                const subobjective = R.propOr(
                  {},
                  data.subobjective_id,
                  this.props.subobjectives,
                );
                const subobjectiveId = R.propOr(
                  data.subobjective_id,
                  'subobjective_id',
                  subobjective,
                );
                const subobjectiveTitle = R.propOr(
                  '-',
                  'subobjective_title',
                  subobjective,
                );
                const subobjectiveDescription = R.propOr(
                  '-',
                  'subobjective_description',
                  subobjective,
                );
                const subobjectivePriority = R.propOr(
                  '-',
                  'subobjective_priority',
                  subobjective,
                );
                return (
                  <ListItem
                    key={subobjectiveId}
                    onClick={this.handleOpenSubobjective.bind(
                      this,
                      subobjective,
                    )}
                    button={true}
                    divider={true}
                    className={classes.nested}
                  >
                    <ListItemIcon>
                      <CenterFocusWeakOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={subobjectiveTitle}
                      secondary={subobjectiveDescription}
                    />
                    <div className={classes.priority}>
                      {objective.objective_priority}.{subobjectivePriority}
                    </div>
                    {this.props.userCanUpdate && (
                      <ListItemSecondaryAction>
                        <SubobjectivePopover
                          exerciseId={exerciseId}
                          objectiveId={objective.objective_id}
                          subobjective={subobjective}
                        />
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                );
              },
            );
            return (
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
                  {this.props.userCanUpdate && (
                    <ListItemSecondaryAction>
                      <ObjectivePopover
                        exerciseId={exerciseId}
                        objective={objective}
                      />
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
                <Collapse in={true}>
                  <List>{nestedItems}</List>
                </Collapse>
              </div>
            );
          })}
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
        <Dialog
          open={this.state.openSubobjective}
          onClose={this.handleCloseSubobjective.bind(this)}
          fullWidth={true}
          maxWidth="xs"
        >
          <DialogTitle>
            {R.propOr(
              '-',
              'subobjective_title',
              this.state.currentSubobjective,
            )}
          </DialogTitle>
          <DialogContent>
            <SubobjectiveView subobjective={this.state.currentSubobjective} />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseSubobjective.bind(this)}
            >
              <T>Close</T>
            </Button>
          </DialogActions>
        </Dialog>
        {this.props.userCanUpdate && (
          <CreateObjective exerciseId={exerciseId} />
        )}
      </div>
    );
  }
}

IndexObjective.propTypes = {
  exerciseId: PropTypes.string,
  objectives: PropTypes.array,
  subobjectives: PropTypes.object,
  fetchObjectives: PropTypes.func.isRequired,
  fetchSubobjectives: PropTypes.func.isRequired,
  userCanUpdate: PropTypes.bool,
};

const filterObjectives = (objectives, exerciseId) => {
  const objectivesFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.objective_exercise.exercise_id === exerciseId),
    R.sortWith([R.ascend(R.prop('objective_priority'))]),
  );
  return objectivesFilterAndSorting(objectives);
};

const filterSubobjectives = (subobjectives) => {
  const subobjectivesSorting = R.pipe(
    R.values,
    R.sortWith([R.ascend(R.prop('subobjective_priority'))]),
    R.indexBy(R.prop('subobjective_id')),
  );
  return subobjectivesSorting(subobjectives);
};

const checkUserCanUpdate = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  const userId = R.path(['logged', 'user'], state.app);
  let userCanUpdate = R.path(
    [userId, 'user_admin'],
    state.referential.entities.users,
  );
  if (!userCanUpdate) {
    const groupValues = R.values(state.referential.entities.groups);
    groupValues.forEach((group) => {
      group.group_grants.forEach((grant) => {
        if (
          grant
          && grant.grant_exercise
          && grant.grant_exercise.exercise_id === exerciseId
          && grant.grant_name === 'PLANNER'
        ) {
          group.group_users.forEach((user) => {
            if (user && user.user_id === userId) {
              userCanUpdate = true;
            }
          });
        }
      });
    });
  }

  return userCanUpdate;
};

const select = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  const objectives = filterObjectives(
    state.referential.entities.objectives,
    exerciseId,
  );
  const subobjectives = filterSubobjectives(
    state.referential.entities.subobjectives,
  );
  const userCanUpdate = checkUserCanUpdate(state, ownProps);

  return {
    exerciseId,
    objectives,
    subobjectives,
    userCanUpdate,
  };
};

export default R.compose(
  connect(select, {
    fetchObjectives,
    fetchSubobjectives,
    fetchGroups,
  }),
  withStyles(styles),
)(IndexObjective);
