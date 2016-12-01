import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import * as Constants from '../../../../../constants/ComponentTypes'
import {addIncident} from '../../../../../actions/Incident'
import {Dialog} from '../../../../../components/Dialog';
import {FlatButton} from '../../../../../components/Button';
import {ActionButtonCreate} from '../../../../../components/Button'
import {AppBar} from '../../../../../components/AppBar'
import IncidentForm from './IncidentForm'

class CreateIncident extends Component {
  constructor(props) {
    super(props);
    this.state = {openCreate: false}
  }

  handleOpenCreate() {
    this.setState({openCreate: true})
  }

  handleCloseCreate() {
    this.setState({openCreate: false})
  }

  onSubmitCreate(data) {
    return this.props.addIncident(this.props.exerciseId, this.props.eventId, data)
  }

  submitFormCreate() {
    this.refs.incidentForm.submit()
  }

  render() {
    const actions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseCreate.bind(this)}/>,
      <FlatButton label="Create" primary={true} onTouchTap={this.submitFormCreate.bind(this)}/>,
    ]

    return (
      <div>
        <AppBar title="Incidents"
          showMenuIconButton={false}
          iconElementRight={<ActionButtonCreate type={Constants.BUTTON_TYPE_CREATE_RIGHT} onClick={this.handleOpenCreate.bind(this)} />}/>
        <Dialog title="Create a new incident"
          modal={false}
          open={this.state.openCreate}
          onRequestClose={this.handleCloseCreate.bind(this)}
          actions={actions}>
          <IncidentForm
            ref="incidentForm"
            onSubmit={this.onSubmitCreate.bind(this)}
            onSubmitSuccess={this.handleCloseCreate.bind(this)}
            types={this.props.incident_types}/>
        </Dialog>
      </div>
    );
  }
}

CreateIncident.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  incident_types: PropTypes.object,
  addIncident: PropTypes.func
}

export default connect(null, {addIncident})(CreateIncident);
