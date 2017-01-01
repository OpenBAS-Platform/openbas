import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import {T} from '../../../../components/I18n'
import {i18nRegister} from '../../../../utils/Messages'
import * as Constants from '../../../../constants/ComponentTypes'
import {List} from '../../../../components/List'
import {MainListItem, SecondaryListItem} from '../../../../components/list/ListItem';
import {Icon} from '../../../../components/Icon'
import {fetchObjectives} from '../../../../actions/Objective'
import {fetchSubobjectives} from '../../../../actions/Subobjective'
import ObjectivePopover from './ObjectivePopover'
import SubobjectivePopover from './SubobjectivePopover'
import CreateObjective from './CreateObjective'

i18nRegister({
  fr: {
    'Objectives': 'Objectifs',
    'You do not have any objectives in this exercise.': 'Vous n\'avez aucun objectif dans cet exercice.'
  }
})

const styles = {
  container: {},
  'empty': {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center'
  },
  'priority': {
    fontSize: '18px',
    fontWeight: 500,
    marginRight: '10px'
  },
  'title': {
    float: 'left',
    fontSize: '13px',
    textTransform: 'uppercase'
  }
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
        <div style={styles.title}><T>Objectives</T></div>
        <div className="clearfix"></div>
        <List>
          {objectives.map(objective => {
            let nestedItems = objective.objective_subobjectives.map(data => {
                let subobjective = R.propOr({}, data.subobjective_id, this.props.subobjectives)
                let subobjective_id = R.propOr(data.subobjective_id, 'subobjective_id', subobjective)
                let subobjective_title = R.propOr('-', 'subobjective_title', subobjective)
                let subobjective_description = R.propOr('-', 'subobjective_description', subobjective)
                let subobjective_priority = R.propOr('-', 'subobjective_priority', subobjective)

                return <SecondaryListItem
                  key={subobjective_id}
                  rightIconButton={<SubobjectivePopover exerciseId={exerciseId} objectiveId={objective.objective_id} subobjective={subobjective}/>}
                  leftIcon={<Icon name={Constants.ICON_NAME_IMAGE_CENTER_FOCUS_WEAK}/>}
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
                leftIcon={<Icon name={Constants.ICON_NAME_IMAGE_CENTER_FOCUS_STRONG}/>}
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
        <div style={styles.title}><T>Objectives</T></div>
        <div className="clearfix"></div>
        <div style={styles.empty}><T>You do not have any objectives in this exercise.</T></div>
        <CreateObjective exerciseId={exerciseId}/>
      </div>
    }
  }
}

IndexObjective.propTypes = {
  exerciseId: PropTypes.string,
  objectives: PropTypes.array,
  subobjectives: PropTypes.object,
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
  let subobjectivesSorting = R.pipe(
    R.values,
    R.sort((a, b) => { return a.subobjective_priority > b.subobjective_priority }),
    R.indexBy(R.prop('subobjective_id'))
  )
  return subobjectivesSorting(subobjectives)
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