import * as C from '@mui/material/colors';

export const colors = (temp) => [
  C.red[temp],
  C.pink[temp],
  C.purple[temp],
  C.deepPurple[temp],
  C.indigo[temp],
  C.blue[temp],
  C.lightBlue[temp],
  C.cyan[temp],
  C.teal[temp],
  C.green[temp],
  C.lightGreen[temp],
  C.lime[temp],
  C.yellow[temp],
  C.amber[temp],
  C.orange[temp],
  C.deepOrange[temp],
  C.brown[temp],
  C.grey[temp],
  C.blueGrey[temp],
  C.red[temp + 100],
  C.pink[temp + 100],
  C.purple[temp + 100],
  C.deepPurple[temp + 100],
  C.indigo[temp + 100],
  C.blue[temp + 100],
  C.lightBlue[temp + 100],
  C.cyan[temp + 100],
  C.teal[temp + 100],
  C.green[temp + 100],
  C.lightGreen[temp + 100],
  C.lime[temp + 100],
  C.yellow[temp + 100],
  C.amber[temp + 100],
  C.orange[temp + 100],
  C.deepOrange[temp + 100],
  C.brown[temp + 100],
  C.grey[temp + 100],
  C.blueGrey[temp + 100],
];

/**
 * A custom tooltip for ApexChart.
 * This tooltip only display the label of the data it hovers.
 *
 * Why custom tooltip? To manage text color of the tooltip that cannot be done by
 * the ApexChart API by default.
 *
 * @param {Theme} theme
 */
const simpleLabelTooltip = (theme) => ({ seriesIndex, w }) => (`
  <div style="background: ${theme.palette.background.nav}; color: ${theme.palette.text.primary}; padding: 2px 6px; font-size: 12px">
    ${w.config.labels[seriesIndex]}
  </div>
`);

export const resultColors = (temp) => [
  C.deepPurple[temp],
  C.indigo[temp],
  C.lightBlue[temp],
];

const toolbarOptions = {
  show: false,
  export: {
    csv: {
      columnDelimiter: ',',
      headerCategory: 'category',
      headerValue: 'value',
      dateFormatter(timestamp) {
        return new Date(timestamp).toDateString();
      },
    },
  },
};

export const lineChartOptions = (
  theme,
  isTimeSeries = false,
  xFormatter = null,
  yFormatter = null,
  tickAmount = undefined,
  distributed = false,
  dataLabels = false,
) => ({
  chart: {
    type: 'line',
    background: 'transparent',
    toolbar: {
      show: false,
    },
    foreColor: theme.palette.text.secondary,
  },
  theme: {
    mode: theme.palette.mode,
  },
  dataLabels: {
    enabled: dataLabels,
  },
  colors: distributed
    ? colors(theme.palette.mode === 'dark' ? 400 : 600)
    : [theme.palette.primary.main],
  states: {
    hover: {
      filter: {
        type: 'lighten',
        value: 0.05,
      },
    },
  },
  grid: {
    borderColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, .1)'
        : 'rgba(0, 0, 0, .1)',
    strokeDashArray: 3,
  },
  legend: {
    show: true,
    itemMargin: {
      horizontal: 5,
      vertical: 20,
    },
  },
  stroke: {
    curve: 'smooth',
  },
  tooltip: {
    theme: theme.palette.mode,
  },
  xaxis: {
    type: isTimeSeries ? 'datetime' : 'category',
    tickAmount,
    tickPlacement: 'on',
    labels: {
      formatter: (value) => (xFormatter ? xFormatter(value) : value),
      style: {
        fontSize: '12px',
        fontFamily: '"IBM Plex Sans", sans-serif',
      },
    },
    axisBorder: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      formatter: (value) => (yFormatter ? yFormatter(value) : value),
      style: {
        fontSize: '14px',
        fontFamily: '"IBM Plex Sans", sans-serif',
      },
    },
    axisBorder: {
      show: false,
    },
  },
});

