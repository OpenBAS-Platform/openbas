import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import {T} from '../../../../components/I18n'
import {i18nRegister} from '../../../../utils/Messages'
import * as Constants from '../../../../constants/ComponentTypes'
import {fetchAudiences} from '../../../../actions/Audience'
import {Icon} from '../../../../components/Icon'
import {List} from '../../../../components/List'
import {MainListItemLink} from '../../../../components/list/ListItem';
import CreateAudience from './audience/CreateAudience'

const styles = {
  container: {
    textAlign: 'left'
  },
  'empty': {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center'
  },
  'title': {
    float: 'left',
    fontSize: '13px',
    textTransform: 'uppercase'
  }
}

i18nRegister({
  fr: {
    'Audiences': 'Audiences',
    'You do not have any audiences in this exercise.': 'Vous n\'avez aucune audience dans cet exercice.',
    'players': 'joueurs'
  }
})

class IndexAudiences extends Component {
  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId);
  }

  render() {
    return (
      <div style={styles.container}>
        <div style={styles.title}><T>Audiences</T></div>
        <div className="clearfix"></div>
        {this.props.audiences.length === 0 ?<div style={styles.empty}><T>You do not have any events in this exercise.</T></div> : ""}
        <List>
          {this.props.audiences.map(audience => {
            return (
              <MainListItemLink
                to={'/private/exercise/' + this.props.exerciseId + '/audiences/' + audience.audience_id}
                key={audience.audience_id}
                leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}/>}
                primaryText={
                  <div>
                    {audience.audience_name}
                  </div>
                }
                secondaryText={
                  <div>
                    {audience.audience_users_number}&nbsp;
                    <T>players</T>
                  </div>
                }
                rightIcon={<Icon name={Constants.ICON_NAME_HARDWARE_KEYBOARD_ARROW_RIGHT}/>}
              />
            )
          })}
        </List>
        <CreateAudience exerciseId={this.props.exerciseId}/>
      </div>
    )
  }
}

IndexAudiences.propTypes = {
  exerciseId: PropTypes.string,
  audiences: PropTypes.array,
  fetchAudiences: PropTypes.func.isRequired,
}

const filteredAudiences = (audiences, exerciseId) => {
  let audiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.audience_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.audience_name.localeCompare(b.audience_name))
  )
  return audiencesFilterAndSorting(audiences)
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let audiences = filteredAudiences(state.referential.entities.audiences, exerciseId)

  return {
    exerciseId,
    audiences
  }
}

export default connect(select, {fetchAudiences})(IndexAudiences);