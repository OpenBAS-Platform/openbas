import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { LayersOutlined } from '@material-ui/icons';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { green, red } from '@material-ui/core/colors';
import { T } from '../../../../../components/I18n';
import CreateIncident from './CreateIncident';
import { selectIncident } from '../../../../../actions/Incident';
import IncidentPopover from './IncidentPopover';

const styles = () => ({
  drawerPaper: {
    width: 300,
  },
  itemActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  enabled: {
    color: green[500],
  },
  disabled: {
    color: red[500],
  },
});

class IncidentNav extends Component {
  handleChangeIncident(incidentId) {
    this.props.selectIncident(
      this.props.exerciseId,
      this.props.eventId,
      incidentId,
    );
  }

  render() {
    const { classes, exerciseId, eventId } = this.props;
    return (
      <Drawer
        variant="permanent"
        classes={{ paper: classes.drawerPaper }}
        anchor="right"
      >
        <Toolbar />
        {this.props.can_create ? (
          <CreateIncident
            exerciseId={this.props.exerciseId}
            eventId={this.props.eventId}
            incident_types={this.props.incident_types}
            subobjectives={this.props.subobjectives}
          />
        ) : (
          <div style={{ margin: '15px 0 0 15px' }}>
            <Typography variant="h5">
              <T>Incidents</T>
            </Typography>
          </div>
        )}
        <List>
          {this.props.incidents.map((incident) => (
            <ListItem
              key={incident.incident_id}
              selected={this.props.selectedIncident === incident.incident_id}
              button={true}
              divider={true}
              onClick={this.handleChangeIncident.bind(
                this,
                incident.incident_id,
              )}
            >
              <ListItemIcon>
                <LayersOutlined />
              </ListItemIcon>
              <ListItemText primary={incident.incident_title} />
              <ListItemSecondaryAction>
                <IncidentPopover
                  exerciseId={exerciseId}
                  eventId={eventId}
                  incident={incident}
                  subobjectives={this.props.subobjectives}
                  incidentSubobjectivesIds={incident.incident_subobjectives}
                  incident_types={this.props.incident_types}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Drawer>
    );
  }
}

IncidentNav.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  selectedIncident: PropTypes.string,
  incident_types: PropTypes.object,
  incidents: PropTypes.array,
  subobjectives: PropTypes.array,
  selectIncident: PropTypes.func,
  can_create: PropTypes.bool,
};

export default R.compose(
  connect(null, { selectIncident }),
  withStyles(styles),
)(IncidentNav);
