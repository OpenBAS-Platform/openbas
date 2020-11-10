import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {i18nRegister} from '../../../../utils/Messages'
import {addUser} from '../../../../actions/User'
import {Dialog} from '../../../../components/Dialog'
import {FlatButton, FloatingActionsButtonCreate} from '../../../../components/Button'
import UserForm from './UserForm'
import * as Constants from '../../../../constants/ComponentTypes'

i18nRegister({
  fr: {
    'Create user': 'Créer l\'utilisateur',
    'Create a user': 'Créer un utilisateur'
  }
})

class CreateUser extends Component {
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
    return this.props.addUser(data)
  }

  submitFormCreate() {
    this.refs.userForm.submit()
  }

  render() {
    const actionsCreateUser = [
      <FlatButton key="cancel" label="Cancel" primary={true} onClick={this.handleCloseCreate.bind(this)}/>,
      <FlatButton key="create" label="Create user" primary={true} onClick={this.submitFormCreate.bind(this)}/>,
    ]

    return (
      <div>
        <FloatingActionsButtonCreate type={Constants.BUTTON_TYPE_FLOATING} onClick={this.handleOpenCreate.bind(this)}/>
        <Dialog title="Create a user"
                autoScrollBodyContent={true}
                modal={false}
                open={this.state.openCreate}
                onRequestClose={this.handleCloseCreate.bind(this)}
                actions={actionsCreateUser}>
          <UserForm ref="userForm" editing={false} onSubmit={this.onSubmitCreate.bind(this)}
                    organizations={this.props.organizations}
                    onSubmitSuccess={this.handleCloseCreate.bind(this)}/>
        </Dialog>
      </div>
    )
  }
}

CreateUser.propTypes = {
  organizations: PropTypes.object,
  addUser: PropTypes.func,
}

const select = (state) => {
  return {
    organizations: state.referential.entities.organizations,
  }
}

export default connect(select, {addUser})(CreateUser);
