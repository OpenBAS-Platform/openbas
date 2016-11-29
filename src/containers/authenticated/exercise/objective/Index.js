import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import {List} from '../../../../components/List'
import {MainListItem, SecondaryListItem} from '../../../../components/list/ListItem';
import {fetchObjectives} from '../../../../actions/Objective'
import {fetchSubobjectives} from '../../../../actions/Subobjective'
import ObjectivePopover from './ObjectivePopover'
import SubobjectivePopover from './SubobjectivePopover'
import CreateObjective from './CreateObjective'

const styles = {
  container: {},
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

class IndexObjective extends Component {
  componentDidMount() {
    this.props.fetchObjectives(this.props.exerciseId);
    this.props.fetchSubobjectives(this.props.exerciseId);
  }

  render() {
    let {exerciseId, objectives} = this.props
    if (objectives.length > 0) {
      return <div style={styles.container}>
        <List>
          {objectives.map(objective => {
            let nestedItems = objective.objective_subobjectives.map(data => {
                console.log('data', data)
                console.log('subobjectives', this.props.subobjectives)
                let subobjective = R.propOr({}, data.subobjective_id, this.props.subobjectives)
                console.log('subobjective', subobjective)
                let subobjective_id = R.propOr(data.subobjective_id, 'subobjective_id', subobjective)
                let subobjective_title = R.propOr('-', 'subobjective_title', subobjective)
                let subobjective_description = R.propOr('-', 'subobjective_description', subobjective)
                let subobjective_priority = R.propOr('-', 'subobjective_priority', subobjective)

                return <SecondaryListItem
                  key={subobjective_id}
                  rightIconButton={<SubobjectivePopover exerciseId={exerciseId} objectiveId={objective.objective_id} subobjective={subobjective}/>}
                  primaryText={
                    <div>
                      <span style={styles.priority}>{objective.objective_priority}.{subobjective_priority}</span>
                      {subobjective_title}
                    </div>
                  }
                  secondaryText={subobjective_description}/>
              }
            )

            return (
              <MainListItem
                key={objective.objective_id}
                rightIconButton={<ObjectivePopover exerciseId={exerciseId} objective={objective}/>}
                primaryText={
                  <div>
                    <span style={styles.priority}>{objective.objective_priority}</span>
                    {objective.objective_title}
                  </div>
                }
                secondaryText={objective.objective_description}
                nestedItems={nestedItems}
              />
            )
          })}
        </List>
        <CreateObjective exerciseId={exerciseId}/>
      </div>
    } else {
      return <div style={styles.container}>
        <div style={styles.empty}>You do not have any objectives in this exercise.</div>
        <CreateObjective exerciseId={exerciseId}/>
      </div>
    }
  }
}

IndexObjective.propTypes = {
  exerciseId: PropTypes.string,
  objectives: PropTypes.array,
  subobjectives: PropTypes.array,
  fetchObjectives: PropTypes.func.isRequired,
  fetchSubobjectives: PropTypes.func.isRequired,
}

const filterObjectives = (objectives, exerciseId) => {
  let objectivesFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.objective_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.objective_priority > b.objective_priority)
  )
  return objectivesFilterAndSorting(objectives)
}

const filterSubobjectives = (subobjectives) => {
  console.log('JE PASSE LA !!!!!')
  let sorted = R.sort((a, b) => { return console.log('AAAAAAAA', a, b) }, subobjectives)

  return sorted
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let objectives = filterObjectives(state.referential.entities.objectives, exerciseId)
  let subobjectives = filterSubobjectives(state.referential.entities.subobjectives)

  return {
    exerciseId,
    objectives,
    subobjectives
  }
}

export default connect(select, {fetchObjectives, fetchSubobjectives})(IndexObjective);