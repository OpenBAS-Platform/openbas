import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryParameter } from '../../../utils/Environment';
import LessonsPreview from './LessonsPreview';
import { useHelper } from '../../../store';
import { fetchMe } from '../../../actions/Application';
import { ViewLessonContext, ViewLessonContextType } from '../../../admin/components/common/Context';
import { useAppDispatch } from '../../../utils/hooks';
import type { ScenarioStore } from '../../../actions/scenarios/Scenario';
import type { UserHelper } from '../../../actions/helper';
import type { ScenariosHelper } from '../../../actions/scenarios/scenario-helper';
import {
  addLessonsAnswers,
  fetchLessonsAnswers,
  fetchLessonsCategories,
  fetchLessonsQuestions,
  fetchPlayerLessonsAnswers,
  fetchScenario,
} from '../../../actions/scenarios/scenario-actions';
import useScenarioPermissions from '../../../utils/Scenario';

const ScenarioViewLessons = () => {
  const dispatch = useAppDispatch();
  const [preview] = useQueryParameter(['preview']);
  const [userId] = useQueryParameter(['user']);
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };

  const processToGenericSource = (scenario: ScenarioStore | undefined) => {
    if (!scenario) return undefined;
    return {
      id: scenarioId,
      type: 'scenario',
      name: scenario.scenario_name,
      subtitle: scenario.scenario_subtitle,
      userId,
    };
  };

  const {
    me,
    scenario,
    source,
    lessonsCategories,
    lessonsQuestions,
    lessonsAnswers,
  } = useHelper((helper: ScenariosHelper & UserHelper) => {
    const currentUser = helper.getMe();
    const scenarioData = helper.getScenario(scenarioId);
    return {
      me: currentUser,
      scenario: scenarioData,
      source: processToGenericSource(scenarioData),
      lessonsCategories: helper.getScenarioLessonsCategories(scenarioId),
      lessonsQuestions: helper.getScenarioLessonsQuestions(scenarioId),
      lessonsAnswers: helper.getScenarioUserLessonsAnswers(
        scenarioId,
        userId && userId !== 'null' ? userId : currentUser?.user_id,
      ),
    };
  });

  const finalUserId = userId && userId !== 'null' ? userId : me?.user_id;

  useEffect(() => {
    dispatch(fetchMe());
    dispatch(fetchScenario(scenarioId));
    dispatch(fetchLessonsCategories(scenarioId));
    dispatch(fetchLessonsQuestions(scenarioId));
    dispatch(fetchLessonsAnswers(scenarioId));
  }, [dispatch, scenarioId, userId, finalUserId]);

  // Pass the full scenario because the scenario is never loaded in the store at this point
  const permissions = useScenarioPermissions(scenarioId, scenario);

  const context: ViewLessonContextType = {
    onAddLessonsAnswers: (questionCategory, lessonsQuestionId, answerData) => dispatch(
      addLessonsAnswers(
        scenarioId,
        questionCategory,
        lessonsQuestionId,
        answerData,
        finalUserId,
      ),
    ),
    onFetchPlayerLessonsAnswers: () => dispatch(fetchPlayerLessonsAnswers(scenarioId, finalUserId)),
  };

  return (
    <ViewLessonContext.Provider value={context}>
      {preview === 'true' && (
        <LessonsPreview
          source={{ ...source, finalUserId }}
          lessonsCategories={lessonsCategories}
          lessonsQuestions={lessonsQuestions}
          lessonsAnswers={lessonsAnswers}
          permissions={permissions}
        />
      )}
    </ViewLessonContext.Provider>
  );
};

export default ScenarioViewLessons;