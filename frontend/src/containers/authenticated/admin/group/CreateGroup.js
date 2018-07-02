import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {addGroup} from '../../../../actions/Group'
import {Dialog} from '../../../../components/Dialog';
import {FlatButton, FloatingActionsButtonCreate} from '../../../../components/Button';
import UserForm from './GroupForm'
import * as Constants from '../../../../constants/ComponentTypes'
import {i18nRegister} from '../../../../utils/Messages'

i18nRegister({
  fr: {
    'Create a group': 'Créer un groupe',
    'Create group': 'Créer le groupe'
  }
})

class CreateGroup extends Component {
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
    return this.props.addGroup(data)
  }

  submitFormCreate() {
    this.refs.groupForm.submit()
  }

  render() {
    const actionsCreateGroup = [
      <FlatButton key="cancel" label="Cancel" primary={true} onClick={this.handleCloseCreate.bind(this)}/>,
      <FlatButton key="create" label="Create group" primary={true} onClick={this.submitFormCreate.bind(this)}/>,
    ]

    return (
      <div>
        <FloatingActionsButtonCreate type={Constants.BUTTON_TYPE_FLOATING} onClick={this.handleOpenCreate.bind(this)}/>
        <Dialog title="Create a group"
                modal={false}
                open={this.state.openCreate}
                onRequestClose={this.handleCloseCreate.bind(this)}
                actions={actionsCreateGroup}>
          <UserForm ref="groupForm" onSubmit={this.onSubmitCreate.bind(this)}
                    onSubmitSuccess={this.handleCloseCreate.bind(this)}/>
        </Dialog>
      </div>
    )
  }
}

CreateGroup.propTypes = {
  addGroup: PropTypes.func,
}

export default connect(null, {addGroup})(CreateGroup)