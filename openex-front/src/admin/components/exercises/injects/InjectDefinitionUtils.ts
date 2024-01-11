import R from 'ramda';
import type { ContractElement } from '../../../../utils/api-types';

/* eslint-disable @typescript-eslint/no-explicit-any */
const mandatoryGroupsValidator = (field: ContractElement, values: any) => {
  const { mandatoryGroups } = field;
  // If condition are not filled
  return mandatoryGroups?.some((mandatoryKey) => {
    const v = values[mandatoryKey];
    return v !== undefined && !R.isEmpty(v);
  });
};

export default mandatoryGroupsValidator;
