import { type FunctionComponent, useEffect, useState } from 'react';

import { getSecurityPlatformFromExternalReference } from '../../../../actions/assets/securityPlatform-actions';
import { getAlertLinksCount } from '../../../../actions/atomic_testings/atomic-testing-actions';
import { type InjectExpectationResult, type SecurityPlatform } from '../../../../utils/api-types';

interface Props {
  injectExpectationId: string;
  expectationResult: InjectExpectationResult;
}

const TargetResultAlertNumber: FunctionComponent<Props> = ({
  injectExpectationId,
  expectationResult,
}) => {
  const [sourceId, setSourceId] = useState<string | undefined>('');
  const [alertLinksNumber, setAlertLinksNumber] = useState<number | null>(0);
  if (expectationResult.sourceType === 'collector' && expectationResult.sourceId !== undefined) {
    useEffect(() => {
      getSecurityPlatformFromExternalReference(expectationResult.sourceId).then((result: { data: SecurityPlatform }) => setSourceId(result.data.asset_id ?? ''));
    }, [expectationResult.sourceId]);
  } else {
    setSourceId(expectationResult.sourceId);
  }

  useEffect(() => {
    getAlertLinksCount(injectExpectationId, sourceId).then((result: { data: number }) => setAlertLinksNumber(result.data ?? 0));
  }, [injectExpectationId, sourceId]);

  return (
    <div>
      {alertLinksNumber}
    </div>
  );
};

export default TargetResultAlertNumber;
