import { OpenInNew } from '@mui/icons-material';
import { Grid, Link, Typography } from '@mui/material';
import { type FunctionComponent, useEffect, useState } from 'react';

import { fetchExpectationTraces } from '../../../../actions/atomic_testings/atomic-testing-actions';
import { useFormatter } from '../../../../components/i18n';
import type { InjectExpectationTrace } from '../../../../utils/api-types';

interface Props {
  injectExpectationId: string;
  collectorId: string;
  expectationResult: string;
}

const TargetResultsSecurityPlatform: FunctionComponent<Props> = ({
  injectExpectationId,
  collectorId,
  expectationResult,
}) => {
  const { t, fldt } = useFormatter();
  const [expectationTraces, setExpectationTraces] = useState<InjectExpectationTrace[]>([]);

  useEffect(() => {
    fetchExpectationTraces(injectExpectationId, collectorId).then((result: { data: InjectExpectationTrace[] }) => setExpectationTraces(result.data ?? []));
  }, [injectExpectationId, collectorId]);

  return (
    <div>
      {
        expectationTraces.map((expectationTrace: InjectExpectationTrace, index) => {
          return (
            <Grid key={index} container={true} spacing={1}>
              <Grid item={true} xs={6}>
                <Link underline="always" href={expectationTrace.inject_expectation_trace_alert_link}>
                  {expectationTrace.inject_expectation_trace_alert_name}
                  <OpenInNew fontSize="small" />
                </Link>
              </Grid>
              <Grid item={true} xs={3}>
                <Typography
                  variant="h3"
                  gutterBottom
                >
                  {expectationResult}
                </Typography>
              </Grid>
              <Grid item={true} xs={3}>
                {fldt(expectationTrace.inject_expectation_trace_date)}
              </Grid>
            </Grid>
          );
        })
      }
    </div>

  );
};

export default TargetResultsSecurityPlatform;
