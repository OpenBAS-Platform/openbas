import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {fetchOrganizations} from '../../../../actions/Organization'
import {updateUser} from '../../../../actions/User'
import {Paper} from '../../../../components/Paper'
import {Button} from '../../../../components/Button'
import {i18nRegister} from '../../../../utils/Messages'
import {T} from '../../../../components/I18n'
import * as Constants from '../../../../constants/ComponentTypes'
import * as R from 'ramda'
import UserForm from './UserForm'
import ProfileForm from './ProfileForm'
import PasswordForm from './PasswordForm'

const styles = {
  PaperContent: {
    padding: '20px'
  },
  image: {
    width: '90%'
  }
}

i18nRegister({
  fr: {
    'Firstname': 'Prénom',
    'Lastname': 'Nom',
    'Organization': 'Organisation',
    'Profile': 'Profil',
    'Password': 'Mot de passe',
    'Information': 'Informations'
  }
})

class Index extends Component {
  componentDidMount() {
    this.props.fetchOrganizations()
  }

  onUpdate(data) {
    return this.props.updateUser(this.props.user.user_id, data)
  }

  onUpdatePassword(data) {
    return this.props.updateUser(this.props.user.user_id, {'user_plain_password': data.user_plain_password})
  }

  submitUser() {
    this.refs.userForm.submit()
  }

  submitProfile() {
    this.refs.profileForm.submit()
  }

  submitPassword() {
    this.refs.passwordForm.submit()
  }

  render() {
    var organizationPath = [R.propOr('-', 'user_organization', this.props.user), 'organization_name']
    var organization_name = R.pathOr('-', organizationPath, this.props.organizations)
    var initPipe = R.pipe(
      R.assoc('user_organization', organization_name), //Reformat organization
      R.pick(['user_firstname', 'user_lastname', 'user_lang', 'user_email', 'user_email2', 'user_organization',
        'user_phone', 'user_phone2', 'user_phone3', 'user_pgp_key'])
    )
    const informationValues = this.props.user !== undefined ? initPipe(this.props.user) : undefined

    return (
      <div>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2><T>Profile</T></h2>
            <UserForm ref="userForm" organizations={this.props.organizations} onSubmit={this.onUpdate.bind(this)} initialValues={informationValues}/>
            <br />
            <Button type="submit" label="Update" onClick={this.submitUser.bind(this)}/>
          </div>
        </Paper>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2><T>Information</T></h2>
            <ProfileForm ref="profileForm" onSubmit={this.onUpdate.bind(this)} initialValues={informationValues}/>
            <br />
            <Button type="submit" label="Update" onClick={this.submitProfile.bind(this)}/>
          </div>
        </Paper>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2><T>Password</T></h2>
            <PasswordForm ref="passwordForm" onSubmit={this.onUpdatePassword.bind(this)}/>
            <br />
            <Button type="submit" label="Update" onClick={this.submitPassword.bind(this)}/>
          </div>
        </Paper>
      </div>
    )
  }
}

Index.propTypes = {
  user: PropTypes.object,
  organizations: PropTypes.object,
  fetchOrganizations: PropTypes.func,
  updateUser: PropTypes.func
}

const select = (state) => {
  var userId = R.path(['logged', 'user'], state.app)
  return {
    user: R.prop(userId, state.referential.entities.users),
    organizations: state.referential.entities.organizations
  }
}

export default connect(select, {fetchOrganizations, updateUser})(Index)
