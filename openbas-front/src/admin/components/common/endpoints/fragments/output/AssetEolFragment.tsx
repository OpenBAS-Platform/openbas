import LabelChip from '../../../../../../components/common/chips/LabelChip';
import { LabelColorDict } from '../../../../../../components/Theme';
import { type EndpointOverviewOutput } from '../../../../../../utils/api-types';

type Props = { endpoint: EndpointOverviewOutput };

const AssetEolFragment = (props: Props) => {
  return props.endpoint.endpoint_is_eol
    ? (
        <LabelChip
          label="Yes"
          color={LabelColorDict.Red}
        />
      )
    : (
        <LabelChip
          label="No"
          color={LabelColorDict.Green}
        />
      );
};

export default AssetEolFragment;
