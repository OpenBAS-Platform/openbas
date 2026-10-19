import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@filigran/design-system';
import { Typography } from '@mui/material';
import { type FunctionComponent, type MouseEvent, useContext, useEffect, useState } from 'react';

import { getAlertLinksCount, getAlertLinksCountQuery } from '../../../../../actions/atomic_testings/atomic-testing-actions';
import { useFormatter } from '../../../../../components/i18n';
import { type InjectExpectationResult } from '../../../../../utils/api-types';
import useNotifiedQuery from '../../../../../utils/query/useNotifiedQuery';
import InjectExpectationContext from '../context/InjectExpectationContext';

interface Props {
  injectExpectationId: string;
  expectationResult: InjectExpectationResult;
  onShowAlerts?: () => void;
}

// Alert count for a security-platform result line. When alerts exist, renders
// a small primary button opening the alerts dialog; otherwise a plain "0".
const TargetResultAlertNumber: FunctionComponent<Props> = ({
  injectExpectationId,
  expectationResult,
  onShowAlerts,
}) => {
  const { t } = useFormatter();
  const { atomicTestingQueryKey } = useContext(InjectExpectationContext);
  const liveUpdates = atomicTestingQueryKey !== undefined;
  const [stateAlertLinksNumber, setStateAlertLinksNumber] = useState<number | null>(0);

  useEffect(() => {
    if (liveUpdates) {
      return;
    }
    getAlertLinksCount(injectExpectationId, expectationResult.sourceId, expectationResult.sourceType)
      .then((result: { data: number }) => setStateAlertLinksNumber(result.data ?? 0));
  }, [injectExpectationId, expectationResult.sourceId, expectationResult.sourceType, liveUpdates]);

  const { data: queryAlertLinksNumber } = useNotifiedQuery({
    queryKey: [...(atomicTestingQueryKey ?? []), 'alert-count', injectExpectationId, expectationResult.sourceId, expectationResult.sourceType],
    queryFn: () => getAlertLinksCountQuery(injectExpectationId, expectationResult.sourceId, expectationResult.sourceType, false)
      .then((result: { data: number }) => result.data ?? 0),
    enabled: liveUpdates,
  });

  const alertLinksNumber = liveUpdates ? (queryAlertLinksNumber ?? 0) : stateAlertLinksNumber;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onShowAlerts?.();
  };

  if (!alertLinksNumber || !onShowAlerts) {
    return (
      <Typography sx={{
        fontSize: 13,
        fontVariantNumeric: 'tabular-nums',
      }}
      >
        {alertLinksNumber ?? 0}
      </Typography>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" size="sm" onClick={handleClick} style={{ minWidth: 32 }}>
          {alertLinksNumber}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('Show alerts')}</TooltipContent>
    </Tooltip>
  );
};

export default TargetResultAlertNumber;
