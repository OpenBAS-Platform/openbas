import { createContext } from 'react';

import type { InjectResultDTO } from '../../../utils/api-types';

export type InjectResultDtoContextType = { injectResultDto: InjectResultDTO | null; updateInjectResultDto: (data: InjectResultDTO) => void };
export const InjectResultDtoContext = createContext<InjectResultDtoContextType>({
  injectResultDto: null,
  updateInjectResultDto: () => {
  },
});
