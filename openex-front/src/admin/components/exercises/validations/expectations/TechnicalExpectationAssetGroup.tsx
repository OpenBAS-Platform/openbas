import React, { FunctionComponent } from 'react';
import { PublishedWithChangesOutlined } from '@mui/icons-material';
import type { InjectExpectationsStore } from '../../injects/expectations/Expectation';
import type { Contract } from '../../../../../utils/api-types';
import ExpectationLine from './ExpectationLine';

interface Props {
  expectation: InjectExpectationsStore;
  injectContract: Contract;
}

const TechnicalExpectationAssetGroup: FunctionComponent<Props> = ({
  expectation,
  injectContract,
}) => {
  return (
    <>
      <ExpectationLine
        expectation={expectation}
        info={injectContract.config.label?.en}
        title={injectContract.label.en}
        icon={<PublishedWithChangesOutlined fontSize="small" />}
      />
    </>
  );
};

export default TechnicalExpectationAssetGroup;
