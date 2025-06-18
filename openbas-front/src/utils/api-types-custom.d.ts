// FILE TO REFERENCE ALL CUSTOM TYPES DERIVATIVE FROM API-TYPES

import type { ContractVariable } from '../actions/contract/contract';
import type { ExpectationInput } from '../admin/components/common/injects/expectations/Expectation';
import type * as ApiTypes from './api-types';

export type DateHistogramWidget = ApiTypes.UtilRequiredKeys<ApiTypes.BaseHistogramWidget, 'mode' | 'field'> & {
  end: string;
  interval: 'year' | 'month' | 'week' | 'day' | 'hour' | 'quarter';
  series: DateHistogramSeries[];
  start: string;
};
export type HistogramWidget = ApiTypes.BaseHistogramWidget &
  (
    | ApiTypes.BaseHistogramWidgetModeMapping<'temporal', DateHistogramWidget>
    | ApiTypes.BaseHistogramWidgetModeMapping<'structural', ApiTypes.StructuralHistogramWidget>
    );
export type WidgetInput = Omit<ApiTypes.WidgetInput, 'widget_config'> & { widget_config: (Omit<DateHistogramWidget, 'mode'> & { mode: 'temporal' }) | (Omit<ApiTypes.StructuralHistogramWidget, 'mode'> & { mode: 'structural' }) };
export type Widget = Omit<ApiTypes.Widget, 'widget_config'> & { widget_config: (Omit<DateHistogramWidget, 'mode'> & { mode: 'temporal' }) | (Omit<ApiTypes.StructuralHistogramWidget, 'mode'> & { mode: 'structural' }) };
type PayloadCreateInputOmit = 'payload_type' | 'payload_source' | 'payload_status' | 'payload_created_at' | 'payload_id' | 'payload_updated_at' | 'payload_output_parsers';
type PayloadCreateInputMore = {
  payload_output_parsers?: (
    Omit<ApiTypes.OutputParser, 'output_parser_created_at' | 'output_parser_updated_at' | 'output_parser_id' | 'output_parser_contract_output_elements'>
    & {
      output_parser_contract_output_elements: (Omit<ApiTypes.ContractOutputElement, 'contract_output_element_created_at' | 'contract_output_element_updated_at' | 'contract_output_element_id' | 'contract_output_element_regex_groups'>
        & { contract_output_element_regex_groups: Omit<ApiTypes.RegexGroup, 'regex_group_created_at' | 'regex_group_updated_at' | 'regex_group_id'>[] })[];
    }
  )[];
};
export type PayloadCreateInput = Omit<ApiTypes.BasePayload, PayloadCreateInputOmit> & PayloadCreateInputMore &
  (
    | Omit<ApiTypes.Command, PayloadCreateInputOmit> & PayloadCreateInputMore & { payload_type: 'Command' }
    | Omit<ApiTypes.Executable, PayloadCreateInputOmit> & PayloadCreateInputMore & { payload_type: 'Executable' }
    | Omit<ApiTypes.FileDrop, PayloadCreateInputOmit> & PayloadCreateInputMore & { payload_type: 'FileDrop' }
    | Omit<ApiTypes.DnsResolution, PayloadCreateInputOmit> & PayloadCreateInputMore & { payload_type: 'DnsResolution' }
    );

export type ContractType = 'text' | 'number' | 'checkbox' | 'textarea' | 'tags' | 'select' | 'choice' | 'article' | 'challenge' | 'dependency-select' | 'attachment' | 'team' | 'expectation' | 'asset' | 'asset-group' | 'payload' | 'targeted-asset';

export interface ContractElement {
  key: string;
  mandatory: boolean;
  type: ContractType;
  label: string;
  readOnly: boolean;
  mandatoryGroups?: string[];
  mandatoryConditionField?: string;
  linkedFields?: {
    key: string;
    type: string;
  }[];
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