export const areaChartOptions = (
  theme,
  isTimeSeries = false,
  xFormatter = null,
  yFormatter = null,
  tickAmount = undefined,
) => ({
  chart: {
    type: 'area',
    background: 'transparent',
    toolbar: {
      show: false,
    },
    foreColor: theme.palette.text.secondary,
  },
  theme: {
    mode: theme.palette.mode,
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
    width: 2,
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
    borderColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, .1)'
        : 'rgba(0, 0, 0, .1)',
    strokeDashArray: 3,
  },
  legend: {
    show: false,
  },
  tooltip: {
    theme: theme.palette.mode,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: theme.palette.mode,
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.1,
      gradientToColors: [
        theme.palette.primary.main,
        theme.palette.primary.main,
      ],
    },
  },
  xaxis: {
    type: isTimeSeries ? 'datetime' : 'category',
    tickAmount,
    tickPlacement: 'on',
    labels: {
      formatter: (value) => (xFormatter ? xFormatter(value) : value),
      style: {
        fontSize: '12px',
        fontFamily: '"IBM Plex Sans", sans-serif',
      },
    },
    axisBorder: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      formatter: (value) => (yFormatter ? yFormatter(value) : value),
      style: {
        fontSize: '14px',
        fontFamily: '"IBM Plex Sans", sans-serif',
      },
    },
    axisBorder: {
      show: false,
    },
  },
});

/**
 * @param {Theme} theme
 * @param {function} xFormatter
 * @param {function} yFormatter
 * @param {boolean} distributed
 * @param {boolean} isTimeSeries
 * @param {boolean} isStacked
 * @param {boolean} legend
 * @param {number | 'dataPoints'} tickAmount
 * @param {boolean} isResult
 * @param {boolean} isFakeData
 * @param {number} max
 * @param {string} emptyChartText
 */
export const verticalBarsChartOptions = (
  theme,
  xFormatter = null,
  yFormatter = null,
  distributed = false,
  isTimeSeries = false,
  isStacked = false,
  legend = false,
  tickAmount = undefined,
  isResult = false,
  isFakeData = false,
  max = undefined,
  emptyChartText = '',
) => ({
  chart: {
    type: 'bar',
    background: 'transparent',
    toolbar: toolbarOptions,
    foreColor: theme.palette.text.secondary,
    stacked: isStacked,
    width: '100%',
    height: '100%',
    zoom: {
      enabled: !isFakeData,
    },
    animations: {
      enabled: !isFakeData,
    },
  },
  theme: {
    mode: theme.palette.mode,
  },
  dataLabels: {
    enabled: false,
  },
  // eslint-disable-next-line no-nested-ternary
  colors: isResult ? resultColors(theme.palette.mode === 'dark' ? 400 : 600) : distributed ? colors(theme.palette.mode === 'dark' ? 400 : 600) : [theme.palette.primary.main],
  states: {
    hover: {
      filter: {
        type: isFakeData ? 'none' : 'lighten',
        value: 0.05,
      },
    },
    active: {
      filter: {
        type: isFakeData ? 'none' : 'lighten',
      },
    },
  },
  grid: {
    borderColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, .1)'
        : 'rgba(0, 0, 0, .1)',
    strokeDashArray: 3,
  },
  legend: {
    show: legend,
    itemMargin: {
      horizontal: 5,
      vertical: 20,
    },
    onItemClick: {
      toggleDataSeries: !isFakeData,
    },
    onItemHover: {
      highlightDataSeries: !isFakeData,
    },
  },
  tooltip: {
    theme: theme.palette.mode,
    enabled: !isFakeData,
  },
  xaxis: {
    type: isTimeSeries ? 'datetime' : 'category',
    tickAmount,
    tickPlacement: 'on',
    labels: {
      formatter: (value) => (xFormatter ? xFormatter(value) : value),
      style: {
        fontSize: '12px',
        fontFamily: '"IBM Plex Sans", sans-serif',
      },
      show: !isFakeData,
    },
    axisBorder: {
      show: false,
    },
  },
  fill: {
    opacity: isFakeData ? 0.1 : 1,
  },
  stroke: {
    colors: isResult ? ['transparent'] : undefined,
    width: isResult ? 5 : 2,
  },
  yaxis: {
    labels: {
      formatter: (value) => (yFormatter ? yFormatter(value) : value),
      style: {
        fontFamily: '"IBM Plex Sans", sans-serif',
      },
    },
    axisBorder: {
      show: false,
    },
    max,
  },
  plotOptions: {
    bar: {
      horizontal: false,
      barHeight: '30%',
      borderRadius: 4,
      borderRadiusApplication: 'end',
      borderRadiusWhenStacked: 'last',
      distributed,
    },
  },
  ...(isFakeData && {
    subtitle: {
      text: emptyChartText,
      align: 'center',
      offsetY: 130,
    },
  }),
});

