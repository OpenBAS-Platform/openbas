import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle/AlertTitle';
import { T } from '../../components/I18n';
import { i18nRegister } from '../../utils/Messages';

i18nRegister({
  fr: {
    Error: 'Erreur',
    'This page is not found on this OpenEx application.':
      'Cette page est introuvable dans cette application OpenEx.',
  },
});

class NotFound extends Component {
  render() {
    return (
      <div>
        <Alert severity="info">
          <AlertTitle>{<T>Error</T>}</AlertTitle>
          {<T>This page is not found on this OpenEx application.</T>}
        </Alert>
      </div>
    );
  }
}

NotFound.propTypes = {
  demo: PropTypes.string,
  askToken: PropTypes.func,
  checkKerberos: PropTypes.func,
  classes: PropTypes.object,
};

export default NotFound;
