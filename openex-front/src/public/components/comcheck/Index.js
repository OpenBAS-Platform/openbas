import React, { useEffect } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@mui/styles';
import { withRouter } from 'react-router';
import * as R from 'ramda';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { fetchComcheckStatus } from '../../../actions/Comcheck';
import logo from '../../../resources/images/logo.png';
import inject18n from '../../../components/i18n';

const comcheckHeight = 150;

const styles = () => ({
  container: {
    textAlign: 'center',
    margin: '0 auto',
    width: 400,
  },
  appBar: {
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
    marginBottom: 15,
  },
  comcheck: {
    height: comcheckHeight,
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '0 0 15px 0',
  },
  logo: {
    width: 150,
    margin: '0px 0px 20px 0px',
  },
  subtitle: {
    color: '#ffffff',
    fontWeight: 400,
    fontSize: 18,
  },
});

const IndexComcheck = (props) => {
  useEffect(() => {
    props.fetchComcheckStatus(this.props.statusId);
  }, []);
  const { classes, t, fldt } = this.props;
  const statusState = R.propOr(0, 'status_state', this.props.comcheck_status);
  const statusLastUpdate = R.propOr(
    undefined,
    'status_last_update',
    this.props.comcheck_status,
  );
  const paddingTop = window.innerHeight / 2 - comcheckHeight / 2 - 180;
  return (
    <div className={classes.container} style={{ paddingTop }}>
      <img src={logo} alt="logo" className={classes.logo} />
      <div className={classes.comcheck}>
        <AppBar color="primary" position="relative" className={classes.appBar}>
          <Toolbar>
            <div className={classes.subtitle}>{t('Communication check')}</div>
          </Toolbar>
        </AppBar>
        {t('Your communication check is')}
        <strong> {statusState ? t('successfull') : t('failed')}</strong>.
        <br />
        <br />
        {statusLastUpdate !== undefined && (
          <span>
            {t('Verification done at')} {fldt(statusLastUpdate)}.
          </span>
        )}
      </div>
    </div>
  );
};

IndexComcheck.propTypes = {
  t: PropTypes.func,
  fldt: PropTypes.func,
  classes: PropTypes.object,
  statusId: PropTypes.string,
  comcheck_status: PropTypes.object,
  fetchComcheckStatus: PropTypes.func,
};

const select = (state, ownProps) => {
  const { statusId } = ownProps.match.params;
  const comcheckStatus = R.propOr(
    {},
    statusId,
    state.referential.entities.comchecks_statuses,
  );
  return {
    statusId,
    comcheck_status: comcheckStatus,
  };
};

export default R.compose(
  connect(select, { fetchComcheckStatus }),
  withRouter,
  inject18n,
  withStyles(styles),
)(IndexComcheck);
