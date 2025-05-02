import { type FunctionComponent } from 'react';

import ContextLink from '../../../components/ContextLink';
import { ATOMIC_BASE_URL, SCENARIO_BASE_URL, SIMULATION_BASE_URL } from '../../../constants/BaseUrls';
import { INJECT, SCENARIO, SIMULATION } from '../../../constants/Entities';
import { type FindingOutput } from '../../../utils/api-types';

interface Props {
  finding: FindingOutput;
  type: string;
}

const FindingContextLink: FunctionComponent<Props> = ({ finding, type }) => {
  switch (type) {
    case INJECT: {
      const title = finding.finding_inject?.inject_title;
      const injectId = finding.finding_inject?.inject_id;
      const simulationId = finding.finding_simulation?.exercise_id;

      if (!title || !injectId) return '-';

      const isAtomic = !simulationId;
      const url = isAtomic
        ? `${ATOMIC_BASE_URL}/${injectId}`
        : `${SIMULATION_BASE_URL}/${simulationId}/injects/${injectId}`;

      return <ContextLink title={title} url={url} />;
    }

    case SIMULATION: {
      const title = finding.finding_simulation?.exercise_name;
      const id = finding.finding_simulation?.exercise_id;

      if (!title || !id) return '-';

      return <ContextLink title={title} url={`${SIMULATION_BASE_URL}/${id}`} />;
    }

    case SCENARIO: {
      const title = finding.finding_scenario?.scenario_name;
      const id = finding.finding_scenario?.scenario_id;

      if (!title || !id) return '-';

      return <ContextLink title={title} url={`${SCENARIO_BASE_URL}/${id}`} />;
    }

    default:
      return '-';
  }
};

export default FindingContextLink;
