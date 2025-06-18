import {EsEndpoint} from "../../../../../../utils/api-types";
import {useFormatter} from "../../../../../../components/i18n";

type Props = {
    endpoint: EsEndpoint
}

const EndpointArchFragment = (props: Props) =>  {
    const { t } = useFormatter();
    return props.endpoint.endpoint_arch ?? t('Unknown');
}

export default EndpointArchFragment;