/**
 * @param {Theme} theme
 * @param {boolean} adjustTicks
 * @param {function} xFormatter
 * @param {function} yFormatter
 * @param {boolean} distributed
 * @param {function} navigate
 * @param {object[]} redirectionUtils
 * @param {boolean} stacked
 * @param {boolean} total
 * @param {string[]} categories
 * @param {boolean} legend
 * @param {boolean} isFakeData
 */
export const horizontalBarsChartOptions = (
  theme,
  adjustTicks = false,
  xFormatter = null,
  yFormatter = null,
  distributed = false,
  stacked = false,
  total = false,
  categories = null,
  legend = false,
  isFakeData = false,
) => ({
  chart: {
    type: 'bar',
    background: 'transparent',
    toolbar: toolbarOptions,
    foreColor: theme.palette.text.secondary,
    stacked,
    width: '100%',
    height: '100%',
  },
  theme: {
    mode: theme.palette.mode,
  },
  dataLabels: {
    enabled: false,
  },
  colors: [
    theme.palette.primary.main,
    ...colors(theme.palette.mode === 'dark' ? 400 : 600),
  ],
  states: {
    hover: {
      filter: {
        type: 'lighten',
        value: 0.05,
      },
    },
  },
  fill: {
    opacity: isFakeData ? 0.1 : 0.9,
  },
  grid: {
    borderColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, .1)'
        : 'rgba(0, 0, 0, .1)',
    strokeDashArray: 3,
  },
  legend: {
    show: legend,
    itemMargin: {
      horizontal: 5,
    },
  },
  tooltip: {
    theme: theme.palette.mode,
  },
  xaxis: {
    categories: categories ?? [],
    labels: {
      formatter: (value) => (xFormatter ? xFormatter(value) : value),
      style: {
        fontFamily: '"IBM Plex Sans", sans-serif',
      },
    },
    axisBorder: {
      show: false,
    },
    tickAmount: adjustTicks ? 1 : undefined,
  },
  yaxis: {
    labels: {
      formatter: (value) => (yFormatter ? yFormatter(value) : value),
      style: {
        fontFamily: '"IBM Plex Sans", sans-serif',
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
      borderRadius: 4,
      borderRadiusApplication: 'end',
      borderRadiusWhenStacked: 'last',
      distributed,
      dataLabels: {
        total: {
          enabled: total,
          offsetX: 0,
          style: {
            fontSize: '13px',
            fontWeight: 900,
            fontFamily: '"IBM Plex Sans", sans-serif',
          },
        },
      },
    },
  },
});

export const radarChartOptions = (theme, labels, chartColors = []) => ({
  chart: {
    type: 'radar',
    background: 'transparent',
    toolbar: {
      show: false,
    },
    offsetY: -20,
  },
  theme: {
    mode: theme.palette.mode,
  },
  labels,
  states: {
    hover: {
      filter: {
        type: 'lighten',
        value: 0.05,
      },
    },
  },
  legend: {
    show: false,
  },
  tooltip: {
    theme: theme.palette.mode,
  },
  fill: {
    opacity: 0.2,
    colors: [theme.palette.primary.main],
  },
  stroke: {
    show: true,
    width: 1,
    colors: [theme.palette.primary.main],
    dashArray: 0,
  },
  markers: {
    shape: 'circle',
    strokeColors: [theme.palette.primary.main],
    colors: [theme.palette.primary.main],
  },
  xaxis: {
    labels: {
      style: {
        fontFamily: '"IBM Plex Sans", sans-serif',
        colors: chartColors,
      },
    },
    axisBorder: {
      show: false,
    },
  },
  yaxis: {
    show: false,
  },
  plotOptions: {
    radar: {
      polygons: {
        strokeColors:
          theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, .1)'
            : 'rgba(0, 0, 0, .1)',
        connectorColors:
          theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, .1)'
            : 'rgba(0, 0, 0, .1)',
        fill: { colors: [theme.palette.background.paper] },
      },
    },
  },
});

/**
 * @param {Theme} theme
 * @param {string[]} labels
 * @param {function} formatter
 * @param {string} legendPosition
 * @param {string[]} chartColors
 * @param {boolean} legend
 * @param {boolean} isFakeData
 */
