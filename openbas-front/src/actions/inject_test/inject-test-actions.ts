import { simpleCall, simpleDelCall, simplePostCall } from '../../utils/Action';
import { type InjectBulkProcessingInput } from '../../utils/api-types';
import { MESSAGING$ } from '../../utils/Environment';

export const testInject = (injectId: string) => {
  const uri = `/api/injects/${injectId}/test`;
  return simpleCall(uri);
};

export const bulkTestInjects = (data: InjectBulkProcessingInput) => {
  const uri = '/api/injects/test';
  return simplePostCall(uri, data, undefined, false).catch((error) => {
    MESSAGING$.notifyError('Can\'t be tested');
    throw error;
  });
};

export const fetchInjectTestStatus = (testId: string | undefined) => {
  const uri = `/api/injects/test/${testId}`;
  return simpleCall(uri);
};

export const deleteInjectTest = (testId: string | undefined) => {
  const uri = `/api/injects/test/${testId}`;
  return simpleDelCall(uri);
};
