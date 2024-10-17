import React, { useState } from 'react';
import { Dialog, ToggleButton, Tooltip } from '@mui/material';
import { FilePdfBox } from 'mdi-material-ui';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

import { useDispatch } from 'react-redux';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { useFormatter } from './i18n';
import Loader from './Loader';
import { useHelper } from '../store';
import type { UserHelper } from '../actions/helper';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface Props {
  getPdfDocDefinition: ()=> Promise<TDocumentDefinitions>,
  pdfName: string;
}

const ExportPdfButton: React.FC<Props> = ({ getPdfDocDefinition, pdfName }) => {
  const { t } = useFormatter();
  const [exporting, setExporting] = useState<boolean>(false);
  const dispatch = useDispatch();

  const { user } = useHelper((helper: UserHelper) => ({
    user: helper.getMe(),
  }));

  const changeUserTheme = (theme: string) => dispatch({ type: 'DATA_UPDATE_SUCCESS',
    payload: {
      entities: {
        users: {
          [user.user_id]: {
            ...user,
            user_theme: theme,
            user_exporting: false,
          },
        },
      },
    } });

  const onExportPdf = async () => {
    setExporting(true);
    if (user.user_theme !== 'light') {
      changeUserTheme('light');
    }
    const pdfDocDefinition: TDocumentDefinitions = await getPdfDocDefinition();
    pdfMake.createPdf(pdfDocDefinition).download(`${pdfName}.pdf`);
    if (user.user_theme !== 'light') {
      changeUserTheme(user.user_theme);
    }
    setExporting(false);
  };

  return (
    <div>
      <Tooltip title={t('Export to PDF')}>
        <ToggleButton value='exportPdf' onClick={onExportPdf}>
          <FilePdfBox fontSize="small" color="primary" />
        </ToggleButton>
      </Tooltip>
      <Dialog
        PaperProps = {{
          elevation: 1,
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
        }}
        open={exporting}
        keepMounted={true}
        fullScreen={true}
      >
        <Loader />
      </Dialog>
    </div>
  );
};

export default ExportPdfButton;
