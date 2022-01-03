import React from 'react';
import { compose, dissoc } from 'ramda';
import * as PropTypes from 'prop-types';
import { Route, withRouter } from 'react-router-dom';

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
export const ErrorBoundary = compose(withRouter)(ErrorBoundaryComponent);

export const wrapBound = (WrappedComponent) => {
  class Wrapper extends React.PureComponent {
    render() {
      return (
        <ErrorBoundary display={<SimpleError />}>
          <WrappedComponent {...this.props} />
        </ErrorBoundary>
      );
    }
  }
  return Wrapper;
};

export const BoundaryRoute = (props) => {
  if (props.component) {
    const route = dissoc('component', props);
    return <Route component={wrapBound(props.component)} {...route} />;
  }
  if (props.render) {
    const route = dissoc('render', props);
    return (
      <Route
        render={(routeProps) => {
          const comp = props.render(routeProps);
          return (
            <ErrorBoundary display={<SimpleError />}>{comp}</ErrorBoundary>
          );
        }}
        {...route}
      />
    );
  }
  return <Route {...props} />;
};

BoundaryRoute.propTypes = {
  display: PropTypes.object,
};

// Really simple error display
export const SimpleError = () => (
  <div>
    An unknown error occurred. Please contact your administrator or the OpenEx maintainers.
  </div>
);
