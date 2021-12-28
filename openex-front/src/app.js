import React from 'react';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';
import { history, store } from './store';
import RedirectManager from './components/RedirectManager';
import RootPrivate from './private/Root';

const App = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <RedirectManager>
        <Route component={RootPrivate} />
      </RedirectManager>
    </ConnectedRouter>
  </Provider>
);

export default App;
