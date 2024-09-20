import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Button, Paper, ToggleButtonGroup, Typography } from '@mui/material';

import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { useHelper } from '../../../../../store';
import { fetchReport, updateReportForExercise } from '../../../../../actions/reports/report-actions';
import type { ReportsHelper } from '../../../../../actions/reports/report-helper';
import type { Exercise, ExpectationResultsByType, Report, ReportInformation, ReportInput } from '../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../utils/hooks';
import Loader from '../../../../../components/Loader';
import { useFormatter } from '../../../../../components/i18n';
import ExportButtons from '../../../../../components/ExportButtons';
import ResponsePie from '../../../common/injects/ResponsePie';
import type { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import { fetchExerciseExpectationResult, fetchLessonsAnswers, fetchLessonsCategories, fetchLessonsQuestions } from '../../../../../actions/exercises/exercise-action';
import ExerciseDistribution from '../overview/ExerciseDistribution';
import LessonsCategories from '../../../lessons/exercises/LessonsCategories';
import type { TeamsHelper } from '../../../../../actions/teams/team-helper';
import ExerciseMainInformation from '../ExerciseMainInformation';
import { fetchExercise } from '../../../../../actions/Exercise';
import ReportInformationType from './ReportInformationType';
import ReportPopover from '../../../components/reports/ReportPopover';
import { ReportContextType, ReportContext } from '../../../common/Context';
import ExerciseReportForm from './ExerciseReportForm';
import { usePermissions } from '../../../../../utils/Exercise';
import { isFeatureEnabled } from '../../../../../utils/utils';

const ExerciseReport: React.FC = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const { t } = useFormatter();
  const [loading, setLoading] = useState(true);

  const { exerciseId, reportId } = useParams() as { exerciseId: Exercise['exercise_id'], reportId: Report['report_id'] };
  const permissions = usePermissions(exerciseId);

  // Fetching data
  const {
    report,
    exercise,
    lessonsCategories,
    lessonsQuestions,
    lessonsAnswers,
    teams,
    teamsMap,
  } = useHelper(
    (helper: ReportsHelper & ExercisesHelper & TeamsHelper) => {
      return {
        exercise: helper.getExercise(exerciseId),
        report: helper.getReport(reportId),
        lessonsCategories: helper.getExerciseLessonsCategories(exerciseId),
        lessonsQuestions: helper.getExerciseLessonsQuestions(exerciseId),
        lessonsAnswers: helper.getExerciseLessonsAnswers(exerciseId),
        teamsMap: helper.getTeamsMap(),
        teams: helper.getExerciseTeams(exerciseId),
      };
    },
  );
  useDataLoader(() => {
    setLoading(true);
    const fetchPromises = [
      dispatch(fetchReport(reportId)),
      dispatch(fetchExercise(exerciseId)),
      dispatch(fetchLessonsCategories(exerciseId)),
      dispatch(fetchLessonsQuestions(exerciseId)),
      dispatch(fetchLessonsAnswers(exerciseId)),
    ];
    Promise.all(fetchPromises)
      .finally(() => {
        setLoading(false);
      });
  });

  const [exerciseExpectationResults, setResults] = useState<ExpectationResultsByType[] | null>(null);
  useEffect(() => {
    fetchExerciseExpectationResult(exerciseId).then((result: {
      data: ExpectationResultsByType[]
    }) => setResults(result.data));
  }, [exerciseId]);

  // Context
  const context: ReportContextType = {
    onUpdateReport: (_reportId: Report['report_id'], data: ReportInput) => dispatch(updateReportForExercise(exerciseId, reportId, data)),
    renderReportForm: (onSubmitForm, onHandleCancel, _report) => {
      return (
        <ExerciseReportForm
          onSubmit={onSubmitForm}
          handleCancel={onHandleCancel}
          initialValues={report}
          editing
        />
      );
    },
  } as ReportContextType;

  const displayModule = (moduleType: ReportInformationType) => {
    return report.report_informations?.find((info: ReportInformation) => info.report_informations_type === moduleType)?.report_informations_display;
  };

  if (!isFeatureEnabled('report')) {
    return <div>{t('This page is coming soon')}</div>;
  }

  if (loading) {
    return <Loader/>;
  }

  return (
    <ReportContext.Provider value={context}>
      <div style={{ marginTop: 20, display: 'flex', flexFlow: 'wrap' }}>
        <Button
          style={{ marginLeft: 20 }}
          color="primary"
          variant="outlined"
          component={Link}
          to={`/admin/exercises/${exerciseId}`}
        >
          {t('Back to administration')}
        </Button>

        <ToggleButtonGroup style={{ marginLeft: 'auto', marginRight: 20 }}>
          <ExportButtons
            domElementId={`reportId_${reportId}`}
            name={report?.report_name}
            pixelRatio={2}
          />
          {permissions.canWrite && <ReportPopover variant={'toggle'} report={report} actions={['Update']}/>}
        </ToggleButtonGroup>

        <div id={`reportId_${reportId}`} style={{ padding: 20, width: '100%', display: 'flex', flexFlow: 'wrap' }}>
          <div style={{ width: '100%', textAlign: 'center', fontSize: 25, fontWeight: 500, margin: '10px' }}>
            {report?.report_name}
          </div>
          {displayModule(ReportInformationType.MAIN_INFORMATION)
            && <div style={{ width: '50%', paddingRight: '25px' }}>
              <Typography variant="h4" gutterBottom>
                {t('General information')}
              </Typography>
              <ExerciseMainInformation exercise={exercise}/>
            </div>
          }
          {displayModule(ReportInformationType.SCORE_DETAILS)
            && <div style={{ width: '50%', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
              <Typography variant="h4" gutterBottom>
                {t('Results')}
              </Typography>
              <Paper variant="outlined" style={{ display: 'flex', alignItems: 'center' }}>
                <ResponsePie expectationResultsByTypes={exerciseExpectationResults}/>
              </Paper>
            </div>
          }
          {displayModule(ReportInformationType.PLAYER_SURVEYS)
            && <LessonsCategories
              style={{ width: '100%', marginBottom: '60px' }}
              lessonsCategories={lessonsCategories}
              lessonsAnswers={lessonsAnswers}
              lessonsQuestions={lessonsQuestions}
              teamsMap={teamsMap}
              teams={teams}
              isReport
               />
          }
          {displayModule(ReportInformationType.EXERCISE_DETAILS)
            && <ExerciseDistribution exerciseId={exerciseId} isReport/>
          }
        </div>
      </div>
    </ReportContext.Provider>
  );
};

export default ExerciseReport;
