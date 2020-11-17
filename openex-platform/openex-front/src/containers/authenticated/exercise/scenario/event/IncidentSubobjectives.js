import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';
import * as Constants from '../../../../../constants/ComponentTypes';
import { Chip } from '../../../../../components/Chip';
import { Avatar } from '../../../../../components/Avatar';
import { List } from '../../../../../components/List';
import { MainSmallListItem } from '../../../../../components/list/ListItem';
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
    'No subobjective found.': 'Aucun sous-objectif trouvé.',
    'Search for a subobjective': 'Rechercher un sous-objectif',
  },
});

class IncidentSubobjectives extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subobjectivesIds: this.props.incidentSubobjectivesIds,
      searchTerm: '',
    };
  }

  handleSearchAudiences(event, value) {
    this.setState({ searchTerm: value });
  }

  addSubobjective(subobjectiveId) {
    const subobjectivesIds = R.append(
      subobjectiveId,
      this.state.subobjectivesIds,
    );
    this.setState({ subobjectivesIds });
    this.submitSubobjectives(subobjectivesIds);
  }

  removeSubobjective(subobjectiveId) {
    const subobjectivesIds = R.filter(
      (a) => a !== subobjectiveId,
      this.state.subobjectivesIds,
    );
    this.setState({ subobjectivesIds });
    this.submitSubobjectives(subobjectivesIds);
  }

  submitSubobjectives(subobjectives_ids) {
    this.props.onChange(subobjectives_ids);
  }

  render() {
    // region filter subobjectives by active keyword
    const keyword = this.state.searchTerm;
    const filterByKeyword = (n) => keyword === ''
      || n.subobjective_title.toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || n.subobjective_description
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1;
    const filteredSubobjectives = R.filter(
      filterByKeyword,
      R.values(this.props.subobjectives),
    );
    // endregion

    return (
      <div>
        <SimpleTextField
          name="keyword"
          fullWidth={true}
          type="text"
          hintText="Search for a subobjective"
          onChange={this.handleSearchAudiences.bind(this)}
          styletype={Constants.FIELD_TYPE_INLINE}
        />
        <div>
          {this.state.subobjectivesIds.map((subobjectiveId) => {
            const subobjective = R.find(
              (a) => a.subobjective_id === subobjectiveId,
            )(this.props.subobjectives);
            const subobjective_title = R.propOr(
              '-',
              'subobjective_title',
              subobjective,
            );
            return (
              <Chip
                key={subobjectiveId}
                onRequestDelete={this.removeSubobjective.bind(
                  this,
                  subobjectiveId,
                )}
                type={Constants.CHIP_TYPE_LIST}
              >
                <Avatar
                  icon={
                    <Icon name={Constants.ICON_NAME_IMAGE_CENTER_FOCUS_WEAK} />
                  }
                  size={32}
                  type={Constants.AVATAR_TYPE_CHIP}
                />
                {subobjective_title}
              </Chip>
            );
          })}
          <div className="clearfix"></div>
        </div>
        <div>
          {filteredSubobjectives.length === 0 ? (
            <div style={styles.empty}>
              <T>No subobjective found.</T>
            </div>
          ) : (
            ''
          )}
          <List>
            {filteredSubobjectives.map((subobjective) => {
              const disabled = R.find(
                (subobjective_id) => subobjective_id === subobjective.subobjective_id,
                this.state.subobjectivesIds,
              ) !== undefined;
              return (
                <MainSmallListItem
                  key={subobjective.subobjective_id}
                  disabled={disabled}
                  onClick={this.addSubobjective.bind(
                    this,
                    subobjective.subobjective_id,
                  )}
                  primaryText={
                    <div>
                      <div style={styles.title}>
                        {subobjective.subobjective_title}
                      </div>
                      <div className="clearfix"></div>
                    </div>
                  }
                  leftAvatar={
                    <Icon
                      name={Constants.ICON_NAME_IMAGE_CENTER_FOCUS_WEAK}
                      type={Constants.ICON_TYPE_LIST}
                    />
                  }
                />
              );
            })}
          </List>
        </div>
      </div>
    );
  }
}

IncidentSubobjectives.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  incidentId: PropTypes.string,
  injectId: PropTypes.string,
  onChange: PropTypes.func,
  incidentSubobjectivesIds: PropTypes.array,
  subobjectives: PropTypes.array,
};

export default IncidentSubobjectives;
