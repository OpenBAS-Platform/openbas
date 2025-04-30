import { Link as MUILink, Tooltip, Typography } from '@mui/material';
import { type FunctionComponent } from 'react';
import { Link } from 'react-router';

import { type FindingOutput } from '../../utils/api-types';
import { truncate } from '../../utils/String';
import { INJECT, SCENARIO, SIMULATION } from '../../utils/utils';

const ATOMIC_BASE_URL = '/admin/atomic_testings';
const SIMULATION_BASE_URL = '/admin/simulations';
const SCENARIO_BASE_URL = '/admin/scenarios';

interface Props {
  finding: FindingOutput;
  type: string;
}

const FindingReferenceLink: FunctionComponent<Props> = ({ finding, type }) => {
  const renderLink = (title: string, url: string) => (
    <Tooltip title={title}>
      <MUILink
        component={Link}
        to={url}
      >
        <Typography
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {truncate(title, 30)}
        </Typography>
      </MUILink>
    </Tooltip>
  );

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

      return renderLink(title, url);
    }

    case SIMULATION: {
      const title = finding.finding_simulation?.exercise_name;
      const id = finding.finding_simulation?.exercise_id;

      if (!title || !id) return '-';

      return renderLink(title, `${SIMULATION_BASE_URL}/${id}`);
    }

    case SCENARIO: {
      const title = finding.finding_scenario?.scenario_name;
      const id = finding.finding_scenario?.scenario_id;

      if (!title || !id) return '-';

      return renderLink(title, `${SCENARIO_BASE_URL}/${id}`);
    }

    default:
      return <Typography color="textSecondary">-</Typography>;
  }
};

export default FindingReferenceLink;
