import { BugReportOutlined, InfoOutlined, SensorOccupiedOutlined, ShieldOutlined, TrackChangesOutlined } from '@mui/icons-material';
import { Button, type Theme } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { type FunctionComponent, memo, useCallback, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Link } from 'react-router';

import { useFormatter } from '../../../../components/i18n';
import { type ExpectationResultsByType, type ResultDistribution } from '../../../../utils/api-types';
import { donutChartOptions } from '../../../../utils/Charts';
import { sortOrder } from './expectations/Expectation';

interface Props {
  expectationResultsByTypes?: ExpectationResultsByType[] | null;
  humanValidationLink?: string;
  disableChartAnimation?: boolean;
  hasTitles?: boolean;
  forceSize?: number;
}

const getTotal = (distribution: ResultDistribution[]) => {
  return distribution.reduce((sum, item) => sum + (item.value!), 0)!;
};
const getColor = (theme: Theme, result: string | undefined): string => {
  const colorMap: Record<string, string> = {
    'Blocked': theme.palette.success.main ?? '',
    'Detected': theme.palette.success.main ?? '',
    'Not vulnerable': theme.palette.success.main ?? '',
    'Successful': theme.palette.success.main ?? '',
    'Partial': theme.palette.warning.main ?? '',
    'Partially Prevented': theme.palette.warning.main ?? '',
    'Partially Detected': theme.palette.warning.main ?? '',
    'Pending': theme.palette.grey?.['500'] ?? '',
  };
  return colorMap[result ?? ''] ?? theme.palette.error.main ?? '';
};

const ResponsePie: FunctionComponent<Props> = ({
  expectationResultsByTypes,
  humanValidationLink,
  disableChartAnimation,
  forceSize,
  hasTitles = true,
}) => {
  const { t } = useFormatter();
  const theme = useTheme();

  const iconOverlay = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: forceSize ? forceSize * 0.3 : 35,
  };

  const definedTypes = Array.from(new Set(expectationResultsByTypes?.map(r => r?.type).filter(Boolean)));

  const expectationResultsMap = useMemo(() => {
    const result = expectationResultsByTypes || [];
    return result.reduce((acc, curr) => {
      acc[curr.type] = curr;
      return acc;
    }, {} as Record<string, ExpectationResultsByType>);
  }, [expectationResultsByTypes]);

  const expectationLabels: Record<string, string> = {
    PREVENTION: t('TYPE_PREVENTION'),
    DETECTION: t('TYPE_DETECTION'),
    VULNERABILITY: t('TYPE_VULNERABILITY'),
    HUMAN_RESPONSE: t('TYPE_HUMAN_RESPONSE'),
  };

  const humanResponse = expectationResultsMap['HUMAN_RESPONSE'];
  const pending = useMemo(() => humanResponse?.distribution?.filter(res => res.label === 'Pending' && (res.value ?? 0) > 0) ?? [], [humanResponse]);
  const displayHumanValidationBtn = humanValidationLink && (pending.length > 0);
  const renderIcon = (type: string, hasDistribution: boolean | undefined) => {
    switch (type) {
      case 'prevention':
        return <ShieldOutlined color={hasDistribution ? 'inherit' : 'disabled'} sx={iconOverlay} />;
      case 'detection':
        return <TrackChangesOutlined color={hasDistribution ? 'inherit' : 'disabled'} sx={iconOverlay} />;
      case 'vulnerability':
        return <BugReportOutlined color={hasDistribution ? 'inherit' : 'disabled'} sx={iconOverlay} />;
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
        position: 'relative',
        width: '100%',
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
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
          height={forceSize ? forceSize : 120}
          width={forceSize ? forceSize : '100%'}
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
    <div
      id="score_details"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${definedTypes.length}, minmax(25%, 1fr))`,
        width: '100%',
      }}
    >
      {definedTypes.sort((a, b) => {
        const typeAIndex = sortOrder.indexOf(a);
        const typeBIndex = sortOrder.indexOf(b);
        return typeAIndex - typeBIndex;
      }).map(type => (
        <Pie
          key={type}
          type={type.toLowerCase()}
          title={expectationLabels[type]}
          expectationResultsByType={expectationResultsMap[type]}
        />
      ))}

      {hasTitles
        && definedTypes.map(type => (
          <React.Fragment key={`${type}_title`}>
            {pieTitle(expectationLabels[type])}
          </React.Fragment>
        ))}

      {displayHumanValidationBtn && (
        <Button
          startIcon={<InfoOutlined />}
          color="primary"
          component={Link}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${definedTypes.length}, minmax(25%, 1fr))`,
            textAlign: 'center',
            fontSize: 'clamp(0.75rem, 0.5vw, 1rem)',
          }}
          to={humanValidationLink}
        >
          {`${pending.length} ${t('validations needed')}`}
        </Button>
      )}
    </div>
  );
};

export default memo(ResponsePie);
