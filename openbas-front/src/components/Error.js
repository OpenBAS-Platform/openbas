import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Alert, AlertTitle } from '@mui/material';
import { useFormatter } from './i18n';

class ErrorBoundaryComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, stack: null };
  }

  componentDidCatch(error, stack) {
    this.setState({ error, stack });
  }

  render() {
    if (this.state.stack) {
      return this.props.display;
    }
    return this.props.children;
  }
}
ErrorBoundaryComponent.propTypes = {
  display: PropTypes.object,
  children: PropTypes.node,
};
export const ErrorBoundary = ErrorBoundaryComponent;

const SimpleError = () => {
  const { t } = useFormatter();
  return (
    <Alert severity="error">
      <AlertTitle>{t('Error')}</AlertTitle>
      {t('An unknown error occurred. Please contact your administrator or the OpenBAS maintainers.')}
    </Alert>
  );
};

export const errorWrapper = (Component) => {
  // eslint-disable-next-line react/display-name
  return (routeProps) => (
    <ErrorBoundary display={<SimpleError />}>
      <Component {...routeProps} />
    </ErrorBoundary>
  );
};
