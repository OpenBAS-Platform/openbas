import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {addUser} from '../../../../actions/User'
import {addOrganizationAndUser} from '../../../../actions/Organization'
import {Dialog} from '../../../../components/Dialog';
import {FlatButton} from '../../../../components/Button';
import UserForm from '../../admin/users/UserForm'
import * as Constants from '../../../../constants/ComponentTypes'

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
    if (typeof data['user_organization'] === 'object') {
      data['user_organization'] = data['user_organization']['organization_id']
      return this.props.addUser(data)
    } else {
      let orgData = {organization_name: data['user_organization']}
      return this.props.addOrganizationAndUser(orgData, data)
    }
  }

  submitFormCreate() {
    this.refs.userForm.submit()
  }

  render() {
    const actionsCreateUser = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCloseCreate.bind(this)}
      />,
      <FlatButton
        label="Create user"
        primary={true}
        onTouchTap={this.submitFormCreate.bind(this)}
      />,
    ];

    return (
      <div>
        <FlatButton
          label="Create a new user"
          secondary={true}
          onTouchTap={this.handleOpenCreate.bind(this)}
          type={Constants.BUTTON_TYPE_DIALOG_LEFT}
        />
        <Dialog
          title="Create a new user"
          modal={false}
          open={this.state.openCreate}
          onRequestClose={this.handleCloseCreate.bind(this)}
          actions={actionsCreateUser}
        >
          <UserForm ref="userForm" onSubmit={this.onSubmitCreate.bind(this)} organizations={this.props.organizations}
                    onSubmitSuccess={this.handleCloseCreate.bind(this)}/>
        </Dialog>
      </div>
    );
  }
}

CreateUser.propTypes = {
  exerciseId: PropTypes.string,
  organizations: PropTypes.object,
  addUser: PropTypes.func,
  addOrganizationAndUser: PropTypes.func,
}

const select = (state) => {
  return {
    organizations: state.application.getIn(['entities', 'organizations']),
  }
}

export default connect(select, {addUser, addOrganizationAndUser})(CreateUser);