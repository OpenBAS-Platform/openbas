import React from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { LessonContext, LessonContextType } from '../../../common/Context';
import type { Exercise } from '../../../../../utils/api-types';
import type { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import type { InjectHelper } from '../../../../../actions/injects/inject-helper';
import type { LessonsTemplatesHelper } from '../../../../../actions/lessons/lesson-helper';
import type { ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import type { TeamsHelper } from '../../../../../actions/teams/team-helper';
import type { UserHelper } from '../../../../../actions/helper';
import { fetchLessonsAnswers, fetchLessonsCategories, fetchLessonsQuestions, fetchLessonsTemplates } from '../../../../../actions/Lessons';
import { fetchPlayers } from '../../../../../actions/User';
import { fetchObjectives } from '../../../../../actions/Objective';
import { fetchExerciseInjects } from '../../../../../actions/Inject';
import { fetchExerciseTeams } from '../../../../../actions/Exercise';
import Lessons from '../../../lessons/Lessons';

const ExerciseLessons = () => {
  const dispatch = useAppDispatch();
  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };

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
      exercise: helper.getExercise(exerciseId),
      objectives: helper.getExerciseObjectives(exerciseId),
      injects: helper.getExerciseInjects(exerciseId),
      lessonsCategories: helper.getExerciseLessonsCategories(exerciseId),
      lessonsQuestions: helper.getExerciseLessonsQuestions(exerciseId),
      lessonsAnswers: helper.getExerciseLessonsAnswers(exerciseId),
      lessonsTemplates: helper.getLessonsTemplates(),
      teamsMap: helper.getTeamsMap(),
      usersMap: helper.getUsersMap(),
    };
  });
  useDataLoader(() => {
    dispatch(fetchLessonsTemplates());
    dispatch(fetchPlayers());
    dispatch(fetchLessonsCategories(exerciseId));
    dispatch(fetchLessonsQuestions(exerciseId));
    dispatch(fetchLessonsAnswers(exerciseId));
    dispatch(fetchObjectives(exerciseId));
    dispatch(fetchExerciseInjects(exerciseId));
    dispatch(fetchExerciseTeams(exerciseId));
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

export default ExerciseLessons;
