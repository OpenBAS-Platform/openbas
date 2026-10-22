import { ASSET_TYPE, somethingCreated } from '../../../../actions/assets/asset-queries';
import { importEndpoints } from '../../../../actions/assets/endpoint-actions';
import { TAG_TYPE } from '../../../../actions/tags/tag-queries';
import ImportUploader from '../../../../components/common/ImportUploader';
import { useFormatter } from '../../../../components/i18n';
import { MESSAGING$ } from '../../../../utils/Environment';
import { useLiveMutation } from '../../../../utils/query/live';

const ImportUploaderEndpoints = () => {
  const { t } = useFormatter();

  // The import creates an unknown set of assets and upserts the tags they carry, so the changes
  // name no particular id: the asset and tag lists refetch.
  const importMutation = useLiveMutation({
    mutationFn: (file: FormData) => importEndpoints(file, 'ENDPOINTS'),
    changes: () => [somethingCreated(ASSET_TYPE), somethingCreated(TAG_TYPE)],
  });

  // Resolves once the import is done so the uploader keeps its spinner meanwhile. A failure was
  // already reported by the API layer: it only ends the spinner.
  const handleUpload = async (file: FormData) => {
    try {
      await importMutation.mutateAsync(file);
      MESSAGING$.notifySuccess(t('CSV imported successfully'));
    } catch {
      // Already notified.
    }
  };

  return (
    <ImportUploader title={t('Import endpoints')} handleUpload={handleUpload} />
  );
};

export default ImportUploaderEndpoints;
