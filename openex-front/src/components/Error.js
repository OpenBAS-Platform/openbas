import React from 'react';
import * as R from 'ramda';
import * as PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

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
export const ErrorBoundary = R.compose(withRouter)(ErrorBoundaryComponent);

const SimpleError = () => (
  <div>
    An unknown error occurred. Please contact your administrator or the OpenEx
    maintainers.
  </div>
);

// eslint-disable-next-line react/display-name,arrow-body-style
export const errorWrapper = (Component) => {
  // eslint-disable-next-line react/display-name
  return (routeProps) => (
    <ErrorBoundary display={<SimpleError />}>
      <Component {...routeProps} />
    </ErrorBoundary>
  );
};
