import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import XlsMappers from './data_ingestion/XlsMappers';
import Parameters from './Parameters';
import Users from './users/Users';
import Groups from './groups/Groups';
import Tags from './tags/Tags';
import AttackPatterns from './attack_patterns/AttackPatterns';
import KillChainPhases from './kill_chain_phases/KillChainPhases';
import Policies from './policies/Policies';
import { errorWrapper } from '../../../components/Error';
import NotFound from '../../../components/NotFound';

const Index = () => (
  <Routes>
    <Route path="" element={errorWrapper(Parameters)()} />
    <Route path="security" element={<Navigate to="groups" replace={true} />} />
    <Route path="security/groups" element={errorWrapper(Groups)()} />
    <Route path="security/users" element={errorWrapper(Users)()} />
    <Route path="security/policies" element={errorWrapper(Policies)()} />
    <Route path="taxonomies" element={<Navigate to="tags" replace={true} />} />
    <Route path="taxonomies/tags" element={errorWrapper(Tags)()} />
    <Route path="taxonomies/attack_patterns" element={errorWrapper(AttackPatterns)()} />
    <Route path="taxonomies/kill_chain_phases" element={errorWrapper(KillChainPhases)()} />
    <Route path="data_ingestion" element={<Navigate to="xls_mappers" replace={true} />} />
    <Route path="data_ingestion/xls_mappers" element={errorWrapper(XlsMappers)()} />
    {/* Not found */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default Index;
