import { LabelColorDict } from '../../../Theme';
import LabelChip from '../../chips/LabelChip';

type Props = { action?: string };

const VulnerableEndpointActionFragment = (props: Props) => {
  const getChipByAction = (action?: string) => {
    const actual_action = action ?? 'OK';
    switch (actual_action ?? 'OK') {
      case 'REPLACE': return (
        <LabelChip
          label={actual_action}
          color={LabelColorDict.Red}
        />
      );
      case 'UPDATE': return (
        <LabelChip
          label={actual_action}
          color={LabelColorDict.Orange}
        />
      );
      case 'OK': return (
        <LabelChip
          label={actual_action}
          color={LabelColorDict.Green}
        />
      );
      default: return (
        <LabelChip
          label={actual_action}
          color={LabelColorDict.Green}
        />
      );
    }
  };
  return getChipByAction(props.action);
};

export default VulnerableEndpointActionFragment;
