import ItemTags from '../../../../../../components/ItemTags';
import { type EsEndpoint } from '../../../../../../utils/api-types';

type Props = { endpoint: EsEndpoint };

const AssetTagsFragment = (props: Props) => {
  return (<ItemTags variant="list" tags={props.endpoint.base_tags_side} />);
};

export default AssetTagsFragment;
