import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { GroupOutlined } from '@mui/icons-material';
import * as R from 'ramda';
import withStyles from '@mui/styles/withStyles';
import { i18nRegister } from '../../../../utils/Messages';
import { T } from '../../../../components/I18n';
import { SearchField } from '../../../../components/SearchField';

const styles = (theme) => ({
  nested: {
    paddingLeft: theme.spacing(4),
  },
  empty: {
    margin: '0 auto',
    marginTop: '10px',
    textAlign: 'center',
  },
});

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
      searchTerm: '',
      selectAll: props.inject?.inject_all_audiences,
    };
  }

  componentDidMount() {
    this.setState({ selectAll: this.props.inject?.inject_all_audience });
  }

  handleSearchAudiences(event) {
    this.setState({ searchTerm: event.target.value });
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

  toggleAll(event) {
    this.setState({ selectAll: event.target.checked, audiencesIds: [] });
    this.submitSelectAll(event.target.checked);
  }

  submitAudiences(audiencesIds) {
    this.props.onChangeAudiences(audiencesIds);
  }

  submitSelectAll(selectAll) {
    this.props.onChangeSelectAll(selectAll);
  }

  render() {
    const { classes } = this.props;
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
        <FormGroup row={true}>
          <FormControlLabel
            control={
              <Switch
                checked={this.state.selectAll}
                onChange={this.toggleAll.bind(this)}
                color="primary"
              />
            }
            label={
              <strong>
                <T>All audiences</T>
              </strong>
            }
          />
        </FormGroup>
        <br />
        <div>
          <div>
            <SearchField
              fullWidth={true}
              onChange={this.handleSearchAudiences.bind(this)}
              style={{ marginBottom: 20 }}
              disabled={this.state.selectAll}
            />
            {this.state.audiencesIds.map((audienceId) => {
              const audience = R.find((a) => a.audience_id === audienceId)(
                this.props.audiences,
              );
              const audienceName = R.propOr('-', 'audience_name', audience);
              return (
                <Chip
                  key={audienceId}
                  onDelete={this.removeAudience.bind(this, audienceId)}
                  icon={<GroupOutlined />}
                  label={audienceName}
                />
              );
            })}
            <div className="clearfix" />
          </div>
          <div>
            {filteredAudiences.length === 0 && (
              <div className={classes.empty}>
                <T>No audience found.</T>
              </div>
            )}
            <List>
              {filteredAudiences.map((audience) => {
                const disabled = this.state.selectAll
                  || R.find(
                    (audienceId) => audienceId === audience.audience_id,
                    this.state.audiencesIds,
                  ) !== undefined;
                return (
                  <div key={audience.audience_id}>
                    <ListItem
                      disabled={disabled}
                      onClick={this.addAudience.bind(
                        this,
                        audience.audience_id,
                      )}
                      button={true}
                      divider={true}
                    >
                      <ListItemIcon>
                        <GroupOutlined />
                      </ListItemIcon>
                      <ListItemText primary={audience.audience_name} />
                    </ListItem>
                  </div>
                );
              })}
            </List>
          </div>
        </div>
      </div>
    );
  }
}

InjectAudiences.propTypes = {
  exerciseId: PropTypes.string,
  onChangeAudiences: PropTypes.func,
  onChangeSelectAll: PropTypes.func,
  injectAudiencesIds: PropTypes.array,
  audiences: PropTypes.array,
  selectAll: PropTypes.bool,
  inject: PropTypes.object,
};

export default withStyles(styles)(InjectAudiences);
