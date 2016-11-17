import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Map} from 'immutable'
import * as Constants from '../../../../../constants/ComponentTypes'
import {addInject} from '../../../../../actions/Inject'
import {Dialog} from '../../../../../components/Dialog';
import {MenuItemLink} from '../../../../../components/menu/MenuItem'
import {FlatButton, FloatingActionsButtonCreate} from '../../../../../components/Button';
import InjectForm from './InjectForm'

const types = Map({
  0: Map({
    type_id: "0",
    type_name: "EMAIL"
  }),
  1: Map({
    type_id: "1",
    type_name: "SMS"
  })
})

class CreateInject extends Component {
  constructor(props) {
    super(props);
    this.state = {open: false}
  }

  handleOpen() {
    this.setState({open: true})
  }

  handleClose() {
    this.setState({open: false})
  }

  onSubmit(data) {
    return this.props.addInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, data)
  }

  submitForm() {
    this.refs.injectForm.submit()
  }

  render() {
    console.log('TYPES', types)
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleClose.bind(this)}
      />,
      <FlatButton
        label="Create"
        primary={true}
        onTouchTap={this.submitForm.bind(this)}
      />,
    ];

    return (
      <div>
        <FloatingActionsButtonCreate type={Constants.BUTTON_TYPE_FLOATING_PADDING}
                                     onClick={this.handleOpen.bind(this)}/>
        <Dialog
          title="Create a new inject"
          modal={false}
          open={this.state.open}
          autoScrollBodyContent={true}
          onRequestClose={this.handleClose.bind(this)}
          actions={actions}
        >
          <InjectForm
            ref="injectForm"
            onSubmit={this.onSubmit.bind(this)}
            onSubmitSuccess={this.handleClose.bind(this)}
            types={types.toList().map(type => {
              return (
                <MenuItemLink key={type.get('type_id')} value={type.get('type_name')}
                              label={type.get('type_name')}/>
              )
            })}/>
        </Dialog>
      </div>
    );
  }
}

CreateInject.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  incidentId: PropTypes.string,
  addInject: PropTypes.func
}

export default connect(null, {addInject})(CreateInject);