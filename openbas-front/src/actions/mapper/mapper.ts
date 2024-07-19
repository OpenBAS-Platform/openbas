import type { ImportMapper, InjectImporter } from '../../utils/api-types';

export type InjectImporterStore = Omit<InjectImporter, 'inject_importer_injector_contract'> & {
  inject_importer_injector_contract: string;
};

export type ImportMapperStore = Omit<ImportMapper, 'inject_importers'> & {
  inject_importers: InjectImporterStore[];
};
