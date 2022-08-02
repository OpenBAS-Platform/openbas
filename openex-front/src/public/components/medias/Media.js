import React from 'react';
import { useQueryParameter } from '../../../utils/Environment';
import MediaPreview from './MediaPreview';
import MediaPlayer from './MediaPlayer';

const Media = () => {
  const [preview] = useQueryParameter(['preview']);
  if (preview === 'true') {
    return <MediaPreview />;
  }
  return <MediaPlayer />;
};

export default Media;
