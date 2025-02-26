import { type InjectResultOverviewOutput } from '../api-types';

const isInjectWithPayloadInfo = (injectResultOverviewOutput: InjectResultOverviewOutput) => {
  return !!injectResultOverviewOutput.inject_injector_contract.injector_contract_payload;
};

export default isInjectWithPayloadInfo;
