import { LabelColorDict } from '../../../Theme';
import LabelChip from '../../chips/LabelChip';

/*
  Colours GREEN if FALSE (= NO is OK), RED if TRUE (= YES is NOK)
 */
type Props = { bool?: boolean };

const InverseBooleanFragment = (props: Props) => {
  return props.bool
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

export default InverseBooleanFragment;
