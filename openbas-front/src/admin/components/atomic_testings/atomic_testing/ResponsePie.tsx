import Chart from 'react-apexcharts';
import React, { FunctionComponent } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { Button, Grid } from '@mui/material';
import { InfoOutlined, SensorOccupiedOutlined, ShieldOutlined, TrackChangesOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useFormatter } from '../../../../components/i18n';
import type { ExpectationResultsByType, ResultDistribution } from '../../../../utils/api-types';
import type { Theme } from '../../../../components/Theme';
import { donutChartOptions } from '../../../../utils/Charts';

const useStyles = makeStyles(() => ({
  chartContainer: {
    margin: '0 auto',
    textAlign: 'center',
    position: 'relative',
  },
  chartTitle: {
    marginTop: -20,
    fontWeight: 500,
    textAlign: 'center',
  },
  column: {
    textAlign: 'center',
  },
  iconOverlay: {
    position: 'absolute',
    top: '43%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 35,
  },
}));

interface Props {
  expectationResultsByTypes?: ExpectationResultsByType[] | null;
  humanValidationLink?: string;
}

const ResponsePie: FunctionComponent<Props> = ({
  expectationResultsByTypes,
  humanValidationLink,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const theme = useTheme<Theme>();
  // Style
  const getColor = (result: string | undefined): string => {
    const colorMap: Record<string, string> = {
      Blocked: theme.palette.success.main ?? '',
      Detected: theme.palette.success.main ?? '',
      Successful: theme.palette.success.main ?? '',
      Pending: theme.palette.grey?.['500'] ?? '',
    };
    return colorMap[result ?? ''] ?? theme.palette.error.main ?? '';
  };
  const getTotal = (distribution: ResultDistribution[]) => {
    return distribution.reduce((sum, item) => sum + (item.value!), 0)!;
  };
  const prevention = expectationResultsByTypes?.find((e) => e.type === 'PREVENTION');
  const detection = expectationResultsByTypes?.find((e) => e.type === 'DETECTION');
  const humanResponse = expectationResultsByTypes?.find((e) => e.type === 'HUMAN_RESPONSE');
  const pending = humanResponse?.distribution?.filter((res) => res.label === 'Pending' && (res.value ?? 0) > 0) ?? [];
  const displayHumanValidationBtn = humanValidationLink && (pending.length > 0);
  const Pie = ({ title, expectationResultsByType, icon }: { title: string, expectationResultsByType?: ExpectationResultsByType, icon: React.ReactElement }) => {
    const hasDistribution = expectationResultsByType && expectationResultsByType.distribution && expectationResultsByType.distribution.length > 0;
    return (
      <div className={classes.column}>
        <div className={classes.chartContainer}>
          {icon}
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-expect-error */}
          <Chart options={
            donutChartOptions(
              theme,
              hasDistribution
                ? expectationResultsByType.distribution.map((e) => `${t(e.label)} (${(((e.value!) / getTotal(expectationResultsByType.distribution!)) * 100).toFixed(1)}%)`)
                : [t('Unknown Data')],
              'bottom',
              false,
              hasDistribution ? expectationResultsByType.distribution.map((e) => getColor(e.label)) : ['rgba(202,203,206,0.18)'],
              false,
            )}
            series={hasDistribution ? expectationResultsByType.distribution.map((e) => (e.value!)) : [1]}
            type="donut"
            width="100%"
            height="100%"
          />
        </div>
        <div className={classes.chartTitle}>{title}</div>
        {expectationResultsByType?.type === 'HUMAN_RESPONSE' && displayHumanValidationBtn && (
          <Button
            startIcon={<InfoOutlined />}
            color="primary"
            component={Link}
            to={humanValidationLink}
          >
            {`${pending.length} ${t('validations needed')}`}
          </Button>
        )}
      </div>
    );
  };

  return (
    <Grid container={true} spacing={3}>
      <Grid item={true} xs={4}>
        <Pie title={t('TYPE_PREVENTION')} expectationResultsByType={prevention} icon={<ShieldOutlined className={classes.iconOverlay} />} />
      </Grid>
      <Grid item={true} xs={4}>
        <Pie title={t('TYPE_DETECTION')} expectationResultsByType={detection} icon={<TrackChangesOutlined className={classes.iconOverlay} />} />
      </Grid>
      <Grid item={true} xs={4}>
        <Pie title={t('TYPE_HUMAN_RESPONSE')} expectationResultsByType={humanResponse} icon={<SensorOccupiedOutlined className={classes.iconOverlay} />} />
      </Grid>
    </Grid>
  );
};

export default ResponsePie;
