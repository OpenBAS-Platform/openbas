import Chart from 'react-apexcharts';
import React, { FunctionComponent } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { Box, Button, Typography } from '@mui/material';
import { InfoOutlined, SensorOccupiedOutlined, ShieldOutlined, TrackChangesOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useFormatter } from '../../../../components/i18n';
import type { ExpectationResultsByType, ResultDistribution } from '../../../../utils/api-types';
import type { Theme } from '../../../../components/Theme';

const useStyles = makeStyles(() => ({
  inline: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  chartContainer: {
    position: 'relative',
    width: '350px',
    height: '350px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContainer: {
    display: 'flex',
    gap: '8',
    placeContent: 'center',
    placeItems: 'center',
  },
  chartTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  iconOverlay: {
    position: 'absolute',
    top: '36%',
    left: '43%',
    fontSize: '50px',
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

  // Sytle
  const getColor = (result: string | undefined): string => {
    const colorMap: Record<string, string> = {
      Blocked: 'rgb(107, 235, 112)',
      Detected: 'rgb(107, 235, 112)',
      Successful: 'rgb(107, 235, 112)',
      Pending: 'rgb(128,128,128)',
    };

    return colorMap[result ?? ''] ?? 'rgb(220, 81, 72)';
  };

  const getTotal = (distribution: ResultDistribution[]) => {
    return distribution.reduce((sum, item) => sum + (item.value!), 0)!;
  };

  const chartOptions: ApexCharts.ApexOptions = {
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
      labels: {
        colors: theme.palette.mode === 'dark' ? ['rgb(202,203,206)', 'rgb(202,203,206)', 'rgb(202,203,206)'] : [],
      },
    },
    stroke: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
  };

  const prevention = expectationResultsByTypes?.find((e) => e.type === 'PREVENTION');
  const detection = expectationResultsByTypes?.find((e) => e.type === 'DETECTION');
  const humanResponse = expectationResultsByTypes?.find((e) => e.type === 'HUMAN_RESPONSE');

  const pending = humanResponse?.distribution?.filter((res) => res.label === 'Pending' && (res.value ?? 0) > 0) ?? [];
  const displayHumanValidationBtn = humanValidationLink && (pending.length > 0);

  const Pie = ({ title, expectationResultsByType, icon }: { title: string, expectationResultsByType?: ExpectationResultsByType, icon: React.ReactElement }) => {
    const hasDistribution = expectationResultsByType && expectationResultsByType.distribution && expectationResultsByType.distribution.length > 0;
    return (
      <div className={classes.container}>
        <div className={classes.chartContainer}>
          <Typography variant="h1" className={classes.chartTitle}>{title}</Typography>
          {icon}
          <Chart
            options={{
              ...chartOptions,
              chart: {
                type: 'donut',
                animations: {
                  enabled: hasDistribution,
                },
              },
              tooltip: {
                enabled: hasDistribution,
              },
              labels: hasDistribution
                ? expectationResultsByType.distribution.map((e) => `${t(e.label)} (${(((e.value!) / getTotal(expectationResultsByType.distribution!)) * 100).toFixed(1)}%)`)
                : [t('Unknown Data')],
              colors: hasDistribution ? expectationResultsByType.distribution.map((e) => getColor(e.label)) : ['rgba(202,203,206,0.18)'],
            }}
            series={hasDistribution ? expectationResultsByType.distribution.map((e) => (e.value!)) : [1]}
            type="donut"
            width="100%"
            height="100%"
          />
        </div>
        {expectationResultsByType?.type === 'HUMAN_RESPONSE' && displayHumanValidationBtn
          && <div className={classes.btnContainer}>
            <InfoOutlined color="primary" />
            <Button
              color="primary"
              component={Link}
              to={humanValidationLink}
            >
              {`${pending.length} ${t('validations needed')}`}
            </Button>
          </div>
        }
      </div>
    );
  };

  return (
    <Box margin={1} padding={6}>
      <div className={classes.inline}>
        <Pie title={t('TYPE_PREVENTION')} expectationResultsByType={prevention} icon={<ShieldOutlined className={classes.iconOverlay} />} />
        <Pie title={t('TYPE_DETECTION')} expectationResultsByType={detection} icon={<TrackChangesOutlined className={classes.iconOverlay} />} />
        <Pie title={t('TYPE_HUMAN_RESPONSE')} expectationResultsByType={humanResponse} icon={<SensorOccupiedOutlined className={classes.iconOverlay} />} />
      </div>
    </Box>
  );
};

export default ResponsePie;
