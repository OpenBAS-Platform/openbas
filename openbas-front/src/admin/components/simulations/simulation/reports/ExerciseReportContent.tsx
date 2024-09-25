import React, { useEffect, useState } from 'react';
import { Paper, Typography } from '@mui/material';
import type { Exercise, ExpectationResultsByType, InjectResultDTO, Report, ReportInformation, ReportInjectComment } from '../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useFormatter } from '../../../../../components/i18n';
import ReportInformationType from './ReportInformationType';
import { useHelper } from '../../../../../store';
import type { InjectHelper } from '../../../../../actions/injects/inject-helper';
import type { ReportsHelper } from '../../../../../actions/reports/report-helper';
import type { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import type { TeamsHelper } from '../../../../../actions/teams/team-helper';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { fetchExercise } from '../../../../../actions/Exercise';
import {
  exerciseInjectsResultDTO,
  fetchExerciseExpectationResult,
  fetchLessonsAnswers,
  fetchLessonsCategories,
  fetchLessonsQuestions,
} from '../../../../../actions/exercises/exercise-action';
import Loader from '../../../../../components/Loader';
import ExerciseMainInformation from '../ExerciseMainInformation';
import ResponsePie from '../../../common/injects/ResponsePie';
import InjectReportResult from './InjectReportResult';
import { updateReportInjectCommentForExercise } from '../../../../../actions/reports/report-actions';
import LessonsCategories from '../../../lessons/exercises/LessonsCategories';
import ExerciseDistribution from '../overview/ExerciseDistribution';

interface Props {
  report: Report,
  exerciseId: Exercise['exercise_id'],
  canWrite?: boolean
}

const ExerciseReportContent: React.FC<Props> = ({ report, exerciseId, canWrite = false }) => {
  const dispatch = useAppDispatch();
  const { t } = useFormatter();
  const [loading, setLoading] = useState(true);

  const displayModule = (moduleType: ReportInformationType) => {
    return report?.report_informations?.find((info: ReportInformation) => info.report_informations_type === moduleType)?.report_informations_display;
  };

  // Fetching data
  const {
    exercise,
    lessonsCategories,
    lessonsQuestions,
    lessonsAnswers,
    teams,
    teamsMap,
  } = useHelper(
    (helper: InjectHelper & ReportsHelper & ExercisesHelper & TeamsHelper) => {
      return {
        exercise: helper.getExercise(exerciseId),
        lessonsCategories: helper.getExerciseLessonsCategories(exerciseId),
        lessonsQuestions: helper.getExerciseLessonsQuestions(exerciseId),
        lessonsAnswers: helper.getExerciseLessonsAnswers(exerciseId),
        teamsMap: helper.getTeamsMap(),
        teams: helper.getExerciseTeams(exerciseId),
      };
    },
  );

  useDataLoader(() => {
    const fetchPromises = [];
    setLoading(true);
    if (displayModule(ReportInformationType.MAIN_INFORMATION)) {
      fetchPromises.push(
        dispatch(fetchExercise(exerciseId)),
      );
    }
    if (displayModule(ReportInformationType.PLAYER_SURVEYS)) {
      fetchPromises.push(
        dispatch(fetchLessonsQuestions(exerciseId)),
        dispatch(fetchLessonsAnswers(exerciseId)),
        dispatch(fetchLessonsCategories(exerciseId)),
      );
    }
    Promise.all(fetchPromises).then(() => setLoading(false));
  }, [report]);

  const [exerciseExpectationResults, setResults] = useState<ExpectationResultsByType[] | null>(null);
  const [injects, setInjects] = useState<InjectResultDTO[]>([]);
  useEffect(() => {
    if (displayModule(ReportInformationType.SCORE_DETAILS)) {
      fetchExerciseExpectationResult(exerciseId).then((result: {
        data: ExpectationResultsByType[]
      }) => setResults(result.data));
    }
    if (displayModule(ReportInformationType.INJECT_RESULT)) {
      exerciseInjectsResultDTO(exerciseId).then((result: { data: InjectResultDTO[] }) => {
        setInjects(result.data);
      });
    }
  }, [report]);

  if (loading) {
    return <Loader/>;
  }

  return (
    <div id={`reportId_${report.report_id}`} style={{ padding: 20, width: '100%', display: 'flex', flexFlow: 'wrap' }}>
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
      {displayModule(ReportInformationType.INJECT_RESULT)
        && (
          <InjectReportResult
            canEditComment={canWrite}
            initialInjectComments={report?.report_injects_comments}
            injects={injects}
            style={{ width: '100%', marginTop: 20 }}
            onCommentSubmit={(value: ReportInjectComment) => updateReportInjectCommentForExercise(exerciseId, report.report_id, value)}
          />
        )
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
  );
};

export default ExerciseReportContent;
