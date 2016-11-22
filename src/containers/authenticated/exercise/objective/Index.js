import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import createImmutableSelector from '../../../../utils/ImmutableSelect'
import R from 'ramda'
import {List} from '../../../../components/List'
import {MainListItem, SecondaryListItem} from '../../../../components/list/ListItem';
import {fetchObjectives} from '../../../../actions/Objective'
import {fetchSubobjectives} from '../../../../actions/Subobjective'
import ObjectivePopover from './ObjectivePopover'
import SubobjectivePopover from './SubobjectivePopover'
import CreateObjective from './CreateObjective'

const styles = {
  container: {

  },
  'empty': {
    marginTop: 40,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center'
  },
  'priority': {
    fontSize: '18px',
    fontWeight: 500,
    marginRight: '10px'
  },
}

const filterObjectives = (objectives, exerciseId) => {
  var filterByExercise = n => n.objective_exercise === exerciseId
  var filteredObjectives = R.filter(filterByExercise, objectives.toJS())
  return fromJS(filteredObjectives)
}

class IndexObjective extends Component {
  componentDidMount() {
    this.props.fetchObjectives(this.props.exerciseId);
  }

  render() {
    return (
      <div style={styles.container}>
        {this.props.objectives.count() === 0 ? <div style={styles.empty}>You do not have any objectives in this exercise.</div>:""}
        <List>
          {this.props.objectives.toList().map(objective => {
            let subobjectives = objective.get('objective_subobjectives').map(id => this.props.subobjectives.get(id))
            let nestedItems = subobjectives.map(subobjective =>
              <SecondaryListItem
                key={subobjective.get('subobjective_id')}
                rightIconButton={
                  <SubobjectivePopover
                    exerciseId={this.props.exerciseId}
                    objectiveId={objective.get('objective_id')}
                    subobjectiveId={subobjective.get('subobjective_id')}
                  />
                }
                primaryText={
                  <div>
                    <span style={styles.priority}>{objective.get('objective_priority')}.{subobjective.get('subobjective_priority')}</span>
                    {subobjective.get('subobjective_title')}
                  </div>
                }
                secondaryText={subobjective.get('subobjective_description')} />
            )

            return (
              <MainListItem
                key={objective.get('objective_id')}
                rightIconButton={
                  <ObjectivePopover
                    exerciseId={this.props.exerciseId}
                    objectiveId={objective.get('objective_id')}
                  />
                }
                primaryText={
                  <div>
                    <span style={styles.priority}>{objective.get('objective_priority')}</span>
                    {objective.get('objective_title')}
                  </div>
                }
                secondaryText={objective.get('objective_description')}
                nestedItems={nestedItems.toJS()}
              />
            )
          })}
        </List>
        <CreateObjective exerciseId={this.props.exerciseId}/>
      </div>
    );
  }
}

IndexObjective.propTypes = {
  exerciseId: PropTypes.string,
  objectives: PropTypes.object,
  subobjectives: PropTypes.object,
  fetchObjectives: PropTypes.func.isRequired,
  fetchSubobjectives: PropTypes.func.isRequired,
}

const filteredObjectives = createImmutableSelector(
  (state, exerciseId) => filterObjectives(state.application.getIn(['entities', 'objectives']), exerciseId),
  objectives => objectives)

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  return {
    exerciseId,
    objectives: filteredObjectives(state, exerciseId),
    subobjectives: state.application.getIn(['entities', 'subobjectives'])
  }
}

export default connect(select, {fetchObjectives, fetchSubobjectives})(IndexObjective);