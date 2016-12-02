import React, {Component, PropTypes} from 'react'
import R from 'ramda'
import * as Constants from '../../../../../constants/ComponentTypes'
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
    this.state = {audiencesIds: this.props.injectAudiencesIds, searchTerm: ''}
  }

  handleSearchAudiences(event, value) {
    this.setState({searchTerm: value})
  }

  addAudience(audienceId) {
    let audiencesIds = R.append(audienceId, this.state.audiencesIds)
    this.setState({audiencesIds: audiencesIds})
    this.submitAudiences(audiencesIds)
  }

  removeAudience(audienceId) {
    let audiencesIds = R.filter(a => a !== audienceId, this.state.audiencesIds)
    this.setState({audiencesIds: audiencesIds})
    this.submitAudiences(audiencesIds)
  }

  submitAudiences(audiences_ids) {
    this.props.onChange(audiences_ids)
  }

  render() {
    //region filter audience by active keyword
    const keyword = this.state.searchTerm
    let filterByKeyword = n => keyword === '' || n.audience_name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    let filteredAudiences = R.filter(filterByKeyword, this.props.audiences)
    //endregion

    return (
      <div>
        <SimpleTextField name="keyword" fullWidth={true} type="text" hintText="Search for an audience" onChange={this.handleSearchAudiences.bind(this)}/>
        <div style={styles.list}>
          {this.state.audiencesIds.map(audienceId => {
            let audience = R.find(a => a.audience_id === audienceId)(this.props.audiences)
            let audience_name = R.propOr('-', 'audience_name', audience)
            return (
              <Chip key={audienceId} onRequestDelete={this.removeAudience.bind(this, audienceId)} type={Constants.CHIP_TYPE_LIST}>
                <Avatar icon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}/>} size={32}
                        type={Constants.AVATAR_TYPE_CHIP}/>
                {audience_name}
              </Chip>
            )
          })}
          <div className="clearfix"></div>
        </div>
        <div style={styles.search}>
          {this.props.audiences.length === 0 ? <div style={styles.empty}>No audience found.</div> : ""}
          <List>
            {filteredAudiences.map(audience => {
              let disabled = R.find(audience_id => audience_id === audience.audience_id, this.state.audiencesIds) !== undefined
              return (
                <MainSmallListItem
                  key={audience.audience_id}
                  disabled={disabled}
                  onClick={this.addAudience.bind(this, audience.audience_id)}
                  primaryText={
                    <div>
                      <div style={styles.name}>{audience.audience_name}</div>
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
    )
  }
}

InjectAudiences.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  incidentId: PropTypes.string,
  injectId: PropTypes.string,
  fetchAudiences: PropTypes.func,
  searchAudiences: PropTypes.func,
  onChange: PropTypes.func,
  injectAudiencesIds: PropTypes.array,
  audiences: PropTypes.array,
}

export default InjectAudiences