import {EsEndpoint} from "../../../../../../utils/api-types";
import PlatformIcon from "../../../../../../components/PlatformIcon";
import {useTheme} from "@mui/material/styles";
import {useFormatter} from "../../../../../../components/i18n";
import ItemTags from "../../../../../../components/ItemTags";

type Props = {
    endpoint: EsEndpoint
}

const AssetPlatformFragment = (props: Props) =>  {
    return (<ItemTags variant="list" tags={props.endpoint.base_tags_side} />);
}

export default AssetPlatformFragment;