import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { savedDismiss } from '../../actions/Application';
import { Snackbar } from '../../components/Snackbar';
import { T } from '../../components/I18n';
import { i18nRegister } from '../../utils/Messages';
import * as Constants from '../../constants/ComponentTypes';
import { Icon } from '../../components/Icon';
import DocumentTitle from '../../components/DocumentTitle';

i18nRegister({
  fr: {
    'Action done.': 'Action effectuée.',
  },
});

class RootAuthenticated extends Component {
  render() {
    return (
      <DocumentTitle title="OpenEx - Crisis management exercises platform">
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
          {this.props.children}
        </div>
      </DocumentTitle>
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
