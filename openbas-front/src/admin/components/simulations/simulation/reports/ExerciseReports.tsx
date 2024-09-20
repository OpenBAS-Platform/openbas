import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fab } from '@mui/material';
import { Add } from '@mui/icons-material';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { useHelper } from '../../../../../store';
import { useAppDispatch } from '../../../../../utils/hooks';
import { addReportForExercise, deleteReportForExercise, fetchReportsForExercise, updateReportForExercise } from '../../../../../actions/reports/report-actions';
import type { ReportsHelper } from '../../../../../actions/reports/report-helper';
import Reports from '../../../components/reports/Reports';
import { PermissionsContext, ReportContextType, ReportContext } from '../../../common/Context';
import type { Report, ReportInput } from '../../../../../utils/api-types';
import ExerciseReportForm from './ExerciseReportForm';
import Dialog from '../../../../../components/common/Dialog';
import { useFormatter } from '../../../../../components/i18n';

interface ReportListProps {
  exerciseId: string,
  exerciseName: string,
}

const ExerciseReports: React.FC<ReportListProps> = ({ exerciseId, exerciseName }) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const navigateToReportPage = (reportId:string) => navigate(`/reports/${exerciseId}/${reportId}`);

  const [openCreate, setOpenCreate] = useState(false);
  const handleOpenCreate = () => setOpenCreate(true);
  const handleCloseCreate = () => setOpenCreate(false);
  const onCreateReportSubmit = (data: ReportInput) => dispatch(addReportForExercise(exerciseId, data)).finally(() => handleCloseCreate());

  // Fetching data
  const reports = useHelper((helper: ReportsHelper) => helper.getExerciseReports(exerciseId));
  useDataLoader(() => {
    dispatch(fetchReportsForExercise(exerciseId));
  });

  // Context
  const { permissions } = useContext(PermissionsContext);
  const context: ReportContextType = {
    onDeleteReport: (report: Report) => dispatch(deleteReportForExercise(exerciseId, report.report_id)),
    onUpdateReport: (reportId: Report['report_id'], data: ReportInput) => dispatch(updateReportForExercise(exerciseId, reportId, data)),
    renderReportForm: (onSubmitForm, onHandleCancel, report) => {
      return (
        <ExerciseReportForm
          onSubmit={onSubmitForm}
          handleCancel={onHandleCancel}
          initialValues={report}
          editing
        />
      );
    },
  };

  return (
    <ReportContext.Provider value={context}>
      <Reports reports={reports} navigateToReportPage={navigateToReportPage}/>
      {permissions.canWrite && (
        <>
          <Fab
            onClick={handleOpenCreate}
            color="primary"
            aria-label="Add"
            sx={{ position: 'fixed', bottom: '30px', right: '30px' }}
          >
            <Add />
          </Fab>
          <Dialog
            title={t('Create a new report')}
            open={openCreate}
            handleClose={handleCloseCreate}
          >
            <ExerciseReportForm
              onSubmit={onCreateReportSubmit}
              handleCancel={handleCloseCreate}
              initialValues={{ report_name: exerciseName } as Report}
            />
          </Dialog>
        </>
      )}
    </ReportContext.Provider>
  );
};

export default ExerciseReports;
