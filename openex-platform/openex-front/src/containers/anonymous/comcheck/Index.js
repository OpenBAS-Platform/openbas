import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
// eslint-disable-next-line import/no-cycle
import { fetchComcheckStatus } from '../../../actions/Comcheck';
import { Toolbar } from '../../../components/Toolbar';
import { i18nRegister } from '../../../utils/Messages';
import * as Constants from '../../../constants/ComponentTypes';
import { dateFormat } from '../../../utils/Time';

i18nRegister({
  fr: {
    'Communication check': 'Vérification de la communication',
  },
});

const styles = {
  comcheck: {
    margin: '0 auto',
    marginTop: '45vh',
    transform: 'translateY(-60%)',
    textAlign: 'center',
    width: '400px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    paddingBottom: '20px',
  },
};

class IndexComcheck extends Component {
  componentDidMount() {
    this.props.fetchComcheckStatus(this.props.statusId);
  }

  render() {
    const statusState = R.propOr(0, 'status_state', this.props.comcheck_status);
    const statusLastUpdate = R.propOr(
      undefined,
      'status_last_update',
      this.props.comcheck_status,
    );

    return (
      <div style={styles.comcheck}>
        <Toolbar type={Constants.TOOLBAR_TYPE_LOGIN}>
          Communication check
        </Toolbar>
        <br />
        Your communication check is{' '}
        <strong>{statusState ? 'successfull' : 'failed'}</strong>.<br />
        {statusLastUpdate !== undefined
          ? `Verification done at ${dateFormat(statusLastUpdate)}`
          : ''}
      </div>
    );
  }
}

IndexComcheck.propTypes = {
  statusId: PropTypes.string,
  comcheck_status: PropTypes.object,
  fetchComcheckStatus: PropTypes.func,
};

const select = (state, ownProps) => {
  const { statusId } = ownProps.params;
  const comcheckStatus = R.propOr(
    {},
    statusId,
    state.referential.entities.comchecks_statuses,
  );
  return {
    statusId,
    comcheckStatus,
  };
};

export default connect(select, { fetchComcheckStatus })(IndexComcheck);
