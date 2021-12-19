import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import Theme from '../../../../../components/Theme';
import { T } from '../../../../../components/I18n';
import { i18nRegister } from '../../../../../utils/Messages';

i18nRegister({
  fr: {
    'PGP Key is set': 'Clé PGP renseignée',
  },
});

const styles = {
  container: {
    color: Theme.palette.textColor,
    padding: '10px 0px 10px 0px',
  },
  image: {
    float: 'left',
    margin: '0px 10px 0px 0px',
  },
  info: {},
};

class UserView extends Component {
  render() {
    const userEmail = R.propOr('-', 'user_email', this.props.user);
    const userGravatar = R.propOr('', 'user_gravatar', this.props.user);
    const userPhone = R.propOr('', 'user_phone', this.props.user);
    const userPhone2 = R.propOr('', 'user_phone2', this.props.user);
    const userLatitude = R.propOr('', 'user_latitude', this.props.user);
    const userLongitude = R.propOr('', 'user_longitude', this.props.user);
    const userPgpKey = R.propOr(false, 'user_pgp_key', this.props.user);
    const userOrganization = R.propOr(
      {},
      this.props.user.user_organization,
      this.props.organizations,
    );
    const organizationName = R.propOr(
      '-',
      'organization_name',
      userOrganization,
    );

    return (
      <div style={styles.container}>
        <div style={styles.image}>
          <img src={userGravatar} alt="Avatar" />
        </div>
        <div style={styles.info}>
          <div>
            <strong>{userEmail}</strong>
          </div>
          <div>{organizationName}</div>
          <div>{userPhone}</div>
          <div>{userPhone2}</div>
          <div>Latitude: {userLatitude}</div>
          <div>Longitude: {userLongitude}</div>
          <div>{userPgpKey ? <T>PGP Key is set</T> : ''}</div>
        </div>
      </div>
    );
  }
}

UserView.propTypes = {
  user: PropTypes.object,
  organizations: PropTypes.object,
};

export default UserView;
