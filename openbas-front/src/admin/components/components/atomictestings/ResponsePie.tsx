import Chart from 'react-apexcharts';
import React, { FunctionComponent } from 'react';
import { makeStyles } from '@mui/styles';
import type { BasicExpectationResult } from '../../../../utils/api-types';

const useStyles = makeStyles(() => ({
  inline: {
    display: 'flex',
    gap: '30px', // Adjust the gap between charts
    textAlign: 'right',
  },
  chartContainer: {
    position: 'relative',
    float: 'right',
  },
  chartTitle: {
    fontWeight: 'bold',
    position: 'absolute',
  },
}));

interface Props {
  expectations?: BasicExpectationResult[]
}

const ResponsePie: FunctionComponent<Props> = ({
  expectations,
}) => {
  // Standard hooks
  const classes = useStyles();

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'donut',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%', // Adjust the size of the donut hole
        },
      },
    },
    labels: [],
    legend: {
      position: 'bottom',
    },
  };

  return (
    <div className={classes.inline}>
      {expectations?.map((expectation, index) => (
        <div key={index} className={classes.chartContainer}>
          <Chart
            key={index}
            options={{
              ...chartOptions,
              labels: expectation.distribution.map((e) => e.label),
              legend: { position: index === 0 ? 'left' : 'right' },
            }}
            series={expectation.distribution.map((e) => e.value)}
            type="donut"
            width="100%"
            height="100%"
          />
          <div className={classes.chartTitle}>{expectation.type}</div>
        </div>
      ))}
    </div>
  );
};

export default ResponsePie;
