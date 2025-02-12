import { AttackPattern } from '../../../../../utils/api-types';
import { Option } from '../../../../../utils/Option';

interface LinkedFieldModel {
  key: string;
  type: string;
}

export type FieldValue = string | number | boolean | string[] | AttackPattern[]
  | Option[] | object | { key: string; value: string; type?: string }
  | { key: string; value: string; type?: string }[];

export interface InjectorContractContentField {
  key: string;
  label: string;
  mandatory: boolean;
  readOnly: boolean;
  mandatoryGroups?: string[];
  mandatoryConditionField?: string;
  linkedFields?: LinkedFieldModel[];
  linkedValues?: string[];
  cardinality: '1' | 'n';
  defaultValue: string | string[];
  type: string;
  richText?: boolean;
  tupleFilePrefix?: string;
}

export interface InjectorContractContent {
  fields: InjectorContractContentField[];
  contract_id: string;
  config: { type: string };
  label: string;
}
