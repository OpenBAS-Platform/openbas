import React, { FunctionComponent, useEffect, useState } from 'react';
import MapperForm from './MapperForm';
import { fetchMapper, updateMapper } from '../../../../../actions/mapper/mapper-actions';
import type { ImportMapperUpdateInput, RawPaginationImportMapper } from '../../../../../utils/api-types';
import Loader from '../../../../../components/Loader';
import { ImportMapperStore } from '../../../../../actions/mapper/mapper';

interface XlsMapperUpdateComponentProps {
  xlsMapper: ImportMapperStore;
  onUpdate?: (result: RawPaginationImportMapper) => void;
  handleClose: () => void;
}

const XlsMapperUpdateComponent: FunctionComponent<XlsMapperUpdateComponentProps> = ({
  xlsMapper,
  onUpdate,
  handleClose,
}) => {
  const initialValues = {
    import_mapper_name: xlsMapper.import_mapper_name ?? '',
    import_mapper_inject_type_column: xlsMapper.import_mapper_inject_type_column ?? '',
    import_mapper_inject_importers: xlsMapper.import_mapper_inject_importers?.map((i) => ({
      inject_importer_injector_contract: i.inject_importer_injector_contract,
      inject_importer_type_value: i.inject_importer_type_value,
      inject_importer_rule_attributes: i.inject_importer_rule_attributes?.map((r) => ({
        rule_attribute_name: r.rule_attribute_name,
        rule_attribute_columns: r.rule_attribute_columns,
        rule_attribute_default_value: r.rule_attribute_default_value,
        rule_attribute_additional_config: r.rule_attribute_additional_config,
      })) ?? [],
    })) ?? [],
  };

  const onSubmit = ((data: ImportMapperUpdateInput) => {
    updateMapper(xlsMapper.import_mapper_id, data).then(
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

interface XlsMapperUpdateProps {
  xlsMapperId: string;
  onUpdate?: (result: RawPaginationImportMapper) => void;
  handleClose: () => void;
}

const XlsMapperUpdate: FunctionComponent<XlsMapperUpdateProps> = ({
  xlsMapperId,
  onUpdate,
  handleClose,
}) => {
  const [xlsMapper, setXlsMapper] = useState<ImportMapperStore | null>();

  useEffect(() => {
    fetchMapper(xlsMapperId).then((result: { data: ImportMapperStore }) => {
      setXlsMapper(result.data);
    });
  }, []);

  if (!xlsMapper) {
    return <Loader />;
  }

  return (
    <XlsMapperUpdateComponent
      xlsMapper={xlsMapper}
      onUpdate={onUpdate}
      handleClose={handleClose}
    />
  );
};

export default XlsMapperUpdate;
