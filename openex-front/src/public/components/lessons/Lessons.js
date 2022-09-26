import React from 'react';
import { useQueryParameter } from '../../../utils/Environment';
import LessonsPlayer from './LessonsPlayer';

const Lessons = () => {
  const [preview] = useQueryParameter(['preview']);
  if (preview === 'true') {
    return <LessonsPlayer />;
  }
  return <LessonsPlayer />;
};

export default Lessons;
