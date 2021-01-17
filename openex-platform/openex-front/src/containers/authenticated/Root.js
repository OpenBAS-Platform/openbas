import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { Route, Switch } from 'react-router';
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import { withRouter } from 'react-router-dom';
import { T } from '../../components/I18n';
import { i18nRegister } from '../../utils/Messages';
import { savedDismiss } from '../../actions/Application';
import IndexAuthenticated from './Index';
import IndexProfile from './profile/Index';
import IndexDocuments from './documents/Index';
import RootAdmin from './admin/Root';
import RootExercise from './exercise/Root';

const UserIsAdmin = connectedRouterRedirect({
  authenticatedSelector: (state) => state.app.logged.admin === true,
  redirectPath: '/private',
  allowRedirectBack: false,
  wrapperDisplayName: 'UserIsAdmin',
});

i18nRegister({
  fr: {
    'The operation has been done': "L'opération a été effectuée",
  },
});

class RootAuthenticated extends Component {
  redirectToHome() {
    this.props.history.push('/private');
  }

  render() {
    return (
      <div>
        <Snackbar
          open={this.props.savedPopupOpen}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          autoHideDuration={4000}
          onClose={this.props.savedDismiss.bind(this)}
        >
          <Alert severity="info" elevation={6}>
            <T>The operation has been done</T>
          </Alert>
        </Snackbar>
        <Switch>
          <Route path="/admin" component={UserIsAdmin(RootAdmin)} />
          <Route exact path="/private" component={IndexAuthenticated} />
          <Route exact path="/private/profile" component={IndexProfile} />
          <Route exact path="/private/documents" component={IndexDocuments} />
          <Route
            path="/private/exercise/:exerciseId"
            component={RootExercise}
          />
        </Switch>
      </div>
    );
  }
}

RootAuthenticated.propTypes = {
  children: PropTypes.node,
  savedPopupOpen: PropTypes.bool,
  savedDismiss: PropTypes.func,
};

const select = (state) => ({
  savedPopupOpen: state.screen.saved || false,
});

export default R.compose(
  withRouter,
  connect(select, { savedDismiss }),
)(RootAuthenticated);
