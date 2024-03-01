import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Integrations from './Integrations';
import { errorWrapper } from '../../../components/Error';

const Index = () => (
  <Routes>
    <Route path="" element={errorWrapper(Integrations)()} />
  </Routes>
);

export default Index;
