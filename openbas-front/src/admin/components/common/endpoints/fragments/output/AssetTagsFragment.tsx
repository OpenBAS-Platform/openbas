import ItemTags from '../../../../../../components/ItemTags';
import { type EndpointOutput } from '../../../../../../utils/api-types';

type Props = { endpoint: EndpointOutput };

const AssetTagsFragment = (props: Props) => {
  return (<ItemTags variant="list" tags={props.endpoint.asset_tags} />);
};

export default AssetTagsFragment;
