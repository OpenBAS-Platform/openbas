import React, { FunctionComponent, useEffect, useState } from 'react';
import MapperForm from './MapperForm';
import { fetchMapper, updateXlsMapper } from '../../../../../actions/xls_formatter/xls-formatter-actions';
import type { ImportMapper, ImportMapperUpdateInput, RawPaginationImportMapper } from '../../../../../utils/api-types';
import Loader from '../../../../../components/Loader';

interface XlsFormatterUpdateComponentProps {
  xlsMapper: ImportMapper;
  onUpdate?: (result: RawPaginationImportMapper) => void;
  handleClose: () => void;
}

const XlsFormatterUpdateComponent: FunctionComponent<XlsFormatterUpdateComponentProps> = ({
  xlsMapper,
  onUpdate,
  handleClose,
}) => {
  const initialValues = {
    mapper_name: xlsMapper.import_mapper_name ?? '',
    mapper_inject_type_column: xlsMapper.import_mapper_inject_type_column ?? '',
    mapper_inject_importers: xlsMapper.inject_importers?.map((i) => ({
      inject_importer_injector_contract_id: i.inject_importer_injector_contract,
      inject_importer_type_value: i.inject_importer_type_value,
      inject_importer_rule_attributes: i.rule_attributes?.map((r) => ({
        rule_attribute_name: r.rule_attribute_name,
        rule_attribute_columns: r.rule_attribute_columns,
        rule_attribute_default_value: r.rule_attribute_default_value,
        rule_attribute_additional_config: r.rule_attribute_additional_config,
      })) ?? [],
    })) ?? [],
  };

  const onSubmit = ((data: ImportMapperUpdateInput) => {
    updateXlsMapper(xlsMapper.import_mapper_id, data).then(
      (result: { data: RawPaginationImportMapper }) => {
        onUpdate?.(result.data);
        return result;
      },
    );
    handleClose();
  });

  return (
    <MapperForm
      initialValues={initialValues}
      editing
      onSubmit={onSubmit}
    />
  );
};

interface XlsFormatterUpdateProps {
  xlsMapperId: string;
  onUpdate?: (result: RawPaginationImportMapper) => void;
  handleClose: () => void;
}

const XlsFormatterUpdate: FunctionComponent<XlsFormatterUpdateProps> = ({
  xlsMapperId,
  onUpdate,
  handleClose,
}) => {
  const [xlsMapper, setXlsMapper] = useState<ImportMapper | null>();

  useEffect(() => {
    fetchMapper(xlsMapperId).then((result: { data: ImportMapper }) => {
      setXlsMapper(result.data);
    });
  }, []);

  if (!xlsMapper) {
    return <Loader />;
  }

  return (
    <XlsFormatterUpdateComponent
      xlsMapper={xlsMapper}
      onUpdate={onUpdate}
      handleClose={handleClose}
    />
  );
};

export default XlsFormatterUpdate;
