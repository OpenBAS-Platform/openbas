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
    this.state = {searchTerm: '', audiences: []}
  }

  componentDidMount() {
    this.setState({audiences: this.props.injectAudiencesIds})
  }

  handleSearchAudiences(event, value) {
    this.setState({searchTerm: value})
  }

  addAudience(audience) {
    this.setState({audiences: R.append(audience, this.state.audiences)})

    let audiencesIds = this.state.audiences_ids.push(audienceId)
    if (this.state.audiences_ids.keyOf(audienceId) === undefined) {
      this.setState({
        audiences_ids: audiencesIds
      })
    }
    this.submitAudiences(audiencesIds)
  }

  removeAudience(audienceId) {
    let audiencesIds = this.state.audiences_ids.delete(this.state.audiences_ids.keyOf(audienceId))
    this.setState({
      audiences_ids: audiencesIds
    })
    this.submitAudiences(audiencesIds)
  }

  submitAudiences(audiences_ids) {
    this.props.onChange(audiences_ids)
  }

  render() {

    //region filter audience by active keyword
    const keyword = this.state.searchTerm
    let filterByKeyword = n => keyword === '' ||
    n.audience_name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
    n.audience_description.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    let filteredAudiences = R.filter(filterByKeyword, R.values(this.props.audiences))
    //endregion

    return (
      <div>
        <SimpleTextField name="keyword" fullWidth={true} type="text" hintText="Search for an audience" onChange={this.handleSearchAudiences.bind(this)}/>
        <div style={styles.list}>
          {this.state.audiences_ids.toList().map(audienceId => {
            let audience = this.props.allAudiences.get(audienceId)
            if( audience ) {
              return (
                <Chip
                  key={audience.get('audience_id')}
                  onRequestDelete={this.removeAudience.bind(this, audience.get('audience_id'))}
                  type={Constants.CHIP_TYPE_LIST}
                >
                  <Avatar icon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}/>} size={32}
                          type={Constants.AVATAR_TYPE_CHIP}/>
                  {audience.get('audience_name')}
                </Chip>
              )
            } else {
              return (<div></div>)
            }
          })}
          <div className="clearfix"></div>
        </div>
        <div style={styles.search}>
          {this.props.audiences.count() === 0 ? <div style={styles.empty}>No audience found.</div> : ""}
          <List>
            {this.props.audiences.toList().map(audience => {
              let disabled = false
              if (this.state.audiences_ids.keyOf(audience.get('audience_id')) !== undefined ) {
                disabled = true
              }

              return (
                <MainSmallListItem
                  key={audience.get('audience_id')}
                  disabled={disabled}
                  onClick={this.addAudience.bind(this, audience.get('audience_id'))}
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

InjectAudiences.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  incidentId: PropTypes.string,
  injectId: PropTypes.string,
  fetchAudiences: PropTypes.func,
  searchAudiences: PropTypes.func,
  onChange: PropTypes.func,
  injectAudiencesIds: PropTypes.object,
  audiences: PropTypes.object,
}

export default InjectAudiences