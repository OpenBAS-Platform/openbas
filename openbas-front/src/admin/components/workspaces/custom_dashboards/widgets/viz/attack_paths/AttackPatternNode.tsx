import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';

import { type EsAttackPath } from '../../../../../../../utils/api-types';
import AttackPatternBox from '../AttackPatternBox';

export type NodeAttackPath = Node<{ attackPath: EsAttackPath }>;

const AttackPatternNode = ({ data }: NodeProps<NodeAttackPath>) => {
  const attackPath: EsAttackPath = data.attackPath;

  return (
    <div style={{ width: '150px' }}>
      <AttackPatternBox
        attackPatternName={attackPath.attackPatternName}
        attackPatternExerternalId={attackPath.attackPatternExternalId ?? ''}
        successRate={attackPath.value != null ? attackPath.value / 100 : null}
        style={{ width: '150px' }}
      />
      <Handle type="target" position={Position.Left} isConnectable />
      <Handle type="source" position={Position.Right} isConnectable />
    </div>
  );
};

export default AttackPatternNode;
