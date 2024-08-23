import React from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../../../../utils/hooks';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import Lessons from '../../../lessons/Lessons';
import { LessonContext, LessonContextType } from '../../../common/Context';
import { fetchLessonsAnswers, fetchLessonsCategories, fetchLessonsQuestions, fetchLessonsTemplates } from '../../../../../actions/Lessons';
import { fetchObjectives } from '../../../../../actions/Objective';
import { fetchScenarioInjects } from '../../../../../actions/Inject';
import { useHelper } from '../../../../../store';
import type { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import type { InjectHelper } from '../../../../../actions/injects/inject-helper';
import type { LessonsTemplatesHelper } from '../../../../../actions/lessons/lesson-helper';
import type { ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import type { TeamsHelper } from '../../../../../actions/teams/team-helper';
import type { UserHelper } from '../../../../../actions/helper';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { fetchPlayers } from '../../../../../actions/User';
import { fetchScenarioTeams } from '../../../../../actions/scenarios/scenario-actions';

const ScenarioLessons = () => {
  const dispatch = useAppDispatch();
  // Fetching data
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };

  const {
    scenario,
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
      scenario: helper.getScenario(scenarioId),
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
    dispatch(fetchObjectives(scenarioId));
    dispatch(fetchScenarioInjects(scenarioId));
    dispatch(fetchScenarioTeams(scenarioId));
  });

  const context: LessonContextType = {};

  return (
    <LessonContext.Provider value={context}>
      <Lessons source={scenario}
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
