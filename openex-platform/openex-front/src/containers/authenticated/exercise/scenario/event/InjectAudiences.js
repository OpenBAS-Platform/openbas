import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';
import * as Constants from '../../../../../constants/ComponentTypes';
import { Chip } from '../../../../../components/Chip';
import { Toggle } from '../../../../../components/Toggle';
import { Avatar } from '../../../../../components/Avatar';
import { List } from '../../../../../components/List';
import {
  MainSmallListItem,
  SecondarySmallListItem,
} from '../../../../../components/list/ListItem';
import { SimpleTextField } from '../../../../../components/SimpleTextField';
import { Icon } from '../../../../../components/Icon';

const styles = {
  name: {
    float: 'left',
    width: '80%',
    padding: '5px 0 0 0',
  },
  empty: {
    margin: '0 auto',
    marginTop: '10px',
    textAlign: 'center',
  },
};

i18nRegister({
  fr: {
    'No audience found.': 'Aucune audience trouvée.',
    'Search for an audience': 'Rechercher une audience',
    'All audiences': 'Toutes les audiences',
  },
});

class InjectAudiences extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audiencesIds: this.props.injectAudiencesIds,
      subaudiencesIds: this.props.injectSubaudiencesIds,
      searchTerm: '',
      selectAll: this.props.selectAll,
    };
  }

  componentDidMount() {
    if (this.state.audiencesIds.length === this.props.audiences.length) {
      this.setState({ selectAll: true });
    }
  }

  handleSearchAudiences(event, value) {
    this.setState({ searchTerm: value });
  }

  addAudience(audienceId) {
    if (!this.state.audiencesIds.includes(audienceId)) {
      const audiencesIds = R.append(audienceId, this.state.audiencesIds);
      this.setState({ audiencesIds });
      this.submitAudiences(audiencesIds);
    }
  }

  removeAudience(audienceId) {
    const audiencesIds = R.filter(
      (a) => a !== audienceId,
      this.state.audiencesIds,
    );
    this.setState({ audiencesIds });
    this.submitAudiences(audiencesIds);
  }

  addSubaudience(subaudienceId) {
    if (!this.state.subaudiencesIds.includes(subaudienceId)) {
      const subaudiencesIds = R.append(
        subaudienceId,
        this.state.subaudiencesIds,
      );
      this.setState({ subaudiencesIds });
      this.submitSubaudiences(subaudiencesIds);
    }
  }

  removeSubaudience(subaudienceId) {
    const subaudiencesIds = R.filter(
      (a) => a !== subaudienceId,
      this.state.subaudiencesIds,
    );
    this.setState({ subaudiencesIds });
    this.submitSubaudiences(subaudiencesIds);
  }

  toggleAll(event, value) {
    this.setState({ selectAll: value });
    this.submitSelectAll(value);
  }

  submitAudiences(audiencesIds) {
    this.props.onChangeAudiences(audiencesIds);
  }

  submitSubaudiences(subaudiencesIds) {
    this.props.onChangeSubaudiences(subaudiencesIds);
  }

  submitSelectAll(selectAll) {
    this.props.onChangeSelectAll(selectAll);
  }

  render() {
    // region filter audiences by active keyword
    const keyword = this.state.searchTerm;
    const filterAudiencesByKeyword = (n) => keyword === ''
      || n.audience_name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    const filteredAudiences = R.filter(
      filterAudiencesByKeyword,
      this.props.audiences,
    );
    // endregion

    return (
      <div>
        <Toggle
          name="all"
          label={
            <strong>
              <T>All audiences</T>
            </strong>
          }
          onToggle={this.toggleAll.bind(this)}
          toggled={this.state.selectAll}
        />
        <br />
        {this.state.selectAll ? (
          ''
        ) : (
          <SimpleTextField
            name="keyword"
            fullWidth={true}
            type="text"
            hintText="Search for an audience"
            onChange={this.handleSearchAudiences.bind(this)}
            styletype={Constants.FIELD_TYPE_INLINE}
          />
        )}
        <div>
          {this.state.selectAll
            ? ''
            : this.state.audiencesIds.map((audienceId) => {
              const audience = R.find((a) => a.audience_id === audienceId)(
                this.props.audiences,
              );
              const audienceName = R.propOr('-', 'audience_name', audience);
              return (
                  <Chip
                    key={audienceId}
                    onRequestDelete={this.removeAudience.bind(this, audienceId)}
                    type={Constants.CHIP_TYPE_LIST}
                  >
                    <Avatar
                      icon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP} />}
                      size={32}
                      type={Constants.AVATAR_TYPE_CHIP}
                    />
                    {audienceName}
                  </Chip>
              );
            })}
          {this.state.selectAll
            ? ''
            : this.state.subaudiencesIds.map((subaudienceId) => {
              const subaudience = R.find(
                (a) => a.subaudience_id === subaudienceId,
              )(this.props.subaudiences);
              const audience = R.find(
                (a) => a.audience_id
                    === subaudience.subaudience_audience.audience_id,
              )(this.props.audiences);
              const audienceName = R.propOr('-', 'audience_name', audience);
              const subaudienceName = R.propOr(
                '-',
                'subaudience_name',
                subaudience,
              );
              const disabled = R.find(
                (audienceId) => audienceId
                      === subaudience.subaudience_audience.audience_id,
                this.state.audiencesIds,
              ) !== undefined;

              if (!disabled) {
                return (
                    <Chip
                      key={subaudienceId}
                      onRequestDelete={this.removeSubaudience.bind(
                        this,
                        subaudienceId,
                      )}
                      type={Constants.CHIP_TYPE_LIST}
                    >
                      <Avatar
                        icon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP} />}
                        size={32}
                        type={Constants.AVATAR_TYPE_CHIP}
                      />
                      [{audienceName}] {subaudienceName}
                    </Chip>
                );
              }
              return <div key={subaudienceId}> &nbsp; </div>;
            })}
          <div className="clearfix" />
        </div>
        <div>
          {filteredAudiences.length === 0 ? (
            <div style={styles.empty}>
              <T>No audience found.</T>
            </div>
          ) : (
            ''
          )}
          <List>
            {this.state.selectAll
              ? ''
              : filteredAudiences.map((audience) => {
                const disabled = R.find(
                  (audienceId) => audienceId === audience.audience_id,
                  this.state.audiencesIds,
                ) !== undefined;
                const nestedItems = !disabled
                  ? audience.audience_subaudiences.map((data) => {
                    const subaaudienceDisabled = R.find(
                      (subaudienceId) => subaudienceId === data.subaudience_id,
                      this.state.subaudiencesIds,
                    ) !== undefined;
                    const subaudience = R.find(
                      (a) => a.subaudience_id === data.subaudience_id,
                    )(this.props.subaudiences);
                    const subaudienceId = R.propOr(
                      data.subaudience_id,
                      'subaudience_id',
                      subaudience,
                    );
                    const subaudienceName = R.propOr(
                      '-',
                      'subaudience_name',
                      subaudience,
                    );

                    return (
                          <SecondarySmallListItem
                            key={subaudienceId}
                            disabled={subaaudienceDisabled}
                            onClick={this.addSubaudience.bind(
                              this,
                              subaudience.subaudience_id,
                            )}
                            primaryText={
                              <div>
                                <div style={styles.name}>{subaudienceName}</div>
                                <div className="clearfix"></div>
                              </div>
                            }
                            leftAvatar={
                              <Icon
                                name={Constants.ICON_NAME_SOCIAL_GROUP}
                                type={Constants.ICON_TYPE_LIST}
                              />
                            }
                          />
                    );
                  })
                  : '';

                return (
                    <MainSmallListItem
                      key={audience.audience_id}
                      disabled={disabled}
                      onClick={this.addAudience.bind(
                        this,
                        audience.audience_id,
                      )}
                      primaryText={
                        <div>
                          <div style={styles.name}>
                            {audience.audience_name}
                          </div>
                          <div className="clearfix" />
                        </div>
                      }
                      leftAvatar={
                        <Icon
                          name={Constants.ICON_NAME_SOCIAL_GROUP}
                          type={Constants.ICON_TYPE_LIST}
                        />
                      }
                      nestedItems={nestedItems}
                    />
                );
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
  onChangeAudiences: PropTypes.func,
  onChangeSubaudiences: PropTypes.func,
  onChangeSelectAll: PropTypes.func,
  injectAudiencesIds: PropTypes.array,
  injectSubaudiencesIds: PropTypes.array,
  audiences: PropTypes.array,
  subaudiences: PropTypes.array,
  selectAll: PropTypes.bool,
};

export default InjectAudiences;
