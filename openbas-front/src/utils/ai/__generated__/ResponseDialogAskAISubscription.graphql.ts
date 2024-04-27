/**
 * @generated SignedSource<<44ef655437b454337705800a6973bddb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, GraphQLSubscription } from 'relay-runtime';
export type ResponseDialogAskAISubscription$variables = {
  id: string;
};
export type ResponseDialogAskAISubscription$data = {
  readonly aiBus: {
    readonly content: string;
  } | null | undefined;
};
export type ResponseDialogAskAISubscription = {
  response: ResponseDialogAskAISubscription$data;
  variables: ResponseDialogAskAISubscription$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "AIBus",
    "kind": "LinkedField",
    "name": "aiBus",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "content",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ResponseDialogAskAISubscription",
    "selections": (v1/*: any*/),
    "type": "Subscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResponseDialogAskAISubscription",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "4801969b07ec7a044b6dfad8921fb386",
    "id": null,
    "metadata": {},
    "name": "ResponseDialogAskAISubscription",
    "operationKind": "subscription",
    "text": "subscription ResponseDialogAskAISubscription(\n  $id: ID!\n) {\n  aiBus(id: $id) {\n    content\n  }\n}\n"
  }
};
})();

(node as any).hash = "0ee4c21aec8ff0eed40fd813708dcc2c";

export default node;
