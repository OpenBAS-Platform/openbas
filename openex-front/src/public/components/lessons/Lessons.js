import React from 'react';
import { useQueryParameter } from '../../../utils/Environment';
import LessonsPlayer from './LessonsPlayer';
import LessonsPreview from './LessonsPreview';

const Lessons = () => {
  const [preview] = useQueryParameter(['preview']);
  if (preview === 'true') {
    return <LessonsPreview />;
  }
  return <LessonsPlayer />;
};

export default Lessons;
