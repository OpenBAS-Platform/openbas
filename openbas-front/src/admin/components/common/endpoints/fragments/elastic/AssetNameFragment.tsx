import {EsEndpoint} from "../../../../../../utils/api-types";

type Props = {
    endpoint: EsEndpoint
}

const AssetNameFragment = (props: Props) =>  {
    return props.endpoint.endpoint_name;
}

export default AssetNameFragment;