export const polarAreaChartOptions = (
  theme,
  labels,
  formatter = null,
  legendPosition = 'bottom',
  chartColors = [],
  legend = true,
  isFakeData = false,
) => {
  const temp = theme.palette.mode === 'dark' ? 400 : 600;
  let chartFinalColors = chartColors;
  if (chartFinalColors.length === 0) {
    chartFinalColors = colors(temp);
    if (labels.length === 2 && labels[0] === 'true') {
      chartFinalColors = [C.green[temp], C.red[temp]];
    } else if (labels.length === 2 && labels[0] === 'false') {
      chartFinalColors = [C.red[temp], C.green[temp]];
    }
  }
  return {
    chart: {
      type: 'polarArea',
      background: 'transparent',
      toolbar: toolbarOptions,
      foreColor: theme.palette.text.secondary,
      width: '100%',
      height: '100%',
    },
    theme: {
      mode: theme.palette.mode,
    },
    colors: chartFinalColors,
    labels,
    states: {
      hover: {
        filter: {
          type: 'lighten',
          value: 0.05,
        },
      },
    },
    legend: {
      show: legend,
      position: legendPosition,
      floating: legendPosition === 'bottom',
      fontFamily: '"IBM Plex Sans", sans-serif',
    },
    tooltip: {
      theme: theme.palette.mode,
      custom: simpleLabelTooltip(theme),
    },
    fill: {
      opacity: isFakeData ? 0.2 : 0.5,
    },
    stroke: {
      show: !isFakeData,
    },
    yaxis: {
      labels: {
        formatter: (value) => (formatter ? formatter(value) : value),
        style: {
          fontFamily: '"IBM Plex Sans", sans-serif',
        },
      },
      axisBorder: {
        show: false,
      },
    },
    plotOptions: {
      polarArea: {
        rings: {
          strokeWidth: 1,
          strokeColor:
            theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, .1)'
              : 'rgba(0, 0, 0, .1)',
        },
        spokes: {
          strokeWidth: 1,
          connectorColors:
            theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, .1)'
              : 'rgba(0, 0, 0, .1)',
        },
      },
    },
  };
};

/**
 * @param {Theme} theme
 * @param {string[]} labels
 * @param {string} legendPosition
 * @param {boolean} reversed
 * @param {string[]} chartColors
 * @param {boolean} displayLegend
 * @param {boolean} displayLabels
 * @param {boolean} displayValue
 * @param {boolean} displayTooltip
 * @param {number} size
 */
export const donutChartOptions = (
  theme,
  labels,
  legendPosition = 'bottom',
  reversed = false,
  chartColors = [],
  displayLegend = true,
  displayLabels = true,
  displayValue = true,
  displayTooltip = true,
  size = 70,
) => {
  const temp = theme.palette.mode === 'dark' ? 400 : 600;
  let dataLabelsColors = labels.map(() => theme.palette.text.primary);
  if (chartColors.length > 0) {
    dataLabelsColors = chartColors.map((n) => (n === '#ffffff' ? '#000000' : theme.palette.text.primary));
  }
  let chartFinalColors = chartColors;
  if (chartFinalColors.length === 0) {
    chartFinalColors = colors(temp);
    if (labels.length === 2 && labels[0] === 'true') {
      if (reversed) {
        chartFinalColors = [C.red[temp], C.green[temp]];
      } else {
        chartFinalColors = [C.green[temp], C.red[temp]];
      }
    } else if (labels.length === 2 && labels[0] === 'false') {
      if (reversed) {
        chartFinalColors = [C.green[temp], C.red[temp]];
      } else {
        chartFinalColors = [C.red[temp], C.green[temp]];
      }
    }
  }
  return {
    chart: {
      type: 'donut',
      background: 'transparent',
      toolbar: toolbarOptions,
      foreColor: theme.palette.text.secondary,
      width: '100%',
      height: '100%',
    },
    theme: {
      mode: theme.palette.mode,
    },
    colors: chartFinalColors,
    labels,
    fill: {
      opacity: 1,
    },
    states: {
      hover: {
        filter: {
          type: 'lighten',
          value: 0.05,
        },
      },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: [theme.palette.background.paper],
    },
    tooltip: {
      enabled: displayTooltip,
      theme: theme.palette.mode,
      custom: simpleLabelTooltip(theme),
    },
    legend: {
      show: displayLegend,
      position: legendPosition,
      fontFamily: '"IBM Plex Sans", sans-serif',
    },
    dataLabels: {
      enabled: displayLabels,
      style: {
        fontSize: '10px',
        fontFamily: '"IBM Plex Sans", sans-serif',
        fontWeight: 600,
        colors: dataLabelsColors,
      },
      background: {
        enabled: false,
      },
      dropShadow: {
        enabled: false,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          value: {
            show: displayValue,
          },
          background: 'transparent',
          size: `${size}%`,
        },
      },
    },
  };
};
