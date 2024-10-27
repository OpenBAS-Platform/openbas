import { ToggleButton, Tooltip } from '@mui/material';
import { FileDownloadOutlined } from '@mui/icons-material';
import { CSVLink } from 'react-csv';
import { exportData } from '../../utils/Environment';
import { useFormatter } from '../i18n';
import { useHelper } from '../../store';
import type { TagHelper } from '../../actions/helper';

export interface ExportProps<T> {
  exportType: string;
  exportKeys: string[];
  exportData: T[];
  exportFileName: string;
}

interface Props<T> {
  totalElements: number;
  exportProps: ExportProps<T>;
}

const ExportButton = <T extends object>({ totalElements, exportProps }: Props<T>) => {
  // Standard hooks
  const { t } = useFormatter();
  // Fetching data
  const { tagsMap } = useHelper((helper: TagHelper) => ({
    tagsMap: helper.getTagsMap(),
  }));

  return (
    <>
      {totalElements > 0
        ? <CSVLink
            data={exportData(
              exportProps.exportType,
              exportProps.exportKeys,
              exportProps.exportData,
              tagsMap,
            )}
            filename={exportProps.exportFileName}
          >
          <ToggleButton value="export" aria-label="export" size="small">
            <Tooltip title={t('Export this list')}>
              <FileDownloadOutlined
                color="primary"
                fontSize="small"
              />
            </Tooltip>
          </ToggleButton>
        </CSVLink>
        : <ToggleButton value="export" aria-label="export" size="small" disabled={true}>
          <Tooltip title={t('Export this list')}>
            <FileDownloadOutlined fontSize="small" />
          </Tooltip>
        </ToggleButton>
      }
    </>
  );
};

export default ExportButton;
