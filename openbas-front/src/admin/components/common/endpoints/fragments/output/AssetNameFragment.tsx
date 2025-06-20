import { type EndpointOutput } from '../../../../../../utils/api-types';

type Props = { endpoint: EndpointOutput };

const AssetNameFragment = (props: Props) => {
  return props.endpoint.asset_name;
};

export default AssetNameFragment;
