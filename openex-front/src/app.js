import React from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import { history, store } from './store';
import RedirectManager from './components/RedirectManager';
import RootPublic from './public/Root';
import Root from './root';

const App = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <RedirectManager>
        <Switch>
          <Route path="/comcheck" component={RootPublic} />
          <Route path="/medias" component={RootPublic} />
          <Route component={Root} />
        </Switch>
      </RedirectManager>
    </ConnectedRouter>
  </Provider>
);

export default App;
