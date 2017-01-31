import React, {Component, PropTypes} from 'react'
import R from 'ramda'
import {i18nRegister} from '../../../../../utils/Messages'
import {T} from '../../../../../components/I18n'
import * as Constants from '../../../../../constants/ComponentTypes'
import {Chip} from '../../../../../components/Chip'
import {Avatar} from '../../../../../components/Avatar'
import {List} from '../../../../../components/List'
import {MainSmallListItem, SecondarySmallListItem} from '../../../../../components/list/ListItem'
import {SimpleTextField} from '../../../../../components/SimpleTextField'
import {Icon} from '../../../../../components/Icon'

const styles = {
  'name': {
    float: 'left',
    width: '80%',
    padding: '5px 0 0 0'
  },
  'empty': {
    margin: '0 auto',
    marginTop: '10px',
    textAlign: 'center'
  }
}

i18nRegister({
  fr: {
    'No audience found.': 'Aucune audience trouvée.',
    'Search for an audience': 'Rechercher une audience'
  }
})

class InjectAudiences extends Component {
  constructor(props) {
    super(props);
    this.state = {audiencesIds: this.props.injectAudiencesIds, subaudiencesIds: this.props.injectSubaudiencesIds, searchTerm: ''}
  }

  handleSearchAudiences(event, value) {
    this.setState({searchTerm: value})
  }

  addAudience(audienceId) {
    if (!this.state.audiencesIds.includes(audienceId)) {
      let audiencesIds = R.append(audienceId, this.state.audiencesIds)
      this.setState({audiencesIds: audiencesIds})
      this.submitAudiences(audiencesIds)
    }
  }

  removeAudience(audienceId) {
    let audiencesIds = R.filter(a => a !== audienceId, this.state.audiencesIds)
    this.setState({audiencesIds: audiencesIds})
    this.submitAudiences(audiencesIds)
  }

  addSubaudience(subaudienceId) {
    if (!this.state.subaudiencesIds.includes(subaudienceId)) {
      let subaudiencesIds = R.append(subaudienceId, this.state.subaudiencesIds)
      this.setState({subaudiencesIds: subaudiencesIds})
      this.submitSubaudiences(subaudiencesIds)
    }
  }

  removeSubaudience(subaudienceId) {
    let subaudiencesIds = R.filter(a => a !== subaudienceId, this.state.subaudiencesIds)
    this.setState({subaudiencesIds: subaudiencesIds})
    this.submitSubaudiences(subaudiencesIds)
  }

  submitAudiences(audiences_ids) {
    this.props.onChangeAudiences(audiences_ids)
  }

  submitSubaudiences(subaudiences_ids) {
    this.props.onChangeSubaudiences(subaudiences_ids)
  }

  render() {
    //region filter audiences by active keyword
    const keyword = this.state.searchTerm
    let filterAudiencesByKeyword = n => keyword === '' || n.audience_name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    let filteredAudiences = R.filter(filterAudiencesByKeyword, this.props.audiences)
    //endregion

    return (
      <div>
        <SimpleTextField name="keyword" fullWidth={true} type="text" hintText="Search for an audience"
                         onChange={this.handleSearchAudiences.bind(this)} styletype={Constants.FIELD_TYPE_INLINE}/>
        <div>
          {this.state.audiencesIds.map(audienceId => {
            let audience = R.find(a => a.audience_id === audienceId)(this.props.audiences)
            let audience_name = R.propOr('-', 'audience_name', audience)
            return (
              <Chip key={audienceId} onRequestDelete={this.removeAudience.bind(this, audienceId)}
                    type={Constants.CHIP_TYPE_LIST}>
                <Avatar icon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}/>} size={32}
                        type={Constants.AVATAR_TYPE_CHIP}/>
                {audience_name}
              </Chip>
            )
          })}
          {this.state.subaudiencesIds.map(subaudienceId => {
            let subaudience = R.find(a => a.subaudience_id === subaudienceId)(this.props.subaudiences)
            let audience = R.find(a => a.audience_id === subaudience.subaudience_audience.audience_id)(this.props.audiences)
            let audience_name = R.propOr('-', 'audience_name', audience)
            let subaudience_name = R.propOr('-', 'subaudience_name', subaudience)
            return (
              <Chip key={subaudienceId} onRequestDelete={this.removeSubaudience.bind(this, subaudienceId)}
                    type={Constants.CHIP_TYPE_LIST}>
                <Avatar icon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}/>} size={32}
                        type={Constants.AVATAR_TYPE_CHIP}/>
                [{audience_name}] {subaudience_name}
              </Chip>
            )
          })}
          <div className="clearfix"></div>
        </div>
        <div>
          {filteredAudiences.length === 0 ? <div style={styles.empty}><T>No audience found.</T></div> : ""}
          <List>
            {filteredAudiences.map(audience => {
              let disabled = R.find(audience_id => audience_id === audience.audience_id, this.state.audiencesIds) !== undefined
              let nestedItems = audience.audience_subaudiences.map(data => {
                  let subaaudienceDisabled = R.find(subaudience_id => subaudience_id === data.subaudience_id, this.state.subaudiencesIds) !== undefined
                  let subaudience = R.find(a => a.subaudience_id === data.subaudience_id)(this.props.subaudiences)
                  let subaudience_id = R.propOr(data.subaudience_id, 'subaudience_id', subaudience)
                  let subaudience_name = R.propOr('-', 'subaudience_name', subaudience)

                  return <SecondarySmallListItem
                    key={subaudience_id}
                    disabled={subaaudienceDisabled}
                    onClick={this.addSubaudience.bind(this, subaudience.subaudience_id)}
                    primaryText={
                      <div>
                        <div style={styles.name}>{subaudience_name}</div>
                        <div className="clearfix"></div>
                      </div>
                    }
                    leftAvatar={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP} type={Constants.ICON_TYPE_LIST}/>}/>
                }
              )

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
                  leftAvatar={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP} type={Constants.ICON_TYPE_LIST}/>}
                  nestedItems={nestedItems}
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
  onChangeAudiences: PropTypes.func,
  onChangeSubaudiences: PropTypes.func,
  injectAudiencesIds: PropTypes.array,
  injectSubaudiencesIds: PropTypes.array,
  audiences: PropTypes.array,
  subaudiences: PropTypes.array
}

export default InjectAudiences