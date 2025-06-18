import {EndpointOutput} from "../../../../../../utils/api-types";
import PlatformIcon from "../../../../../../components/PlatformIcon";
import {useTheme} from "@mui/material/styles";
import {useFormatter} from "../../../../../../components/i18n";
import ItemTags from "../../../../../../components/ItemTags";

type Props = {
    endpoint: EndpointOutput
}

const AssetTagsFragment = (props: Props) =>  {
    return (<ItemTags variant="list" tags={props.endpoint.asset_tags} />);
}

export default AssetTagsFragment;