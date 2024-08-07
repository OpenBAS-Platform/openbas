import { NodeTypes } from '@xyflow/react';
import NodeInject from './NodeInject';
import NodePhantom from './NodePhantom';

const nodeTypes: NodeTypes = {
  inject: NodeInject,
  phantom: NodePhantom,
};

export default nodeTypes;
