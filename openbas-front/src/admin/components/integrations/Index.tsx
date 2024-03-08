import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Integrations from './Integrations';
import { errorWrapper } from '../../../components/Error';
import NotFound from '../../../components/NotFound';

const Index = () => (
  <Routes>
    <Route path="" element={errorWrapper(Integrations)()} />
    {/* Not found */}
    <Route path="*" element={<NotFound/>}/>
  </Routes>
);

export default Index;
