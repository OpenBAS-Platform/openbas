import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {addAudience} from '../../../../actions/Audience'
import {Dialog} from '../../../../components/Dialog';
import {FlatButton} from '../../../../components/Button';
import AudienceForm from './AudienceForm'
import {ActionButtonCreate} from '../../../../components/Button'
import {AppBar} from '../../../../components/AppBar'

class CreateAudience extends Component {
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
    this.props.addAudience(this.props.id, data)
  }

  submitForm() {
    this.refs.audienceForm.submit()
    this.handleClose()
  }

  render() {
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
        <AppBar
          title="Audiences"
          showMenuIconButton={false}
          iconElementRight={<ActionButtonCreate onClick={this.handleOpen.bind(this)} />}/>
        <Dialog
          title="Create a new audience"
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose.bind(this)}
          actions={actions}
        >
          <AudienceForm ref="audienceForm" onSubmit={this.onSubmit.bind(this)} />
        </Dialog>
      </div>
    );
  }
}

CreateAudience.propTypes = {
  id: PropTypes.string,
  addAudience: PropTypes.func
}

export default connect(null, {addAudience})(CreateAudience);