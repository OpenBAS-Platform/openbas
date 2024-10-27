export interface Contract {
  config: ContractConfig;
  context: Record<string, string>;
  contract_attack_patterns_external_ids: string[];
  contract_id: string;
  fields: ContractElement[];
  label: Record<string, string>;
  manual: boolean;
  variables: ContractVariable[];
}

export interface ContractConfig {
  color_dark?: string;
  color_light?: string;
  expose?: boolean;
  label?: Record<string, string>;
  type?: string;
}

export interface ContractElement {
  key?: string;
  label?: string;
  linkedFields?: LinkedFieldModel[];
  linkedValues?: string[];
  mandatory?: boolean;
  mandatoryGroups?: string[];
  type?:
    | 'text'
    | 'number'
    | 'tuple'
    | 'checkbox'
    | 'textarea'
    | 'select'
    | 'article'
    | 'challenge'
    | 'dependency-select'
    | 'attachment'
    | 'team'
    | 'expectation'
    | 'asset'
    | 'asset-group';
}

export interface ContractVariable {
  cardinality: '1' | 'n';
  children?: ContractVariable[];
  key: string;
  label: string;
  type: 'String' | 'Object';
}
