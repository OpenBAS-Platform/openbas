import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as Constants from '../../../../../constants/ComponentTypes';
/* eslint-disable */
import { selectIncident } from "../../../../../actions/Incident";
import { Drawer } from "../../../../../components/Drawer";
import { List } from "../../../../../components/List";
import { ListItemLink } from "../../../../../components/list/ListItem";
import { Icon } from "../../../../../components/Icon";
import CreateIncident from "./CreateIncident";
/* eslint-enable */

class IncidentNav extends Component {
  handleChangeIncident(incidentId) {
    this.props.selectIncident(
      this.props.exerciseId,
      this.props.eventId,
      incidentId,
    );
  }

  render() {
    return (
      <Drawer
        width={300}
        docked={true}
        open={true}
        openSecondary={true}
        zindex={50}
      >
        <CreateIncident
          exerciseId={this.props.exerciseId}
          eventId={this.props.eventId}
          incident_types={this.props.incident_types}
          subobjectives={this.props.subobjectives}
          can_create={this.props.can_create}
        />
        <List>
          {this.props.incidents.map((incident) => (
            <ListItemLink
              type={Constants.LIST_ITEM_NOSPACE}
              key={incident.incident_id}
              active={this.props.selectedIncident === incident.incident_id}
              onClick={this.handleChangeIncident.bind(
                this,
                incident.incident_id,
              )}
              label={incident.incident_title}
              leftIcon={<Icon name={Constants.ICON_NAME_MAPS_LAYERS} />}
            />
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

export default connect(null, { selectIncident })(IncidentNav);
