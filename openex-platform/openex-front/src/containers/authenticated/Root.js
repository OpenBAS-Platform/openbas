import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { Route, Switch } from 'react-router';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import { withRouter } from 'react-router-dom';
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect';
import { T } from '../../components/I18n';
import { i18nRegister } from '../../utils/Messages';
import { fetchMe, savedDismiss } from '../../actions/Application';
import IndexAuthenticated from './Index';
import IndexProfile from './profile/Index';
import IndexDocuments from './documents/Index';
import RootExercise from './exercise/Root';
import NotFound from '../anonymous/NotFound';
import RootAdmin from './admin/Root';
import Login from '../anonymous/login/Login';

i18nRegister({
  fr: {
    'The operation has been done': "L'opération a été effectuée",
  },
});

const UserIsAdmin = connectedRouterRedirect({
  authenticatedSelector: (state) => state.app.logged.admin === true,
  redirectPath: '/private',
  allowRedirectBack: false,
  wrapperDisplayName: 'UserIsAdmin',
});

const RootAuthenticated = (props) => {
  useEffect(() => {
    props.fetchMe();
  }, []);
  if (R.isEmpty(props.logged)) {
    return <div>LOADING</div>;
  }
  if (!props.logged) {
    return <Login />;
  }
  return (
    <div>
        <Snackbar
            open={props.savedPopupOpen}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            autoHideDuration={1000}
            onClose={props.savedDismiss.bind(this)}
        >
            <Alert
                severity="info"
                elevation={6}
                onClose={props.savedDismiss.bind(this)}
            >
                <T>The operation has been done</T>
            </Alert>
        </Snackbar>
        <Switch>
            <Route exact path="/private" component={IndexAuthenticated}/>
            <Route exact path="/private/profile" component={IndexProfile}/>
            <Route exact path="/private/documents" component={IndexDocuments}/>
            <Route path="/private/exercise/:exerciseId" component={RootExercise}/>
            <Route path="/private/admin" component={UserIsAdmin(RootAdmin)}/>
            <Route component={NotFound}/>
        </Switch>
    </div>
  );
};

RootAuthenticated.propTypes = {
  children: PropTypes.node,
  savedPopupOpen: PropTypes.bool,
  fetchMe: PropTypes.func,
  savedDismiss: PropTypes.func,
};

const select = (state) => ({
  savedPopupOpen: state.screen.saved || false,
  logged: state.app.logged,
});

export default R.compose(
  withRouter,
  connect(select, { fetchMe, savedDismiss }),
)(RootAuthenticated);
