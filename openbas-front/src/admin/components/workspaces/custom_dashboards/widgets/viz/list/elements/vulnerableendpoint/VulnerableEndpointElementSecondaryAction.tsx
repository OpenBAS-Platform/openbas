import { KeyboardArrowRight } from '@mui/icons-material';
import { Link } from 'react-router';

import { SIMULATION_BASE_URL } from '../../../../../../../../../constants/BaseUrls';
import { type EsVulnerableEndpoint } from '../../../../../../../../../utils/api-types';

type Props = { element: EsVulnerableEndpoint };

const VulnerableEndpointElementSecondaryAction = (props: Props) => {
  const findingsTabUrl = `${SIMULATION_BASE_URL}/${props.element.base_simulation_side}/findings`;
  return (
    <Link to={findingsTabUrl} className="noDrag"><KeyboardArrowRight color="action" /></Link>
  );
};

export default VulnerableEndpointElementSecondaryAction;
