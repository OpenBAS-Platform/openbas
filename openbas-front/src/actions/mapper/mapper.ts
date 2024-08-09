import type { ImportMapper, InjectImporter } from '../../utils/api-types';

export type InjectImporterStore = Omit<InjectImporter, 'inject_importer_injector_contract'> & {
  inject_importer_injector_contract: string;
};

export type ImportMapperStore = Omit<ImportMapper, 'import_mapper_inject_importers'> & {
  import_mapper_inject_importers: InjectImporterStore[];
};
