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

const filterAudiences = (audiences, exerciseId) => {
  var filterByExercise = n => n.audience_exercise === exerciseId
  var filteredAudiences = R.filter(filterByExercise, audiences.toJS())
  return fromJS(filteredAudiences)
}

class AudienceNav extends Component {
  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId);
  }

  handleChangeAudience(audienceId) {
    this.props.selectAudience(this.props.exerciseId, audienceId)
  }

  componentWillReceiveProps(nextProps) {
    //select default audience if exercise doesn't currently have one.
    let audiences = filterAudiences(nextProps.audiences, nextProps.exerciseId)
    if(nextProps.currentAudience === undefined && audiences.count() > 0) {
      this.props.selectAudience(nextProps.exerciseId, audiences.keySeq().first())
    }
  }

  render() {
    return (
      <Drawer width={300} docked={true} open={true} openSecondary={true} zindex={50}>
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

const filteredAudiences = createImmutableSelector(
  (state, props) => filterAudiences(state.application.getIn(['entities', 'audiences']), props.exerciseId),
  audiences => audiences)

const select = (state, props) => {
  return {
    audiences: filteredAudiences(state, props),
    currentAudience: state.application.getIn(['ui', 'states', 'current_audiences', props.exerciseId])
  }
}

export default connect(select, {fetchAudiences, selectAudience})(AudienceNav);