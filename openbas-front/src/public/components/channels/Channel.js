import { useQueryParameter } from '../../../utils/Environment';
import ChannelPreview from './ChannelPreview';
import ChannelPlayer from './ChannelPlayer';

const Channel = () => {
  const [preview] = useQueryParameter(['preview']);
  if (preview === 'true') {
    return <ChannelPreview />;
  }
  return <ChannelPlayer />;
};

export default Channel;
