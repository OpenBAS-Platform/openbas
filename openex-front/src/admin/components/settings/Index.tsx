import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Parameters from './Parameters';
import Users from './users/Users';
import Groups from './groups/Groups';
import Tags from './tags/Tags';
import { errorWrapper } from '../../../components/Error';

const Index = () => (
  <Routes>
    <Route path="" element={errorWrapper(Parameters)()} />
    <Route path="security" element={<Navigate to="groups" replace={true} />} />
    <Route path="security/groups" element={errorWrapper(Groups)()} />
    <Route path="security/users" element={errorWrapper(Users)()} />
    <Route path="taxonomies" element={<Navigate to="tags" replace={true} />} />
    <Route path="taxonomies/tags" element={errorWrapper(Tags)()} />
  </Routes>
);

export default Index;
