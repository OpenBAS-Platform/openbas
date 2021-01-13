import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Dialog from '@material-ui/core/Dialog';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import * as Constants from '../../../../constants/ComponentTypes';
import { List } from '../../../../components/List';
import {
  MainListItem,
  SecondaryListItem,
} from '../../../../components/list/ListItem';
import { Icon } from '../../../../components/Icon';
import { FlatButton } from '../../../../components/Button';
/* eslint-disable */
import { fetchObjectives } from "../../../../actions/Objective";
import { fetchSubobjectives } from "../../../../actions/Subobjective";
import { fetchGroups } from "../../../../actions/Group";
import ObjectivePopover from "./ObjectivePopover";
import SubobjectivePopover from "./SubobjectivePopover";
import CreateObjective from "./CreateObjective";
import ObjectiveView from "./ObjectiveView";
import SubobjectiveView from "./SubobjectiveView";
/* eslint-enable */

i18nRegister({
  fr: {
    Objectives: 'Objectifs',
    'You do not have any objectives in this exercise.':
      "Vous n'avez aucun objectif dans cet exercice.",
    'Objective view': "Vue de l'objectif",
    'Subobjective view': 'Vue du sous-objectif',
  },
});

const styles = {
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
    fontSize: '18px',
    fontWeight: 500,
    marginRight: '10px',
  },
  title: {
    float: 'left',
    fontSize: '13px',
    textTransform: 'uppercase',
  },
};

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
    const objectiveActions = [
      <FlatButton
        key="close"
        label="Close"
        primary={true}
        onClick={this.handleCloseObjective.bind(this)}
      />,
    ];
    const subobjectiveActions = [
      <FlatButton
        key="close"
        label="Close"
        primary={true}
        onClick={this.handleCloseSubobjective.bind(this)}
      />,
    ];

    const { exerciseId, objectives } = this.props;
    if (objectives.length > 0) {
      return (
        <div style={styles.container}>
          <div style={styles.title}>
            <T>Objectives</T>
          </div>
          <div className="clearfix" />
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
                    <SecondaryListItem
                      key={subobjectiveId}
                      onClick={this.handleOpenSubobjective.bind(
                        this,
                        subobjective,
                      )}
                      rightIconButton={
                        this.props.userCanUpdate ? (
                          <SubobjectivePopover
                            exerciseId={exerciseId}
                            objectiveId={objective.objective_id}
                            subobjective={subobjective}
                          />
                        ) : (
                          ''
                        )
                      }
                      leftIcon={
                        <Icon
                          name={Constants.ICON_NAME_IMAGE_CENTER_FOCUS_WEAK}
                        />
                      }
                      primaryText={
                        <div>
                          <span style={styles.priority}>
                            {objective.objective_priority}.
                            {subobjectivePriority}
                          </span>
                          {subobjectiveTitle}
                        </div>
                      }
                      secondaryText={subobjectiveDescription}
                    />
                  );
                },
              );

              return (
                <MainListItem
                  initiallyOpen={true}
                  key={objective.objective_id}
                  onClick={this.handleOpenObjective.bind(this, objective)}
                  leftIcon={
                    <Icon
                      name={Constants.ICON_NAME_IMAGE_CENTER_FOCUS_STRONG}
                    />
                  }
                  rightIconButton={
                    this.props.userCanUpdate ? (
                      <ObjectivePopover
                        exerciseId={exerciseId}
                        objective={objective}
                      />
                    ) : (
                      ''
                    )
                  }
                  primaryText={
                    <div>
                      <span style={styles.priority}>
                        {objective.objective_priority}
                      </span>
                      {objective.objective_title}
                    </div>
                  }
                  secondaryText={objective.objective_description}
                  nestedItems={nestedItems}
                />
              );
            })}
          </List>

          <Dialog
            title={R.propOr(
              '-',
              'objective_title',
              this.state.currentObjective,
            )}
            modal={false}
            open={this.state.openObjective}
            autoScrollBodyContent={true}
            onRequestClose={this.handleCloseObjective.bind(this)}
            actions={objectiveActions}
          >
            <ObjectiveView objective={this.state.currentObjective} />
          </Dialog>

          <Dialog
            title={R.propOr(
              '-',
              'subobjective_title',
              this.state.currentSubobjective,
            )}
            modal={false}
            open={this.state.openSubobjective}
            autoScrollBodyContent={true}
            onRequestClose={this.handleCloseSubobjective.bind(this)}
            actions={subobjectiveActions}
          >
            <SubobjectiveView subobjective={this.state.currentSubobjective} />
          </Dialog>

          {this.props.userCanUpdate ? (
            <CreateObjective exerciseId={exerciseId} />
          ) : (
            ''
          )}
        </div>
      );
    }
    return (
      <div style={styles.container}>
        <div style={styles.title}>
          <T>Objectives</T>
        </div>
        <div className="clearfix"></div>
        <div style={styles.empty}>
          <T>You do not have any objectives in this exercise.</T>
        </div>

        {this.props.userCanUpdate ? (
          <CreateObjective exerciseId={exerciseId} />
        ) : (
          ''
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
    R.sort((a, b) => a.objective_priority > b.objective_priority),
  );
  return objectivesFilterAndSorting(objectives);
};

const filterSubobjectives = (subobjectives) => {
  const subobjectivesSorting = R.pipe(
    R.values,
    R.sort((a, b) => a.subobjective_priority > b.subobjective_priority),
    R.indexBy(R.prop('subobjective_id')),
  );
  return subobjectivesSorting(subobjectives);
};

const checkUserCanUpdate = (state, ownProps) => {
  const { exerciseId } = ownProps.params;
  const userId = R.path(['logged', 'user'], state.app);
  const isAdmin = R.path(
    [userId, 'user_admin'],
    state.referential.entities.users,
  );

  let userCanUpdate = isAdmin;
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
  const { exerciseId } = ownProps.params;
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

export default connect(select, {
  fetchObjectives,
  fetchSubobjectives,
  fetchGroups,
})(IndexObjective);
