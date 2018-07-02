import React, {Component} from 'react'
import PropTypes from 'prop-types'
import * as R from 'ramda'
import Theme from '../../../../../components/Theme'
import {T} from '../../../../../components/I18n'
import {i18nRegister} from '../../../../../utils/Messages'

i18nRegister({
  fr: {
    'PGP Key is set': 'Clé PGP renseignée',
  }
})

const styles = {
  'container': {
    color: Theme.palette.textColor,
    padding: '10px 0px 10px 0px'
  },
  'image': {
    float: 'left',
    margin: '0px 10px 0px 0px'
  },
  'info': {

  }
}

class UserView extends Component {

  render() {
    let user_email = R.propOr('-', 'user_email', this.props.user)
    let user_gravatar = R.propOr('', 'user_gravatar', this.props.user)
    let user_phone = R.propOr('', 'user_phone', this.props.user)
    let user_phone2 = R.propOr('', 'user_phone2', this.props.user)
    let user_pgp_key = R.propOr(false, 'user_pgp_key', this.props.user)
    let user_organization = R.propOr({}, this.props.user.user_organization, this.props.organizations)
    let organizationName = R.propOr('-', 'organization_name', user_organization)

    return (
      <div style={styles.container}>
        <div style={styles.image}><img src={user_gravatar} alt="Avatar"/></div>
        <div style={styles.info}>
          <div><strong>{user_email}</strong></div>
          <div>{organizationName}</div>
          <div>{user_phone2}</div>
          <div>{user_phone}</div>
          <div>{user_pgp_key ? <T>PGP Key is set</T> : ''}</div>
        </div>
      </div>
    )
  }
}

UserView.propTypes = {
  user: PropTypes.object,
  organizations: PropTypes.object
}

export default UserView