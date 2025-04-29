import { InfoOutlined, SensorOccupiedOutlined, ShieldOutlined, TrackChangesOutlined } from '@mui/icons-material';
import { Button, type Theme } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useCallback, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Link } from 'react-router';

import { useFormatter } from '../../../../components/i18n';
import { type ExpectationResultsByType, type ResultDistribution } from '../../../../utils/api-types';
import { donutChartOptions } from '../../../../utils/Charts';

interface Props {
  expectationResultsByTypes?: ExpectationResultsByType[] | null;
  humanValidationLink?: string;
  disableChartAnimation?: boolean;
  isReducedView?: boolean;
}

const getTotal = (distribution: ResultDistribution[]) => {
  return distribution.reduce((sum, item) => sum + (item.value!), 0)!;
};
const getColor = (theme: Theme, result: string | undefined): string => {
  const colorMap: Record<string, string> = {
    'Blocked': theme.palette.success.main ?? '',
    'Detected': theme.palette.success.main ?? '',
    'Successful': theme.palette.success.main ?? '',
    'Partial': theme.palette.warning.main ?? '',
    'Partially Prevented': theme.palette.warning.main ?? '',
    'Partially Detected': theme.palette.warning.main ?? '',
    'Pending': theme.palette.grey?.['500'] ?? '',
  };
  return colorMap[result ?? ''] ?? theme.palette.error.main ?? '';
};

const iconOverlay = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: 35,
};

const ResponsePie: FunctionComponent<Props> = ({
  expectationResultsByTypes,
  humanValidationLink,
  disableChartAnimation,
  isReducedView = false,
}) => {
  const { t } = useFormatter();
  const theme = useTheme();

  const prevention = expectationResultsByTypes?.find(e => e.type === 'PREVENTION');
  const detection = expectationResultsByTypes?.find(e => e.type === 'DETECTION');
  const humanResponse = expectationResultsByTypes?.find(e => e.type === 'HUMAN_RESPONSE');
  const pending = useMemo(() => humanResponse?.distribution?.filter(res => res.label === 'Pending' && (res.value ?? 0) > 0) ?? [], [humanResponse]);
  const displayHumanValidationBtn = humanValidationLink && (pending.length > 0);
  const renderIcon = (type: string, hasDistribution: boolean | undefined) => {
    switch (type) {
      case 'prevention':
        return <ShieldOutlined color={hasDistribution ? 'inherit' : 'disabled'} sx={iconOverlay} />;
      case 'detection':
        return <TrackChangesOutlined color={hasDistribution ? 'inherit' : 'disabled'} sx={iconOverlay} />;
      default:
        return <SensorOccupiedOutlined color={hasDistribution ? 'inherit' : 'disabled'} sx={iconOverlay} />;
    }
  };

  const Pie = useCallback(({ title, expectationResultsByType, type }: {
    title: string;
    expectationResultsByType?: ExpectationResultsByType;
    type: string;
  }) => {
    const hasDistribution = expectationResultsByType && expectationResultsByType.distribution && expectationResultsByType.distribution.length > 0;
    const labels = hasDistribution
      ? expectationResultsByType.distribution.map(e => `${t(e.label)} (${(((e.value!) / getTotal(expectationResultsByType.distribution!)) * 100).toFixed(1)}%)`)
      : [`${t('No expectation for')} ${title}`];
    const colors = hasDistribution ? expectationResultsByType.distribution.map(e => getColor(theme, e.label)) : ['rgba(202, 203, 206, 0.18)'];
    const data = useMemo(() => (hasDistribution ? expectationResultsByType.distribution.map(e => e.value) : [1]), [expectationResultsByType]);

    return (
      <div style={{
        width: '100%',
        position: 'relative',
      }}
      >
        {renderIcon(type, hasDistribution)}
        <Chart
          options={
            donutChartOptions({
              theme,
              labels,
              chartColors: colors,
              displayLegend: false,
              displayLabels: hasDistribution,
              displayValue: hasDistribution,
              displayTooltip: hasDistribution,
              isFakeData: !hasDistribution,
              disableAnimation: disableChartAnimation,
            })
          }
          series={data}
          type="donut"
          width="100%"
          height="auto"
        />
      </div>
    );
  }, [theme, displayHumanValidationBtn, humanValidationLink, pending]);

  const pieTitle = (title: string, expectationResultsByType?: ExpectationResultsByType) => {
    const hasDistribution = expectationResultsByType?.distribution && expectationResultsByType?.distribution.length > 0;
    return (
      <span
        style={{
          ...(!hasDistribution ? { color: theme.palette.text?.disabled } : {}),
          fontWeight: 300,
          textAlign: 'center',
        }}
      >
        {title}
      </span>
    );
  };

  return (
    <div style={{
      display: 'grid',
      width: isReducedView ? '70%' : '100%',
      gridTemplateColumns: '33% 33% 33%',
    }}
    >
      <Pie type="prevention" title={t('TYPE_PREVENTION')} expectationResultsByType={prevention} />
      <Pie type="detection" title={t('TYPE_DETECTION')} expectationResultsByType={detection} />
      <Pie type="human_response" title={t('TYPE_HUMAN_RESPONSE')} expectationResultsByType={humanResponse} />

      {pieTitle(t('TYPE_PREVENTION'), prevention)}
      {pieTitle(t('TYPE_DETECTION'), detection)}
      {pieTitle(t('TYPE_HUMAN_RESPONSE'), humanResponse)}

      { displayHumanValidationBtn && (
        <Button
          startIcon={<InfoOutlined />}
          color="primary"
          component={Link}
          style={{ gridColumnStart: 3 }}
          to={humanValidationLink}
        >
          {`${pending.length} ${t('validations needed')}`}
        </Button>
      )}
    </div>
  );
};

export default ResponsePie;
