import { type FunctionComponent } from 'react';

import AttackPatternChip from './AttackPatternChip';

interface Props { attackPatternIds: string[] }

const AttackPatternChips: FunctionComponent<Props> = ({ attackPatternIds }) => {
  if (!attackPatternIds || attackPatternIds.length === 0) {
    return (<>-</>);
  }

  return (
    <>
      {attackPatternIds?.map((attackPatternId: string) => (<AttackPatternChip key={attackPatternId} attackPatternId={attackPatternId} />))}
    </>
  );
};

export default AttackPatternChips;
