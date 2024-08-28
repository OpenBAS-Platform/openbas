import React from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { LessonContext, LessonContextType } from '../../../common/Context';
import type {
  EvaluationInput,
  Exercise,
  LessonsCategoryCreateInput,
  LessonsCategoryTeamsInput,
  LessonsCategoryUpdateInput,
  LessonsQuestionCreateInput,
  LessonsQuestionUpdateInput,
  LessonsSendInput,
  ObjectiveInput,
} from '../../../../../utils/api-types';
import type { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import type { InjectHelper } from '../../../../../actions/injects/inject-helper';
import type { LessonsTemplatesHelper } from '../../../../../actions/lessons/lesson-helper';
import type { ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import type { TeamsHelper } from '../../../../../actions/teams/team-helper';
import type { UserHelper } from '../../../../../actions/helper';
import { fetchLessonsTemplates } from '../../../../../actions/Lessons';
import { fetchPlayers } from '../../../../../actions/User';
import { fetchExerciseInjects } from '../../../../../actions/Inject';
import { fetchExerciseTeams, updateExerciseLessons } from '../../../../../actions/Exercise';
import Lessons from '../../../lessons/exercises/Lessons';
import {
  addLessonsCategory,
  addLessonsQuestion,
  applyLessonsTemplate,
  deleteLessonsCategory,
  deleteLessonsQuestion,
  emptyLessonsCategories,
  fetchLessonsAnswers,
  fetchLessonsCategories,
  fetchLessonsQuestions,
  resetLessonsAnswers,
  sendLessons,
  updateLessonsCategory,
  updateLessonsCategoryTeams,
  updateLessonsQuestion,
} from '../../../../../actions/exercises/exercise-action';
import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';
import { usePermissions } from '../../../../../utils/Exercise';
import { addExerciseObjective, deleteExerciseObjective, fetchExerciseObjectives, updateExerciseObjective } from '../../../../../actions/Objective';
import { addExerciseEvaluation, fetchExerciseEvaluations, updateExerciseEvaluation } from '../../../../../actions/Evaluation';
import { fetchTeams } from '../../../../../actions/teams/team-actions';

const ExerciseLessons = () => {
  const dispatch = useAppDispatch();
  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };

  const processToGenericSource = (exercise: ExerciseStore) => {
    return {
      id: exercise.exercise_id,
      type: 'exercise',
      name: exercise.exercise_name,
      score: exercise.exercise_score,
      lessons_answers_number: exercise.exercise_lessons_answers_number,
      communications_number: exercise.exercise_communications_number,
      start_date: exercise.exercise_start_date,
      end_date: exercise.exercise_end_date,
      users_number: exercise.exercise_users_number,
      logs_number: exercise.exercise_logs_number,
      lessons_anonymized: exercise.exercise_lessons_anonymized,
    };
  };

  const {
    exercise,
    source,
    objectives,
    injects,
    teams,
    teamsMap,
    lessonsCategories,
    lessonsQuestions,
    lessonsAnswers,
    lessonsTemplates,
    usersMap,
  } = useHelper((helper: ExercisesHelper & InjectHelper & LessonsTemplatesHelper & ScenariosHelper & TeamsHelper & UserHelper) => {
    const exerciseData = helper.getExercise(exerciseId);
    return {
      exercise: exerciseData,
      source: processToGenericSource(exerciseData),
      objectives: helper.getExerciseObjectives(exerciseId),
      injects: helper.getExerciseInjects(exerciseId),
      lessonsCategories: helper.getExerciseLessonsCategories(exerciseId),
      lessonsQuestions: helper.getExerciseLessonsQuestions(exerciseId),
      lessonsAnswers: helper.getExerciseLessonsAnswers(exerciseId),
      lessonsTemplates: helper.getLessonsTemplates(),
      teamsMap: helper.getTeamsMap(),
      teams: helper.getExerciseTeams(exerciseId),
      usersMap: helper.getUsersMap(),
    };
  });
  useDataLoader(() => {
    dispatch(fetchLessonsTemplates());
    dispatch(fetchPlayers());
    dispatch(fetchTeams());
    dispatch(fetchLessonsCategories(exerciseId));
    dispatch(fetchLessonsQuestions(exerciseId));
    dispatch(fetchLessonsAnswers(exerciseId));
    dispatch(fetchExerciseObjectives(exerciseId));
    dispatch(fetchExerciseInjects(exerciseId));
    dispatch(fetchExerciseTeams(exerciseId));
  });
  const permissions = usePermissions(exerciseId, exercise);

  const context: LessonContextType = {
    onApplyLessonsTemplate: (data: string) => dispatch(applyLessonsTemplate(exerciseId, data)),
    onResetLessonsAnswers: () => dispatch(resetLessonsAnswers(exerciseId)),
    onEmptyLessonsCategories: () => dispatch(emptyLessonsCategories(exerciseId)),
    onUpdateSourceLessons: (data: boolean) => dispatch(updateExerciseLessons(exerciseId, {
      lessons_anonymized: data,
    })),
    onSendLessons: (data: LessonsSendInput) => dispatch(sendLessons(exerciseId, data)),
    // Categories
    onAddLessonsCategory: (data: LessonsCategoryCreateInput) => dispatch(addLessonsCategory(exerciseId, data)),
    onDeleteLessonsCategory: (data: string) => dispatch(deleteLessonsCategory(exerciseId, data)),
    onUpdateLessonsCategory: (lessonCategoryId: string, data: LessonsCategoryUpdateInput) => dispatch(updateLessonsCategory(exerciseId, lessonCategoryId, data)),
    onUpdateLessonsCategoryTeams: (lessonCategoryId: string, data: LessonsCategoryTeamsInput) => dispatch(updateLessonsCategoryTeams(exerciseId, lessonCategoryId, data)),
    // Questions
    onDeleteLessonsQuestion: (lessonsCategoryId: string, lessonsQuestionId: string) => dispatch(
      deleteLessonsQuestion(
        exerciseId,
        lessonsCategoryId,
        lessonsQuestionId,
      ),
    ),
    onUpdateLessonsQuestion: (lessonsCategoryId: string, lessonsQuestionId: string, data: LessonsQuestionUpdateInput) => dispatch(
      updateLessonsQuestion(
        exerciseId,
        lessonsCategoryId,
        lessonsQuestionId,
        data,
      ),
    ),
    onAddLessonsQuestion: (lessonsCategoryId: string, data: LessonsQuestionCreateInput) => dispatch(
      addLessonsQuestion(exerciseId, lessonsCategoryId, data),
    ),
    // Objectives
    onAddObjective: (data: ObjectiveInput) => dispatch(addExerciseObjective(exerciseId, data)),
    onUpdateObjective: (objectiveId: string, data: ObjectiveInput) => dispatch(updateExerciseObjective(exerciseId, objectiveId, data)),
    onDeleteObjective: (objectiveId: string) => dispatch(deleteExerciseObjective(exerciseId, objectiveId)),
    // Evaluation
    onAddEvaluation: (objectiveId: string, data: EvaluationInput) => dispatch(addExerciseEvaluation(exerciseId, objectiveId, data)),
    onUpdateEvaluation: (objectiveId: string, evaluationId: string, data: EvaluationInput) => dispatch(updateExerciseEvaluation(objectiveId, evaluationId, data)),
    onFetchEvaluation: (objectiveId: string) => dispatch(fetchExerciseEvaluations(exerciseId, objectiveId)),
  };

  return (
    <LessonContext.Provider value={context}>
      <Lessons source={{ ...source, isReadOnly: permissions.readOnly, isUpdatable: permissions.canWrite }}
        objectives={objectives}
        injects={injects}
        teamsMap={teamsMap}
        teams={teams}
        lessonsCategories={lessonsCategories}
        lessonsQuestions={lessonsQuestions}
        lessonsAnswers={lessonsAnswers}
        lessonsTemplates={lessonsTemplates}
        usersMap={usersMap}
      ></Lessons>
    </LessonContext.Provider>
  );
};

export default ExerciseLessons;
