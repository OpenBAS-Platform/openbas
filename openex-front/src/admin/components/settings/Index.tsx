import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Parameters from './Parameters';
import Users from './users/Users';
import Groups from './groups/Groups';
import Tags from './tags/Tags';
import { errorWrapper } from '../../../components/Error';

const Index = () => (
  <Routes>
    <Route path="" element={errorWrapper(Parameters)()} />
    <Route path="users" element={errorWrapper(Users)()} />
    <Route path="groups" element={errorWrapper(Groups)()} />
    <Route path="tags" element={errorWrapper(Tags)()} />
  </Routes>
);

export default Index;
