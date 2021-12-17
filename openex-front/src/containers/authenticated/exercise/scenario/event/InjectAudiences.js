import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Chip from '@material-ui/core/Chip';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import { GroupOutlined } from '@material-ui/icons';
import * as R from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';
import { SearchField } from '../../../../../components/SearchField';

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

  toggleAll(event) {
    this.setState({ selectAll: event.target.checked });
    this.submitSelectAll(event.target.checked);
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
            {this.state.subaudiencesIds.map((subaudienceId) => {
              const subaudience = R.find(
                (a) => a.subaudience_id === subaudienceId,
              )(this.props.subaudiences);
              const audience = R.find(
                (a) => a.audience_id === subaudience.subaudience_audience.audience_id,
              )(this.props.audiences);
              const audienceName = R.propOr('-', 'audience_name', audience);
              const subaudienceName = R.propOr(
                '-',
                'subaudience_name',
                subaudience,
              );
              const disabled = this.state.selectAll
                || R.find(
                  (audienceId) => audienceId === subaudience.subaudience_audience.audience_id,
                  this.state.audiencesIds,
                ) !== undefined;
              if (!disabled) {
                return (
                  <Chip
                    key={subaudienceId}
                    onDelete={this.removeSubaudience.bind(this, subaudienceId)}
                    icon={<GroupOutlined />}
                    label={`[${audienceName}] ${subaudienceName}`}
                  />
                );
              }
              return <div key={subaudienceId}> &nbsp; </div>;
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
                const nestedItems = !disabled
                  && audience.audience_subaudiences.map((data) => {
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
                      <ListItem
                        key={subaudienceId}
                        disabled={subaaudienceDisabled}
                        onClick={this.addSubaudience.bind(
                          this,
                          subaudience.subaudience_id,
                        )}
                        button={true}
                        divider={true}
                        className={classes.nested}
                      >
                        <ListItemIcon>
                          <GroupOutlined />
                        </ListItemIcon>
                        <ListItemText primary={subaudienceName} />
                      </ListItem>
                    );
                  });
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
                    <Collapse in={true}>
                      <List>{nestedItems}</List>
                    </Collapse>
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

export default withStyles(styles)(InjectAudiences);
