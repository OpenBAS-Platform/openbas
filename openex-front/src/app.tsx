import React from 'react';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { HistoryRouter as Router } from 'redux-first-history/rr6';
import { history, store } from './store';
import RedirectManager from './components/RedirectManager';
import Root from './root';

const App = () => (
  <Provider store={store}>
    <Router history={history}>
      <RedirectManager>
        <Routes>
          <Route path="/*" element={<Root />} />
        </Routes>
      </RedirectManager>
    </Router>
  </Provider>
);

export default App;
