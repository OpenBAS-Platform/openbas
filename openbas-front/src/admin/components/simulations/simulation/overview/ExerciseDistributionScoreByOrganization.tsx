import Chart from 'react-apexcharts';
import React, { FunctionComponent } from 'react';
import * as R from 'ramda';
import { useTheme } from '@mui/styles';
import { horizontalBarsChartOptions } from '../../../../../utils/Charts';
import Empty from '../../../../../components/Empty';
import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';
import { useFormatter } from '../../../../../components/i18n';
import type { Theme } from '../../../../../components/Theme';
import { useHelper } from '../../../../../store';
import type { InjectHelper } from '../../../../../actions/injects/inject-helper';
import type { OrganizationHelper, UserHelper } from '../../../../../actions/helper';
import type { InjectExpectationStore } from '../../../../../actions/injects/Inject';
import { computeOrganizationsColors } from './DistributionUtils';
import type { Organization } from '../../../../../utils/api-types';

interface Props {
  exerciseId: ExerciseStore['exercise_id'];
}

const ExerciseDistributionScoreByOrganization: FunctionComponent<Props> = ({
  exerciseId,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme: Theme = useTheme();

  // Fetching data
  const { injectExpectations, organizations, organizationsMap, usersMap } = useHelper((helper: InjectHelper & OrganizationHelper & UserHelper) => ({
    injectExpectations: helper.getExerciseInjectExpectations(exerciseId),
    organizationsMap: helper.getOrganizationsMap(),
    usersMap: helper.getUsersMap(),
    organizations: helper.getOrganizations(),
  }));

  const organizationsTotalScores = R.pipe(
    R.filter(
      (n: InjectExpectationStore) => !R.isEmpty(n.inject_expectation_results)
        && n.inject_expectation_user !== null,
    ),
    R.map((n: InjectExpectationStore) => R.assoc(
      'inject_expectation_user',
      n.inject_expectation_user ? usersMap[n.inject_expectation_user] : {},
      n,
    )),
    R.groupBy(R.path(['inject_expectation_user', 'user_organization'])),
    R.toPairs,
    R.map((n: [string, InjectExpectationStore[]]) => ({
      ...organizationsMap[n[0]],
      organization_total_score: R.sum(
        R.map((o: InjectExpectationStore) => o.inject_expectation_score, n[1]),
      ),
    })),
  )(injectExpectations);

  const sortedOrganizationsByTotalScore = R.pipe(
    R.sortWith([R.descend(R.prop('organization_total_score'))]),
    R.take(10),
  )(organizationsTotalScores);

  const organizationsColors = computeOrganizationsColors(organizations, theme);

  const totalScoreByOrganizationData = [
    {
      name: t('Total score'),
      data: sortedOrganizationsByTotalScore.map((o: Organization & { organization_total_score: number }) => ({
        x: o.organization_name,
        y: o.organization_total_score,
        fillColor: organizationsColors[o.organization_id],
      })),
    },
  ];

  return (
    <>
      {organizationsTotalScores.length > 0 ? (
        <Chart
          options={horizontalBarsChartOptions(theme)}
          series={totalScoreByOrganizationData}
          type="bar"
          width="100%"
          height={50 + organizationsTotalScores.length * 50}
        />
      ) : (
        <Empty
          message={t(
            'No data to display or the simulation has not started yet',
          )}
        />
      )}
    </>
  );
};

export default ExerciseDistributionScoreByOrganization;
