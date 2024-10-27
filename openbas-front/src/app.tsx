import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { HistoryRouter as Router } from 'redux-first-history/rr6';

import NotFound from './components/NotFound';
import RedirectManager from './components/RedirectManager';
import Root from './root';
import { history, store } from './store';
import { APP_BASE_PATH } from './utils/Action';

const App = () => (
  <Provider store={store}>
    <Router basename={APP_BASE_PATH} history={history}>
      <RedirectManager>
        <Routes>
          <Route path="/*" element={<Root />} />
          {/* Not found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </RedirectManager>
    </Router>
  </Provider>
);

export default App;
