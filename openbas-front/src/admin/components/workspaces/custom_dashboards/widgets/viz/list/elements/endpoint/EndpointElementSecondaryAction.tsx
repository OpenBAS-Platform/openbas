import { ArrowForwardIos } from '@mui/icons-material';
import { Link } from 'react-router';

import { type EsEndpoint } from '../../../../../../../../../utils/api-types';

type Props = { element: EsEndpoint };

const EndpointElementSecondaryAction = (props: Props) => {
  const endpointUrl = `/admin/assets/endpoints/${props.element.base_id}`;
  return (
    <Link to={endpointUrl} className="noDrag"><ArrowForwardIos /></Link>
  );
};

export default EndpointElementSecondaryAction;
