// FILE TO REFERENCE ALL CUSTOM TYPES DERIVATIVE FROM API-TYPES

import type * as ApiTypes from './api-types';

export type DateHistogramWidget = ApiTypes.UtilRequiredKeys<ApiTypes.BaseHistogramWidget, 'mode' | 'field'> & Pick<ApiTypes.DateHistogramWidget, 'end' | 'interval' | 'series' | 'start'>;
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
