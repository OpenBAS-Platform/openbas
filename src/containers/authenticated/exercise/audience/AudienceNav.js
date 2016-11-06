import React, {PropTypes, Component} from 'react'
import {connect} from 'react-redux'
import createImmutableSelector from '../../../../utils/ImmutableSelect'
import {fromJS} from 'immutable'
import R from 'ramda'
import * as Constants from '../../../../constants/ComponentTypes'
import {fetchAudiences, selectAudience} from '../../../../actions/Audience'
import {Drawer} from '../../../../components/Drawer'
import {List} from '../../../../components/List'
import {ListItemLink} from '../../../../components/list/ListItem';
import {Icon} from '../../../../components/Icon'
import CreateAudience from './CreateAudience'

class AudienceNav extends Component {
  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId);
  }

  handleChangeAudience(audienceId) {
    this.props.selectAudience(audienceId)
  }

  render() {
    return (
      <Drawer width={300} docked={true} open={true} openSecondary={true} zindex={50}>
        <CreateAudience exerciseId={this.props.exerciseId}/>
        <List>
          {this.props.audiences.toList().map(audience => {
            return (
              <ListItemLink
                key={audience.get('audience_id')}
                active={this.props.currentAudience === audience.get('audience_id')}
                onClick={this.handleChangeAudience.bind(this, audience.get('audience_id'))}
                label={audience.get('audience_name')}
                leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}/>}
              />
            )
          })}
        </List>
      </Drawer>
    );
  }
}

AudienceNav.propTypes = {
  exerciseId: PropTypes.string,
  currentAudience: PropTypes.string,
  audiences: PropTypes.object,
  fetchAudiences: PropTypes.func,
  selectAudience: PropTypes.func
}

const audiencesSelector = (state, props) => {
  const audiences = state.application.getIn(['entities', 'audiences']).toJS()
  var filterByExercise = n => n.audience_exercise === props.exerciseId
  var filteredAudiences = R.filter(filterByExercise, audiences)
  return fromJS(filteredAudiences)
}

const filteredAudiences = createImmutableSelector(audiencesSelector, audiences => audiences)

const select = (state, props) => {
  return {
    audiences: filteredAudiences(state, props),
    currentAudience: state.application.getIn(['ui', 'states', 'current_audience'])
  }
}

export default connect(select, {fetchAudiences, selectAudience})(AudienceNav);