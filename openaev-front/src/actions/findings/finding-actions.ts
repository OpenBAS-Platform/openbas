import { simpleCall, simplePostCall } from '../../utils/Action';
import { type SearchPaginationInput } from '../../utils/api-types';

const FINDING_URI = '/api/findings';

export const fetchFinding = (findingId: string, notifyError: boolean = true) => {
  return simpleCall(`${FINDING_URI}/${findingId}`, undefined, notifyError);
};

// Group-wide summary (deduplicated by type + value): true first/last seen and
// distinct impact counts across every occurrence, computed server-side.
export const fetchFindingSummary = (findingId: string, notifyError: boolean = true) => {
  return simpleCall(`${FINDING_URI}/${findingId}/summary`, undefined, notifyError);
};

export const searchFindings = (searchPaginationInput: SearchPaginationInput, notifyError: boolean = true) => {
  const data = searchPaginationInput;
  const uri = `${FINDING_URI}/search`;
  return simplePostCall(uri, data, undefined, notifyError);
};

export const searchFindingsForInjects = (injectId: string, searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = `${FINDING_URI}/injects/${injectId}/search`;
  return simplePostCall(uri, data);
};

export const searchFindingsOnEndpoint = (endpointId: string, searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = `${FINDING_URI}/endpoints/${endpointId}/search`;
  return simplePostCall(uri, data);
};

export const searchFindingsForSimulations = (simulationId: string, searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = `${FINDING_URI}/exercises/${simulationId}/search`;
  return simplePostCall(uri, data);
};

export const searchFindingsForScenarios = (scenarioId: string, searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = `${FINDING_URI}/scenarios/${scenarioId}/search`;
  return simplePostCall(uri, data);
};

// -- DISTINCT --

export const searchDistinctFindings = (searchPaginationInput: SearchPaginationInput, notifyError: boolean = true) => {
  const data = searchPaginationInput;
  const uri = `${FINDING_URI}/search?distinct=true`;
  return simplePostCall(uri, data, undefined, notifyError);
};

export const searchDistinctFindingsForInjects = (injectId: string, searchPaginationInput: SearchPaginationInput, notifyError: boolean = true) => {
  const data = searchPaginationInput;
  const uri = `${FINDING_URI}/injects/${injectId}/search?distinct=true`;
  return simplePostCall(uri, data, undefined, notifyError);
};

export const searchDistinctFindingsOnEndpoint = (endpointId: string, searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = `${FINDING_URI}/endpoints/${endpointId}/search?distinct=true`;
  return simplePostCall(uri, data);
};

export const searchDistinctFindingsForSimulations = (simulationId: string, searchPaginationInput: SearchPaginationInput, notifyError: boolean = true) => {
  const data = searchPaginationInput;
  const uri = `${FINDING_URI}/exercises/${simulationId}/search?distinct=true`;
  return simplePostCall(uri, data, undefined, notifyError);
};

export const searchDistinctFindingsForScenarios = (scenarioId: string, searchPaginationInput: SearchPaginationInput, notifyError: boolean = true) => {
  const data = searchPaginationInput;
  const uri = `${FINDING_URI}/scenarios/${scenarioId}/search?distinct=true`;
  return simplePostCall(uri, data, undefined, notifyError);
};

// The vulnerability behind a CVE finding, with the error toast optional (the query of the finding
// screen shows it once, after retries). Same endpoint as fetchVulnerabilityByExternalId.
export const fetchFindingVulnerability = (cveId: string, notifyError: boolean = true) => {
  return simpleCall(`/api/vulnerabilities/external-id/${cveId}`, undefined, notifyError);
};
