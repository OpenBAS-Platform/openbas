import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { CenterFocusWeakOutlined } from '@material-ui/icons';
import Chip from '@material-ui/core/Chip';
import { withStyles } from '@material-ui/core/styles';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';
import { SearchField } from '../../../../../components/SearchField';

const styles = () => ({
  empty: {
    margin: '0 auto',
    marginTop: '10px',
    textAlign: 'center',
  },
});

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

  handleSearchSubobjectives(event) {
    this.setState({ searchTerm: event.target.value });
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

  submitSubobjectives(subobjectivesIds) {
    this.props.onChange(subobjectivesIds);
  }

  render() {
    const { classes } = this.props;
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
        <SearchField
          onChange={this.handleSearchSubobjectives.bind(this)}
          fullWidth={true}
        />
        <div>
          {this.state.subobjectivesIds.map((subobjectiveId) => {
            const subobjective = R.find(
              (a) => a.subobjective_id === subobjectiveId,
            )(this.props.subobjectives);
            const subobjectiveTitle = R.propOr(
              '-',
              'subobjective_title',
              subobjective,
            );
            return (
              <Chip
                key={subobjectiveId}
                onDelete={this.removeSubobjective.bind(this, subobjectiveId)}
                icon={<CenterFocusWeakOutlined />}
                variant="outlined"
                label={subobjectiveTitle}
              />
            );
          })}
          <div className="clearfix" />
        </div>
        <div>
          {filteredSubobjectives.length === 0 && (
            <div className={classes.empty}>
              <T>No subobjective found.</T>
            </div>
          )}
          <List>
            {filteredSubobjectives.map((subobjective) => {
              const disabled = R.find(
                (subobjectiveId) => subobjectiveId === subobjective.subobjective_id,
                this.state.subobjectivesIds,
              ) !== undefined;
              return (
                <ListItem
                  key={subobjective.subobjective_id}
                  disabled={disabled}
                  onClick={this.addSubobjective.bind(
                    this,
                    subobjective.subobjective_id,
                  )}
                  button={true}
                >
                  <ListItemIcon>
                    <CenterFocusWeakOutlined />
                  </ListItemIcon>
                  <ListItemText
                    primary={subobjective.subobjective_title}
                    secondary={subobjective.subobjective_description}
                  />
                </ListItem>
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

export default withStyles(styles)(IncidentSubobjectives);
