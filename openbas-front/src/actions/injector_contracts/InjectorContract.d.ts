import type { ExpectationInput } from '../../admin/components/common/injects/expectations/Expectation';
import { type InjectorContract } from '../../utils/api-types';
import { type ContractVariable } from '../contract/contract';

export type ContractType = 'text' | 'number' | 'checkbox' | 'textarea' | 'tags' | 'select' | 'choice' | 'article' | 'challenge' | 'dependency-select' | 'attachment' | 'team' | 'expectation' | 'asset' | 'asset-group' | 'payload';

interface LinkedFieldModel {
  key: string;
  type: string;
}
export type FieldValue = string | number | boolean | string[] | AttackPattern[]
  | Option[] | object | {
    key: string;
    value: string;
    type?: string;
  }
  | {
    key: string;
    value: string;
    type?: string;
  }[];

export interface ContractElement {
  key: string;
  mandatory: boolean;
  type: ContractType;
  label: string;
  readOnly: boolean;
  mandatoryGroups?: string[];
  mandatoryConditionField?: string;
  linkedFields?: LinkedFieldModel[];
  linkedValues?: string[];
  cardinality: '1' | 'n';
  defaultValue: string | string[];
  richText?: boolean;
  tupleFilePrefix?: string;
  predefinedExpectations?: ExpectationInput[];
  dependencyField?: string;
  choices?: Record<string, string> | {
    label: string;
    value: string;
    information: string;
  }[];
}

export type InjectorContractConverted = Omit<InjectorContract, 'convertedContent'> & {
  convertedContent: {
    fields: ContractElement[];
    contract_id: string;
    config: {
      type: string;
      color_dark: string;
      color_light: string;
      expose: boolean;
      label: Record<string, string>;
    };
    label: Record<string, string>;
    variables?: ContractVariable[];
  };
};
