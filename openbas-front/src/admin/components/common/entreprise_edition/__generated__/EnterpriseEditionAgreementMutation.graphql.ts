/**
 * @generated SignedSource<<7d125c450d9794f116f29f91c7159286>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EditOperation = "add" | "remove" | "replace" | "%future added value";
export type EditInput = {
  key: string;
  object_path?: string | null | undefined;
  operation?: EditOperation | null | undefined;
  value: ReadonlyArray<any | null | undefined>;
};
export type EnterpriseEditionAgreementMutation$variables = {
  id: string;
  input: ReadonlyArray<EditInput | null | undefined>;
};
export type EnterpriseEditionAgreementMutation$data = {
  readonly settingsEdit: {
    readonly fieldPatch: {
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"RootSettings">;
    } | null | undefined;
  } | null | undefined;
};
export type EnterpriseEditionAgreementMutation = {
  response: EnterpriseEditionAgreementMutation$data;
  variables: EnterpriseEditionAgreementMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "message",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v6 = [
  (v3/*: any*/),
  (v5/*: any*/)
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "enable",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "EnterpriseEditionAgreementMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "SettingsEditMutations",
        "kind": "LinkedField",
        "name": "settingsEdit",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v2/*: any*/),
            "concreteType": "Settings",
            "kind": "LinkedField",
            "name": "fieldPatch",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RootSettings"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EnterpriseEditionAgreementMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "SettingsEditMutations",
        "kind": "LinkedField",
        "name": "settingsEdit",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v2/*: any*/),
            "concreteType": "Settings",
            "kind": "LinkedField",
            "name": "fieldPatch",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_demo",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_banner_text",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "UserStatus",
                "kind": "LinkedField",
                "name": "platform_user_statuses",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "status",
                    "storageKey": null
                  },
                  (v4/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_banner_level",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PlatformCriticalAlert",
                "kind": "LinkedField",
                "name": "platform_critical_alerts",
                "plural": true,
                "selections": [
                  (v4/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "type",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PlatformCriticalAlertDetails",
                    "kind": "LinkedField",
                    "name": "details",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Group",
                        "kind": "LinkedField",
                        "name": "groups",
                        "plural": true,
                        "selections": (v6/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_map_tile_server_dark",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_map_tile_server_light",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_openbas_url",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_openerm_url",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_openmtd_url",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_theme",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_whitemark",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_session_idle_timeout",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_session_timeout",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "MarkingDefinition",
                "kind": "LinkedField",
                "name": "platform_data_sharing_max_markings",
                "plural": true,
                "selections": [
                  (v3/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "definition",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "definition_type",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "x_opencti_order",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Module",
                "kind": "LinkedField",
                "name": "platform_feature_flags",
                "plural": true,
                "selections": [
                  (v3/*: any*/),
                  (v7/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Module",
                "kind": "LinkedField",
                "name": "platform_modules",
                "plural": true,
                "selections": [
                  (v3/*: any*/),
                  (v7/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "running",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "warning",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "enterprise_edition",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_title",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_favicon",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_theme_dark_background",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_theme_dark_paper",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_theme_dark_nav",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_theme_dark_primary",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_theme_dark_secondary",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_theme_dark_accent",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_theme_dark_logo",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_theme_dark_logo_collapsed",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_theme_light_background",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_theme_light_paper",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_theme_light_nav",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_theme_light_primary",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_theme_light_secondary",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_theme_light_accent",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_theme_light_logo",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_theme_light_logo_collapsed",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_language",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "password_policy_min_length",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "password_policy_max_length",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "password_policy_min_symbols",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "password_policy_min_numbers",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "password_policy_min_words",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "password_policy_min_lowercase",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "password_policy_min_uppercase",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_login_message",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_consent_message",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_consent_confirm_text",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Provider",
                "kind": "LinkedField",
                "name": "platform_providers",
                "plural": true,
                "selections": [
                  (v5/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "strategy",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Organization",
                "kind": "LinkedField",
                "name": "platform_organization",
                "plural": false,
                "selections": (v6/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "otp_mandatory",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "analytics_google_analytics_v4",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_ai_enabled",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_ai_type",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "platform_ai_has_token",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "45f7e3e6dc9c45a3ce1cf147ca2e3827",
    "id": null,
    "metadata": {},
    "name": "EnterpriseEditionAgreementMutation",
    "operationKind": "mutation",
    "text": "mutation EnterpriseEditionAgreementMutation(\n  $id: ID!\n  $input: [EditInput]!\n) {\n  settingsEdit(id: $id) {\n    fieldPatch(input: $input) {\n      id\n      ...RootSettings\n    }\n  }\n}\n\nfragment AppIntlProvider_settings on Settings {\n  platform_language\n}\n\nfragment AppThemeProvider_settings on Settings {\n  platform_title\n  platform_favicon\n  platform_theme\n  platform_theme_dark_background\n  platform_theme_dark_paper\n  platform_theme_dark_nav\n  platform_theme_dark_primary\n  platform_theme_dark_secondary\n  platform_theme_dark_accent\n  platform_theme_dark_logo\n  platform_theme_dark_logo_collapsed\n  platform_theme_light_background\n  platform_theme_light_paper\n  platform_theme_light_nav\n  platform_theme_light_primary\n  platform_theme_light_secondary\n  platform_theme_light_accent\n  platform_theme_light_logo\n  platform_theme_light_logo_collapsed\n}\n\nfragment PasswordPolicies on Settings {\n  password_policy_min_length\n  password_policy_max_length\n  password_policy_min_symbols\n  password_policy_min_numbers\n  password_policy_min_words\n  password_policy_min_lowercase\n  password_policy_min_uppercase\n}\n\nfragment Policies on Settings {\n  id\n  platform_login_message\n  platform_consent_message\n  platform_consent_confirm_text\n  platform_banner_level\n  platform_banner_text\n  password_policy_min_length\n  password_policy_max_length\n  password_policy_min_symbols\n  password_policy_min_numbers\n  password_policy_min_words\n  password_policy_min_lowercase\n  password_policy_min_uppercase\n  platform_data_sharing_max_markings {\n    id\n    definition\n    definition_type\n  }\n  platform_providers {\n    name\n    strategy\n  }\n  platform_organization {\n    id\n    name\n  }\n  otp_mandatory\n}\n\nfragment RootSettings on Settings {\n  id\n  platform_demo\n  platform_banner_text\n  platform_user_statuses {\n    status\n    message\n  }\n  platform_banner_level\n  platform_critical_alerts {\n    message\n    type\n    details {\n      groups {\n        id\n        name\n      }\n    }\n  }\n  platform_map_tile_server_dark\n  platform_map_tile_server_light\n  platform_openbas_url\n  platform_openerm_url\n  platform_openmtd_url\n  platform_theme\n  platform_whitemark\n  platform_session_idle_timeout\n  platform_session_timeout\n  platform_data_sharing_max_markings {\n    id\n    definition\n    definition_type\n    x_opencti_order\n  }\n  platform_feature_flags {\n    id\n    enable\n  }\n  platform_modules {\n    id\n    enable\n    running\n    warning\n  }\n  enterprise_edition\n  ...AppThemeProvider_settings\n  ...AppIntlProvider_settings\n  ...PasswordPolicies\n  ...Policies\n  analytics_google_analytics_v4\n  platform_ai_enabled\n  platform_ai_type\n  platform_ai_has_token\n}\n"
  }
};
})();

(node as any).hash = "ce6dce4df39d61f2584d272ab9d73247";

export default node;
