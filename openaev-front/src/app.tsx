import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router';

import NotFound from './components/NotFound';
import RedirectManager from './components/RedirectManager';
import Root from './root';
import { store } from './store';
import queryClient from './utils/query/queryClient';
import { computeTenantBasename } from './utils/url-helper';

const basename = computeTenantBasename();

// Development builds only: the condition is false in a production build, which drops the import.
const ReactQueryDevtools = import.meta.env.DEV
  // eslint-disable-next-line import/no-extraneous-dependencies -- dev-only tool, never reached in a production build
  ? lazy(() => import('@tanstack/react-query-devtools').then(module => ({ default: module.ReactQueryDevtools })))
  : null;

const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter key={basename} basename={basename}>
          <RedirectManager>
            <Routes>
              <Route path="/*" element={<Root />} />
              {/* Not found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RedirectManager>
        </BrowserRouter>
        {ReactQueryDevtools && (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        )}
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
