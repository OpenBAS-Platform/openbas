import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router';
import { savedDismiss } from '../../actions/Application';
import { Snackbar } from '../../components/Snackbar';
import { T } from '../../components/I18n';
import { i18nRegister } from '../../utils/Messages';
import * as Constants from '../../constants/ComponentTypes';
import { Icon } from '../../components/Icon';
import IndexAuthenticated from './Index';
import RootAdmin from './admin/Root';
import RootUser from './user/Root';
import RootExercise from './exercise/Root';
import { UserIsAdmin } from '../../App';

i18nRegister({
  fr: {
    'Action done.': 'Action effectuée.',
  },
});

class RootAuthenticated extends Component {
  render() {
    return (
      <div>
        <Snackbar
          open={this.props.savedPopupOpen}
          autoHideDuration={1500}
          onRequestClose={this.props.savedDismiss.bind(this)}
          message={
            <div>
              <Icon
                name={Constants.ICON_NAME_ACTION_DONE}
                color="#ffffff"
                type={Constants.ICON_TYPE_LEFT}
              />
              <T>Action done.</T>
            </div>
          }
        />
        <Switch>
            <Route path="/admin" component={UserIsAdmin(RootAdmin)} />
            <Route exact path="/private" component={IndexAuthenticated} />
            <Route path="/private/user" component={RootUser} />
            <Route path="/private/exercise/:exerciseId" component={RootExercise} />
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

export default connect(select, { savedDismiss })(RootAuthenticated);
