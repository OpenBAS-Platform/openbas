import Chart from 'react-apexcharts';
import React, { FunctionComponent } from 'react';
import { makeStyles } from '@mui/styles';
import { Box, Typography } from '@mui/material';
import { SensorOccupied, Shield, TrackChanges } from '@mui/icons-material';
import { useFormatter } from '../../../../components/i18n';
import type { ExpectationResultsByType } from '../../../../utils/api-types';
import Empty from '../../../../components/Empty';

const useStyles = makeStyles(() => ({
  inline: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  chartContainer: {
    position: 'relative',
    width: '300px',
    height: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  iconOverlay: {
    position: 'absolute',
    top: '33%',
    left: '44%',
    fontSize: '40px',
  },
}));

interface Props {
  expectations?: ExpectationResultsByType[]
}

const ResponsePie: FunctionComponent<Props> = ({
  expectations,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  // Sytle
  const getColor = (result: string | undefined): string => {
    const colorMap: Record<string, string> = {
      Blocked: 'rgb(107, 235, 112)',
      Detected: 'rgb(107, 235, 112)',
      Successful: 'rgb(107, 235, 112)',
      VALIDATED: 'rgb(107, 235, 112)',
      Failed: 'rgb(220, 81, 72)',
      Unblocked: 'rgb(220, 81, 72)',
      Undetected: 'rgb(220, 81, 72)',
      FAILED: 'rgb(220, 81, 72)',
    };

    return colorMap[result ?? ''] ?? 'rgb(245, 166, 35)';
  };
  const getChartIcon = (type, result) => {
    switch (type) {
      case 'PREVENTION':
        return <Shield className={classes.iconOverlay} style={{ color: getColor(result) }}/>;
      case 'DETECTION':
        return <TrackChanges className={classes.iconOverlay} style={{ color: getColor(result) }}/>;
      default:
        return <SensorOccupied className={classes.iconOverlay} style={{ color: getColor(result) }}/>;
    }
  };
  const getTotal = (distribution) => {
    return distribution.reduce((sum, item) => sum + item.value, 0);
  };
  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'donut',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
        },
      },
    },
    legend: {
      position: 'bottom',
      show: true,
    },
    stroke: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
  };

  return (
    <>
      <Box margin={1}> {
        <div className={classes.inline}>
          {expectations?.map((expectation, index) => (
            <div key={index} className={classes.chartContainer}>
              <Typography variant="h1"
                className={classes.chartTitle}
              >{t(`TYPE_${expectation.type}`)}</Typography>
              {getChartIcon(expectation.type, expectation.avgResult)}
              <Chart
                key={index}
                options={{
                  ...chartOptions,
                  labels: expectation.distribution.map((e) => `${e.label} (${((e.value / getTotal(expectation.distribution)) * 100).toFixed(1)}%)`),
                  colors: expectation.distribution.map((e) => getColor(e.label)),
                }}
                series={expectation.distribution.map((e) => e.value)}
                type="donut"
                width="100%"
                height="100%"
              />
            </div>
          ))}
          {!expectations || expectations.length === 0 ? (
            <div className={classes.chartContainer}>
              <Empty message={t('No data available')}/>
            </div>
          ) : null}
        </div>
      }
      </Box>
    </>
  );
};

export default ResponsePie;
