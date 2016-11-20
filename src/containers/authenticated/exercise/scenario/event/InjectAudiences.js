import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Map, fromJS, List as iList} from 'immutable'
import createImmutableSelector from '../../../../../utils/ImmutableSelect'
import R from 'ramda'
import * as Constants from '../../../../../constants/ComponentTypes'
import {updateInject} from '../../../../../actions/Inject'
import {fetchAudiences, searchAudiences} from '../../../../../actions/Audience'
import {Chip} from '../../../../../components/Chip';
import {Avatar} from '../../../../../components/Avatar';
import {List} from '../../../../../components/List'
import {MainSmallListItem} from '../../../../../components/list/ListItem';
import {SimpleTextField} from '../../../../../components/SimpleTextField'
import {Icon} from '../../../../../components/Icon'

const styles = {
  list: {},
  search: {},
  'name': {
    float: 'left',
    width: '80%',
    padding: '5px 0 0 0'
  }
}

class InjectAudiences extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audiences_ids: iList(),
    }
  }

  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId);

    this.setState({
      audiences_ids: this.props.injectAudiencesIds,
    })
  }

  handleSearchAudiences(event, value) {
    this.props.searchAudiences(value)
  }

  addAudience(audience) {
    let audiencesIds = this.state.audiences_ids.push(audience.get('audience_id'))
    if (this.state.audiences_ids.keyOf(audience.get('audience_id')) === undefined) {
      this.setState({
        audiences_ids: audiencesIds
      })
    }
    this.submitAudiences(audiencesIds)
  }

  removeAudience(audience) {
    let audiencesIds = this.state.audiences_ids.delete(this.state.audiences_ids.keyOf(audience.get('audience_id')))
    this.setState({
      audiences_ids: audiencesIds
    })
    this.submitAudiences(audiencesIds)
  }

  submitAudiences(audiences_ids) {
    let data = Map({
      inject_audiences: audiences_ids
    })
    this.props.updateInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, this.props.injectId, data)
  }

  render() {
    return (
      <div>
        <SimpleTextField name="keyword" fullWidth={true} type="text" hintText="Search for an audience"
                         onChange={this.handleSearchAudiences.bind(this)}/>
        <div style={styles.list}>
          {this.state.audiences_ids.toList().map(audienceId => {
            let audience = this.props.audiences.get(audienceId)
            return (
              <Chip
                key={audience.get('audience_id')}
                onRequestDelete={this.removeAudience.bind(this, audience)}
                type={Constants.CHIP_TYPE_LIST}
              >
                <Avatar icon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}/>} size={32}
                        type={Constants.AVATAR_TYPE_CHIP}/>
                {audience.get('audience_name')}
              </Chip>
            )
          })}
          <div className="clearfix"></div>
        </div>
        <div style={styles.search}>
          <List>
            {this.props.audiences.toList().map(audience => {
              let disabled = false
              if (this.state.audiences_ids.keyOf(audience.get('audience_id')) !== undefined
                || this.props.injectAudiencesIds.keyOf(audience.get('audience_id')) !== undefined) {
                disabled = true
              }

              return (
                <MainSmallListItem
                  key={audience.get('audience_id')}
                  disabled={disabled}
                  onClick={this.addAudience.bind(this, audience)}
                  primaryText={
                    <div>
                      <div style={styles.name}>{audience.get('audience_name')}</div>
                      <div className="clearfix"></div>
                    </div>
                  }
                  leftAvatar={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}/>}
                />
              )
            })}
          </List>
        </div>
      </div>
    );
  }
}

const audiencesSelector = (state, props) => {
  const audiences = state.application.getIn(['entities', 'audiences']).toJS()
  let keyword = state.application.getIn(['ui', 'states', 'current_search_keyword'])
  var filterByKeyword = n => n.audience_exercise === props.exerciseId && (keyword === '' || n.audience_name.toLowerCase().indexOf(keyword) !== -1)
  var filteredAudiences = R.filter(filterByKeyword, audiences)
  return fromJS(filteredAudiences)
}
const filteredAudiences = createImmutableSelector(audiencesSelector, audiences => audiences)

InjectAudiences.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  incidentId: PropTypes.string,
  injectId: PropTypes.string,
  fetchAudiences: PropTypes.func,
  searchAudiences: PropTypes.func,
  updateInject: PropTypes.func,
  injectAudiencesIds: PropTypes.object,
  audiences: PropTypes.object,
}

const select = (state, props) => {
  return {
    audiences: filteredAudiences(state, props)
  }
}

export default connect(select, {fetchAudiences, searchAudiences, updateInject})(InjectAudiences);