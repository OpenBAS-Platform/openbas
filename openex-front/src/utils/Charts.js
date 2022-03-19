export const distributionChartOptions = (theme, adjustTicks = false) => ({
  chart: {
    type: 'bar',
    toolbar: {
      show: false,
    },
    foreColor: theme.palette.text.secondary,
  },
  dataLabels: {
    enabled: false,
  },
  colors: [theme.palette.primary.main],
  states: {
    hover: {
      filter: {
        type: 'lighten',
        value: 0.05,
      },
    },
  },
  grid: {
    borderColor: theme.palette.grey[800],
    strokeDashArray: 3,
  },
  legend: {
    show: false,
  },
  tooltip: {
    theme: theme.palette.mode,
  },
  xaxis: {
    labels: {
      formatter: (value) => (typeof value === 'number' ? Math.floor(value) : value),
      style: {
        fontFamily: '"Roboto", sans-serif',
      },
    },
    axisBorder: {
      show: false,
    },
    tickAmount: adjustTicks ? 1 : undefined,
  },
  yaxis: {
    labels: {
      style: {
        fontFamily: '"Roboto", sans-serif',
      },
    },
    axisBorder: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '30%',
      borderRadius: 5,
    },
  },
});
