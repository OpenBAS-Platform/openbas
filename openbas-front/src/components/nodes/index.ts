import { NodeTypes } from '@xyflow/react';
import NodePhantom from './NodePhantom';
import NodeInjectExport from './NodeInject';

const nodeTypes: NodeTypes = {
  inject: NodeInjectExport,
  phantom: NodePhantom,
};

export default nodeTypes;
