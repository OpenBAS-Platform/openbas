import React, { FunctionComponent, useContext } from 'react';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { BarChartOutlined, ReorderOutlined, ViewTimelineOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import type { InjectOutputType } from '../../../../actions/injects/Inject';
import { exportData } from '../../../../utils/Environment';
import { useFormatter } from '../../../../components/i18n';
import { InjectContext, ViewModeContext } from '../Context';
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
  availableButtons: string[];
}

const InjectsListButtons: FunctionComponent<Props> = ({
  injects,
  setViewMode,
  availableButtons,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const injectContext = useContext(InjectContext);

  const viewModeContext = useContext(ViewModeContext);

  // Fetching data
  const { tagsMap } = useHelper((helper: TagHelper) => ({
    tagsMap: helper.getTagsMap(),
  }));

  const isAtLeastOneValidInject = injects.some((inject) => !inject.inject_injector_contract?.injector_contract_content_parsed);

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

  const entries = [
    { label: 'Export injects', action: exportInjectsToXLS },
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
        {(!!setViewMode && availableButtons.includes('list'))
          && <Tooltip title={t('List view')}>
            <ToggleButton
              value="list"
              onClick={() => setViewMode('list')}
              selected={viewModeContext === 'list'}
              aria-label="List view mode"
            >
              <ReorderOutlined fontSize="small" color={viewModeContext === 'list' ? 'inherit' : 'primary'} />
            </ToggleButton>
          </Tooltip>
        }
        {(!!setViewMode && availableButtons.includes('chain'))
          && <Tooltip title={t('Interactive view')}>
            <ToggleButton
              value="chain"
              onClick={() => setViewMode('chain')}
              selected={viewModeContext === 'chain'}
              aria-label="Interactive view mode"
            >
              <ViewTimelineOutlined fontSize="small" color={viewModeContext === 'chain' ? 'inherit' : 'primary'} />
            </ToggleButton>
          </Tooltip>
        }
        {(!!setViewMode && availableButtons.includes('distribution'))
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
