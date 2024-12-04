import { useTheme } from '@mui/styles';
import { FunctionComponent, useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

import { fetchScenarioStatistic } from '../../../../actions/scenarios/scenario-actions';
import Empty from '../../../../components/Empty';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import type { Theme } from '../../../../components/Theme';
import { GlobalScoreBySimulationEndDate, ScenarioStatistic } from '../../../../utils/api-types';
import { verticalBarsChartOptions } from '../../../../utils/Charts';

interface Props {
  scenarioId: string;
}

function generateFakeDataFromDates(dates: string[], percentage: number): GlobalScoreBySimulationEndDate[] {
  return dates.map(date => ({
    simulation_end_date: date,
    global_score_success_percentage: percentage,
  }));
}

const generateFakeData = (): Record<string, GlobalScoreBySimulationEndDate[]> => {
  const now = new Date();
  const dates = Array.from({ length: 5 }, (_, i) => {
    const newDate = new Date(now);
    newDate.setHours(now.getHours() + i + 1);
    return newDate.toISOString();
  });
  const prevention = { PREVENTION: generateFakeDataFromDates(dates, 0.69) };
  const detection = { DETECTION: generateFakeDataFromDates(dates, 0.84) };
  const humanResponse = { HUMAN_RESPONSE: generateFakeDataFromDates(dates, 0.46) };
  return ({
    ...prevention,
    ...detection,
    ...humanResponse,
  });
};

function generateSeriesData(globalScores: GlobalScoreBySimulationEndDate[]) {
  return globalScores.map((globalScore, index) => ({
    x: `${index}|${globalScore.simulation_end_date}`,
    y: globalScore.global_score_success_percentage,
  }));
}

const ScenarioDistributionByExercise: FunctionComponent<Props> = ({
  scenarioId,
}) => {
  // Standard hooks
  const { t, fsd } = useFormatter();
  const theme: Theme = useTheme();

  const [loadingScenarioStatistics, setLoadingScenarioStatistics] = useState(true);
  const [statistic, setStatistic] = useState<ScenarioStatistic>();
  const fetchStatistics = () => {
    setLoadingScenarioStatistics(true);
    fetchScenarioStatistic(scenarioId).then((result: { data: ScenarioStatistic }) => setStatistic(result.data)).finally(() => setLoadingScenarioStatistics(false));
  };
  useEffect(() => {
    fetchStatistics();
  }, []);

  const preventionData = statistic?.simulations_results_latest.global_scores_by_expectation_type['PREVENTION'];
  const globalScoresByExpectationType = preventionData && preventionData.length > 0 ? statistic?.simulations_results_latest.global_scores_by_expectation_type : generateFakeData();
  const isStatisticsDataEmpty = preventionData && preventionData.length === 0;

  const series = [
    {
      name: t('Prevention'),
      data: generateSeriesData(globalScoresByExpectationType['PREVENTION']),
    },
    {
      name: t('Detection'),
      data: generateSeriesData(globalScoresByExpectationType['DETECTION']),
    },
    {
      name: t('Human Response'),
      data: generateSeriesData(globalScoresByExpectationType['HUMAN_RESPONSE']),
    },
  ];

  return (
    <>
      {loadingScenarioStatistics && (<Loader variant="inElement" />)}
      {(!loadingScenarioStatistics && series[0].data.length > 0) && (
        <Chart
          options={verticalBarsChartOptions(
            theme,
            (rawData: string) => {
              if (!rawData) {
                return rawData;
              }
              const splitRawData = rawData.split('|');
              return splitRawData.length > 0 ? fsd(splitRawData[1]) : rawData;
            },
            (value: number) => `${value * 100}%`,
            false,
            false,
            false,
            true,
            'dataPoints',
            true,
            isStatisticsDataEmpty,
            1,
            t('No data to display'),
          )}
          series={series}
          type="bar"
          width="100%"
          height={300}
        />
      )}
      {(!loadingScenarioStatistics && series[0].data.length === 0) && (
        <Empty
          message={t(
            'No data to display',
          )}
        />
      )}
    </>
  );
};
export default ScenarioDistributionByExercise;
