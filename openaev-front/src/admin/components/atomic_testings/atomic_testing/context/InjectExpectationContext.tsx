import { type QueryKey } from '@tanstack/react-query';
import { createContext } from 'react';

import { type InjectExpectationResult } from '../../../../../utils/api-types';
import type { InjectExpectationsStore } from '../../../common/injects/expectations/Expectation';

type InjectExpectationContextType = {
  onOpenDeleteInjectExpectationResult: (result: InjectExpectationResult | null, injectExpectationStore: InjectExpectationsStore | null) => void;
  onOpenEditInjectExpectationResultResult: (result: InjectExpectationResult | null, injectExpectationStore: InjectExpectationsStore | null) => void;
  onOpenAlertsDialog: (result: InjectExpectationResult | null, injectExpectationStore: InjectExpectationsStore | null) => void;
  // Live updates on: the atomic testing key the expectation queries start with. Undefined when off.
  atomicTestingQueryKey?: QueryKey;
};

const InjectExpectationContext = createContext<InjectExpectationContextType>({
  onOpenDeleteInjectExpectationResult: () => {},
  onOpenEditInjectExpectationResultResult: () => {},
  onOpenAlertsDialog: () => {},
});

export default InjectExpectationContext;
