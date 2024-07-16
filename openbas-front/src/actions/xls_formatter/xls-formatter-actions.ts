import { ImportMapperAddInput, ImportMapperUpdateInput, RawPaginationImportMapper, SearchPaginationInput } from '../../utils/api-types';
import { simpleCall, simpleDelCall, simplePostCall, simplePutCall } from '../../utils/Action';

const XLS_FORMATTER_URI = '/api/mappers';

export const searchMappers = (searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = `${XLS_FORMATTER_URI}/search`;
  return simplePostCall(uri, data);
};

export const fetchMapper = (mapperId: string) => {
  const uri = `${XLS_FORMATTER_URI}/${mapperId}`;
  return simpleCall(uri);
};

export const deleteXlsMapper = (mapperId: RawPaginationImportMapper['import_mapper_id']) => {
  const uri = `${XLS_FORMATTER_URI}/${mapperId}`;
  return simpleDelCall(uri, mapperId);
};

export const createXlsMapper = (data: ImportMapperAddInput) => {
  return simplePostCall(XLS_FORMATTER_URI, data);
};

export const updateXlsMapper = (mapperId: string, data: ImportMapperUpdateInput) => {
  const uri = `${XLS_FORMATTER_URI}/${mapperId}`;
  return simplePutCall(uri, data);
};
