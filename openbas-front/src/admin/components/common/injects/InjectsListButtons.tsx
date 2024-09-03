import React, { FunctionComponent, useContext } from 'react';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { BarChartOutlined, ReorderOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import type { InjectOutputType } from '../../../../actions/injects/Inject';
import { exportData } from '../../../../utils/Environment';
import { useFormatter } from '../../../../components/i18n';
import { InjectContext } from '../Context';
import ImportUploaderInjectFromXls from './ImportUploaderInjectFromXls';
import useExportToXLS from '../../../../utils/hooks/useExportToXLS';
import { useHelper } from '../../../../store';
import type { TagHelper } from '../../../../actions/helper';
import ButtonPopover from '../../../../components/common/ButtonPopover';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },
}));

interface Props {
  injects: InjectOutputType[];
  setViewMode?: (mode: string) => void;
  showTimeline: boolean;
  handleShowTimeline: () => void;
}

const InjectsListButtons: FunctionComponent<Props> = ({
  injects,
  setViewMode,
  showTimeline,
  handleShowTimeline,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const injectContext = useContext(InjectContext);

  // Fetching data
  const { tagsMap } = useHelper((helper: TagHelper) => ({
    tagsMap: helper.getTagsMap(),
  }));

  const isAtLeastOneValidInject = injects.some((inject) => inject.inject_injector_contract?.injector_contract_content_parsed !== null);

  const exportInjects = exportData(
    'inject',
    [
      'inject_type',
      'inject_title',
      'inject_description',
      'inject_depends_duration',
      'inject_enabled',
      'inject_tags',
      'inject_content',
    ],
    injects,
    tagsMap,
  );
  const exportInjectsToXLS = useExportToXLS({ data: exportInjects, fileName: `${t('Injects')}` });

  const onShowTimeline = () => {
    handleShowTimeline();
  };

  const entries = [
    { label: 'Export injects', action: exportInjectsToXLS },
    { label: showTimeline ? t('Hide timeline') : t('Show timeline'), action: onShowTimeline },
  ];

  return (
    <div className={classes.container}>
      <ButtonPopover
        disabled={!isAtLeastOneValidInject}
        entries={entries}
        variant={'icon'}
      />
      <ToggleButtonGroup
        size="small"
        exclusive
        style={{ float: 'right' }}
        aria-label="Change view mode"
      >
        {injectContext.onImportInjectFromXls
          && <ImportUploaderInjectFromXls />}
        {!!setViewMode
          && <Tooltip title={t('List view')}>
            <ToggleButton
              value="list"
              selected
              aria-label="List view mode"
            >
              <ReorderOutlined fontSize="small" color="inherit" />
            </ToggleButton>
          </Tooltip>
        }
        {!!setViewMode
          && <Tooltip title={t('Distribution view')}>
            <ToggleButton
              value="distribution"
              onClick={() => setViewMode('distribution')}
              aria-label="Distribution view mode"
            >
              <BarChartOutlined fontSize="small" color="primary" />
            </ToggleButton>
          </Tooltip>
        }
      </ToggleButtonGroup>
    </div>
  );
};

export default InjectsListButtons;
