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
import { fetchLessonsCategories, fetchLessonsQuestions, fetchScenario } from '../../../actions/scenarios/scenario-actions';
import useScenarioPermissions from '../../../utils/Scenario';

const ScenarioViewLessons = () => {
  const dispatch = useAppDispatch();
  const [preview] = useQueryParameter(['preview']);
  const [userId] = useQueryParameter(['user']);
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };
  const isPreview = preview === 'true';

  const processToGenericSource = (scenario: ScenarioStore | undefined) => {
    if (!scenario) return undefined;
    return {
      id: scenarioId,
      type: 'scenario',
      name: scenario.scenario_name,
      subtitle: scenario.scenario_subtitle,
      userId,
      isPlayerViewAvailable: false,
    };
  };

  const {
    me,
    scenario,
    source,
    lessonsCategories,
    lessonsQuestions,
  } = useHelper((helper: ScenariosHelper & UserHelper) => {
    const currentUser = helper.getMe();
    const scenarioData = helper.getScenario(scenarioId);
    return {
      me: currentUser,
      scenario: scenarioData,
      source: processToGenericSource(scenarioData),
      lessonsCategories: helper.getScenarioLessonsCategories(scenarioId),
      lessonsQuestions: helper.getScenarioLessonsQuestions(scenarioId),
    };
  });

  const finalUserId = userId && userId !== 'null' ? userId : me?.user_id;

  useEffect(() => {
    dispatch(fetchMe());
    if (isPreview) {
      dispatch(fetchScenario(scenarioId));
      dispatch(fetchLessonsCategories(scenarioId));
      dispatch(fetchLessonsQuestions(scenarioId));
    }
  }, [dispatch, scenarioId, userId, finalUserId]);

  // Pass the full scenario because the scenario is never loaded in the store at this point
  const permissions = useScenarioPermissions(scenarioId, scenario);

  const context: ViewLessonContextType = {};

  return (
    <ViewLessonContext.Provider value={context}>
      {isPreview && (
        <LessonsPreview
          source={{ ...source, finalUserId }}
          lessonsCategories={lessonsCategories}
          lessonsQuestions={lessonsQuestions}
          permissions={permissions}
        />
      )}
    </ViewLessonContext.Provider>
  );
};

export default ScenarioViewLessons;
