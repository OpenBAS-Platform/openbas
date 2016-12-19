import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {i18nRegister} from '../../../../utils/Messages'
import {addUser} from '../../../../actions/User'
import {Dialog} from '../../../../components/Dialog';
import {FlatButton} from '../../../../components/Button';
import UserForm from './UserForm'
import * as Constants from '../../../../constants/ComponentTypes'

i18nRegister({
  fr: {
    'Create user': 'Créer un utilisateur',
    'Create a new user': 'Créer un nouvel utilisateur'
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
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseCreate.bind(this)}/>,
      <FlatButton label="Create user" primary={true} onTouchTap={this.submitFormCreate.bind(this)}/>,
    ]

    return (
      <div>
        <FlatButton label="Create a new user"
          secondary={true}
          onTouchTap={this.handleOpenCreate.bind(this)}
          type={Constants.BUTTON_TYPE_DIALOG_LEFT}/>
        <Dialog title="Create a new user"
          modal={false}
          open={this.state.openCreate}
          onRequestClose={this.handleCloseCreate.bind(this)}
          actions={actionsCreateUser}>
          <UserForm ref="userForm" onSubmit={this.onSubmitCreate.bind(this)} organizations={this.props.organizations}
                    onSubmitSuccess={this.handleCloseCreate.bind(this)}/>
        </Dialog>
      </div>
    )
  }
}

CreateUser.propTypes = {
  exerciseId: PropTypes.string,
  organizations: PropTypes.object,
  addUser: PropTypes.func,
}

const select = (state) => {
  return {
    organizations: state.referential.entities.organizations,
  }
}

export default connect(select, {addUser})(CreateUser);