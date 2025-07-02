import { KeyboardArrowRight } from '@mui/icons-material';
import qs from 'qs';
import { Link } from 'react-router';

import { buildSearchPagination } from '../../../../../../../../../components/common/queryable/QueryableUtils';
import { SIMULATION_BASE_URL } from '../../../../../../../../../constants/BaseUrls';
import { type EsVulnerableEndpoint } from '../../../../../../../../../utils/api-types';

type Props = { element: EsVulnerableEndpoint };

const VulnerableEndpointElementSecondaryAction = (props: Props) => {
  const craftedFilter = btoa(qs.stringify({
    ...buildSearchPagination({
      filterGroup: {
        mode: 'and',
        filters: [
          {
            key: 'finding_assets',
            operator: 'eq',
            mode: 'or',
            values: [props.element.vulnerable_endpoint_id ?? ''],
          },
          {
            key: 'finding_type',
            operator: 'eq',
            mode: 'or',
            values: ['CVE'],
          },
        ],
      },
    }),
    key: `simulation-findings_${props.element.base_simulation_side}`,
  }, { allowEmptyArrays: true }));
  const findingsTabUrl = `${SIMULATION_BASE_URL}/${props.element.base_simulation_side}/findings?query=${craftedFilter}`;
  return (
    <Link to={findingsTabUrl} className="noDrag"><KeyboardArrowRight color="action" /></Link>
  );
};

export default VulnerableEndpointElementSecondaryAction;
