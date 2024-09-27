import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Alert, Button, ToggleButtonGroup } from '@mui/material';

import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { useHelper } from '../../../../../store';
import { fetchReport, updateReportForExercise } from '../../../../../actions/reports/report-actions';
import type { ReportsHelper } from '../../../../../actions/reports/report-helper';
import type { Exercise, Report, ReportInput } from '../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../utils/hooks';
import Loader from '../../../../../components/Loader';
import { useFormatter } from '../../../../../components/i18n';
import ExportButtons from '../../../../../components/ExportButtons';

import ReportPopover from '../../../components/reports/ReportPopover';
import { ReportContextType, ReportContext } from '../../../common/Context';
import ExerciseReportForm from './ExerciseReportForm';
import { usePermissions } from '../../../../../utils/Exercise';
import { isFeatureEnabled } from '../../../../../utils/utils';
import ExerciseReportContent from './ExerciseReportContent';

const ExerciseReportPage: React.FC = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const { t } = useFormatter();
  const [loading, setLoading] = useState(true);

  const { exerciseId, reportId } = useParams() as { exerciseId: Exercise['exercise_id'], reportId: Report['report_id'] };
  const permissions = usePermissions(exerciseId);

  const { report } = useHelper((helper: ReportsHelper) => {
    return {
      report: helper.getReport(reportId),
    };
  });

  useDataLoader(() => {
    setLoading(true);
    dispatch(fetchReport(reportId)).finally(() => setLoading(false));
  });

  // Context
  const context: ReportContextType = {
    onUpdateReport: (_reportId: Report['report_id'], data: ReportInput) => dispatch(updateReportForExercise(exerciseId, reportId, data)),
    renderReportForm: (onSubmitForm, onHandleCancel, _report) => {
      return (
        <ExerciseReportForm
          onSubmit={onSubmitForm}
          handleCancel={onHandleCancel}
          initialValues={report}
          editing
        />
      );
    },
  } as ReportContextType;

  if (!isFeatureEnabled('report')) {
    return <div>{t('This page is coming soon')}</div>;
  }

  if (loading) {
    return <Loader/>;
  }
  if (!report) {
    return <Alert severity="warning">{t('This report is not available')}</Alert>;
  }
  return (
    <ReportContext.Provider value={context}>
      <div style={{ marginTop: 20, display: 'flex', flexFlow: 'wrap' }}>
        <Button
          style={{ marginLeft: 20 }}
          color="primary"
          variant="outlined"
          component={Link}
          to={`/admin/exercises/${exerciseId}`}
        >
          {t('Back to administration')}
        </Button>

        <ToggleButtonGroup style={{ marginLeft: 'auto', marginRight: 20 }}>
          <ExportButtons
            domElementId={`reportId_${reportId}`}
            name={report?.report_name}
            pixelRatio={2}
          />
          {permissions.canWrite && <ReportPopover variant={'toggle'} report={report} actions={['Update']}/>}
        </ToggleButtonGroup>

        <div style={{ width: '100%' }}>
          <ExerciseReportContent report={report} exerciseId={exerciseId} canWrite={permissions.canWrite}/>
        </div>
      </div>
    </ReportContext.Provider>
  );
};

export default ExerciseReportPage;
