import { type ExpectationInput, ExpectationType } from './Expectation';
import { AssignmentTurnedIn, PublishedWithChangesOutlined } from '@mui/icons-material';
import { NewspaperVariantMultipleOutline } from 'mdi-material-ui';
import React from 'react';

export const isAutomatic = (type: string) => {
  return [ExpectationType.ARTICLE.toString(), ExpectationType.TECHNICAL.toString(), ExpectationType.DETECTION.toString()].includes(type);
};

export const typeIcon = (type: string) => {
  if (type === 'DETECTION') {
    return <PublishedWithChangesOutlined />;
  }
  if (type === 'TECHNICAL') {
    return <PublishedWithChangesOutlined />;
  }
  if (type === 'ARTICLE') {
    return <NewspaperVariantMultipleOutline />;
  }
  return <AssignmentTurnedIn />;
};

export const hasExpectationByGroup = (expectation: ExpectationInput) => {
  return [ExpectationType.TECHNICAL.toString(), ExpectationType.DETECTION.toString()].includes(expectation.expectation_type);
};
