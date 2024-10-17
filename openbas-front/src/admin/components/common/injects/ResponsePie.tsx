import Chart from 'react-apexcharts';
import React, { memo } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { Button, Grid } from '@mui/material';
import { InfoOutlined, SensorOccupiedOutlined, ShieldOutlined, TrackChangesOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import type { ApexOptions } from 'apexcharts';
import { useFormatter } from '../../../../components/i18n';
import type { ExpectationResultsByType, ResultDistribution } from '../../../../utils/api-types';
import type { Theme } from '../../../../components/Theme';
import { donutChartOptions } from '../../../../utils/Charts';
import Loader from '../../../../components/Loader';

const useStyles = makeStyles((theme: Theme) => ({
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
  chartTitleDisabled: {
    marginTop: -20,
    fontWeight: 500,
    textAlign: 'center',
    color: theme.palette.text?.disabled,
  },
  column: {
    textAlign: 'center',
  },
  iconOverlay: {
    position: 'absolute',
    top: '37%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 35,
  },
}));

interface Props {
  expectationResultsByTypes?: ExpectationResultsByType[] | null;
  humanValidationLink?: string;
  immutable?: boolean;
  disableChartAnimation?:boolean;
}

const ResponsePie = (({ expectationResultsByTypes, humanValidationLink, immutable, disableChartAnimation }: Props) => {
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
      Partial: theme.palette.warning.main ?? '',
      'Partially Prevented': theme.palette.warning.main ?? '',
      'Partially Detected': theme.palette.warning.main ?? '',
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
  const renderIcon = (type: string, hasDistribution: boolean | undefined) => {
    switch (type) {
      case 'prevention':
        return <ShieldOutlined color={hasDistribution ? 'inherit' : 'disabled'} className={classes.iconOverlay} />;
      case 'detection':
        return <TrackChangesOutlined color={hasDistribution ? 'inherit' : 'disabled'} className={classes.iconOverlay} />;
      default:
        return <SensorOccupiedOutlined color={hasDistribution ? 'inherit' : 'disabled'} className={classes.iconOverlay} />;
    }
  };
  const Pie = ({ title, expectationResultsByType, type }: { title: string, expectationResultsByType?: ExpectationResultsByType, type: string }) => {
    const hasDistribution = expectationResultsByType && expectationResultsByType.distribution && expectationResultsByType.distribution.length > 0;
    const labels = hasDistribution
      ? expectationResultsByType.distribution.map((e) => `${t(e.label)} (${(((e.value!) / getTotal(expectationResultsByType.distribution!)) * 100).toFixed(1)}%)`)
      : [`${t('No expectation for')} ${title}`];
    let colors = [];
    if (immutable) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      colors = hasDistribution ? expectationResultsByType.distribution.map((e) => getColor(e.label)).asMutable() : ['rgba(202, 203, 206, 0.18)'];
    } else {
      colors = hasDistribution ? expectationResultsByType.distribution.map((e) => getColor(e.label)) : ['rgba(202, 203, 206, 0.18)'];
    }
    const data = hasDistribution ? expectationResultsByType.distribution.map((e) => e.value) : [1];
    return (
      <div className={classes.column}>
        <div className={classes.chartContainer}>
          {renderIcon(type, hasDistribution)}
          <Chart options={
            donutChartOptions({
              theme,
              labels,
              legendPosition: 'bottom',
              chartColors: colors,
              displayLegend: false,
              disableAnimation: disableChartAnimation,
            }) as ApexOptions}
            series={data}
            type="donut"
            width="100%"
            height="100%"
          />
        </div>
        <div className={hasDistribution ? classes.chartTitle : classes.chartTitleDisabled}>{title}</div>
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
        {expectationResultsByTypes && expectationResultsByTypes.length > 0 ? <Pie type='prevention' title={t('TYPE_PREVENTION')} expectationResultsByType={prevention} /> : <Loader variant="inElement" />}
      </Grid>
      <Grid item={true} xs={4}>
        {expectationResultsByTypes && expectationResultsByTypes.length > 0 ? <Pie type='detection' title={t('TYPE_DETECTION')} expectationResultsByType={detection} /> : <Loader variant="inElement" />}
      </Grid>
      <Grid item={true} xs={4}>
        {expectationResultsByTypes && expectationResultsByTypes.length > 0 ? <Pie type='human_response' title={t('TYPE_HUMAN_RESPONSE')} expectationResultsByType={humanResponse} /> : <Loader variant="inElement" />}
      </Grid>
    </Grid>
  );
});

export default memo(ResponsePie);
