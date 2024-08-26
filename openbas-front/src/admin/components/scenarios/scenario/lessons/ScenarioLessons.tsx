import React from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../../../../utils/hooks';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import Lessons from '../../../lessons/Lessons';
import { LessonContext, LessonContextType } from '../../../common/Context';
import { fetchLessonsTemplates } from '../../../../../actions/Lessons';
import { fetchScenarioInjects, fetchScenarioObjectives } from '../../../../../actions/Inject';
import { useHelper } from '../../../../../store';
import type { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import type { InjectHelper } from '../../../../../actions/injects/inject-helper';
import type { LessonsTemplatesHelper } from '../../../../../actions/lessons/lesson-helper';
import type { ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import type { TeamsHelper } from '../../../../../actions/teams/team-helper';
import type { UserHelper } from '../../../../../actions/helper';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { fetchPlayers } from '../../../../../actions/User';
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
  fetchScenarioTeams,
  resetLessonsAnswers,
  sendLessons,
  updateLessonsCategory,
  updateLessonsCategoryTeams,
  updateLessonsQuestion,
  updateScenarioLessons,
} from '../../../../../actions/scenarios/scenario-actions';
import type {
  EvaluationInput,
  LessonsCategoryCreateInput,
  LessonsCategoryTeamsInput,
  LessonsCategoryUpdateInput,
  LessonsQuestionCreateInput,
  LessonsQuestionUpdateInput,
  LessonsSendInput,
  ObjectiveInput,
} from '../../../../../utils/api-types';
import { addScenarioObjective, deleteScenarioObjective, updateScenarioObjective } from '../../../../../actions/Objective';
import { isScenarioReadOnly, isScenarioUpdatable } from '../../../../../utils/Scenario';
import { addScenarioEvaluation, fetchScenarioEvaluations, updateScenarioEvaluation } from '../../../../../actions/Evaluation';

const ScenarioLessons = () => {
  const dispatch = useAppDispatch();
  // Fetching data
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };

  const processToGenericSource = (scenario: ScenarioStore) => {
    return {
      id: scenario.scenario_id,
      type: 'scenario',
      name: scenario.scenario_name,
      score: scenario.scenario_score,
      lessons_answers_number: scenario.scenario_lessons_answers_number,
      communications_number: scenario.scenario_communications_number,
      start_date: scenario.scenario_recurrence_start,
      end_date: scenario.scenario_recurrence_end,
      users_number: scenario.scenario_users_number,
      lessons_anonymized: scenario.scenario_lessons_anonymized,
      isReadOnly: isScenarioReadOnly(scenario, true),
      isUpdatable: isScenarioUpdatable(scenario, true),
    };
  };

  const {
    source,
    objectives,
    injects,
    teamsMap,
    lessonsCategories,
    lessonsQuestions,
    lessonsAnswers,
    lessonsTemplates,
    usersMap,
  } = useHelper((helper: ExercisesHelper & InjectHelper & LessonsTemplatesHelper & ScenariosHelper & TeamsHelper & UserHelper) => {
    return {
      source: processToGenericSource(helper.getScenario(scenarioId)),
      objectives: helper.getScenarioObjectives(scenarioId),
      injects: helper.getScenarioInjects(scenarioId),
      lessonsCategories: helper.getScenarioLessonsCategories(scenarioId),
      lessonsQuestions: helper.getScenarioLessonsQuestions(scenarioId),
      lessonsAnswers: helper.getScenarioLessonsAnswers(scenarioId),
      lessonsTemplates: helper.getLessonsTemplates(),
      teamsMap: helper.getTeamsMap(),
      usersMap: helper.getUsersMap(),
    };
  });
  useDataLoader(() => {
    dispatch(fetchLessonsTemplates());
    dispatch(fetchPlayers());
    dispatch(fetchLessonsCategories(scenarioId));
    dispatch(fetchLessonsQuestions(scenarioId));
    dispatch(fetchLessonsAnswers(scenarioId));
    dispatch(fetchScenarioObjectives(scenarioId));
    dispatch(fetchScenarioInjects(scenarioId));
    dispatch(fetchScenarioTeams(scenarioId));
  });

  const context: LessonContextType = {
    onApplyLessonsTemplate: (data: string) => dispatch(applyLessonsTemplate(scenarioId, data)),
    onResetLessonsAnswers: () => dispatch(resetLessonsAnswers(scenarioId)),
    onEmptyLessonsCategories: () => dispatch(emptyLessonsCategories(scenarioId)),
    onUpdateSourceLessons: (data: boolean) => dispatch(updateScenarioLessons(scenarioId, {
      lessons_anonymized: !data,
    })),
    onSendLessons: (data: LessonsSendInput) => dispatch(sendLessons(scenarioId, data)),
    // Categories
    onAddLessonsCategory: (data: LessonsCategoryCreateInput) => dispatch(addLessonsCategory(scenarioId, data)),
    onDeleteLessonsCategory: (data: string) => dispatch(deleteLessonsCategory(scenarioId, data)),
    onUpdateLessonsCategory: (lessonCategoryId: string, data: LessonsCategoryUpdateInput) => dispatch(updateLessonsCategory(scenarioId, lessonCategoryId, data)),
    onUpdateLessonsCategoryTeams: (lessonCategoryId: string, data: LessonsCategoryTeamsInput) => dispatch(updateLessonsCategoryTeams(scenarioId, lessonCategoryId, data)),
    // Questions
    onDeleteLessonsQuestion: (lessonsCategoryId: string, lessonsQuestionId: string) => dispatch(
      deleteLessonsQuestion(
        scenarioId,
        lessonsCategoryId,
        lessonsQuestionId,
      ),
    ),
    onUpdateLessonsQuestion: (lessonsCategoryId: string, lessonsQuestionId: string, data: LessonsQuestionUpdateInput) => dispatch(
      updateLessonsQuestion(
        scenarioId,
        lessonsCategoryId,
        lessonsQuestionId,
        data,
      ),
    ),
    onAddLessonsQuestion: (lessonsCategoryId: string, data: LessonsQuestionCreateInput) => dispatch(addLessonsQuestion(scenarioId, lessonsCategoryId, data)),
    // Objectives
    onAddObjective: (data: ObjectiveInput) => dispatch(addScenarioObjective(scenarioId, data)),
    onUpdateObjective: (objectiveId: string, data: ObjectiveInput) => dispatch(updateScenarioObjective(scenarioId, objectiveId, data)),
    onDeleteObjective: (objectiveId: string) => dispatch(deleteScenarioObjective(scenarioId, objectiveId)),
    // Evaluation
    onAddEvaluation: (objectiveId: string, data: EvaluationInput) => dispatch(addScenarioEvaluation(scenarioId, objectiveId, data)),
    onUpdateEvaluation: (objectiveId: string, evaluationId: string, data: EvaluationInput) => dispatch(updateScenarioEvaluation(objectiveId, evaluationId, data)),
    onFetchEvaluation: (objectiveId: string) => dispatch(fetchScenarioEvaluations(scenarioId, objectiveId)),
  };

  return (
    <LessonContext.Provider value={context}>
      <Lessons source={source}
        objectives={objectives}
        injects={injects}
        teamsMap={teamsMap}
        lessonsCategories={lessonsCategories}
        lessonsQuestions={lessonsQuestions}
        lessonsAnswers={lessonsAnswers}
        lessonsTemplates={lessonsTemplates}
        usersMap={usersMap}
      ></Lessons>
    </LessonContext.Provider>
  );
};

export default ScenarioLessons;
