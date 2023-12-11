import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { errorWrapper } from '../../../components/Error';
import Integrations from './Integrations';

const Index = () => (
  <Routes>
    <Route path="" element={errorWrapper(Integrations)()} />
  </Routes>
);

export default Index;
