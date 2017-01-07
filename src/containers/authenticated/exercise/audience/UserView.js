import React, {PropTypes, Component} from 'react'
import R from 'ramda'
import Theme from '../../../../components/Theme'

const styles = {
  'container': {
    color: Theme.palette.textColor,
    padding: '10px 0px 10px 0px'
  },
  'title': {
    fontSize: '16px',
    fontWeight: '500'
  },
  'story': {

  }
}

class UserView extends Component {

  render() {
    let user_firstname = R.propOr('-', 'user_firstname', this.props.user)
    let user_lastname = R.propOr('-', 'user_lastname', this.props.user)
    let user_email = R.propOr('-', 'user_email', this.props.user)

    return (
      <div style={styles.container}>
        <div style={styles.title}>{user_firstname} {user_lastname}</div>
        <div style={styles.story}>{user_email}</div>
      </div>
    )
  }
}

UserView.propTypes = {
  user: PropTypes.object
}

export default UserView