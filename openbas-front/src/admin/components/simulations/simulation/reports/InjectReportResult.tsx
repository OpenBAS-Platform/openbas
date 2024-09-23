import React, { useEffect, CSSProperties, useState, useRef } from 'react';
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import { SubmitHandler } from 'react-hook-form';
import { useFormatter } from '../../../../../components/i18n';
import type { InjectResultDTO, ReportInjectComment } from '../../../../../utils/api-types';
import ItemTargets from '../../../../../components/ItemTargets';
import AtomicTestingResult from '../../../atomic_testings/atomic_testing/AtomicTestingResult';
import InjectorContract from '../../../common/injects/InjectorContract';

interface Props {
  style?: CSSProperties;
  injects: InjectResultDTO[];
  initialInjectComments?: ReportInjectComment[];
  canEditComment?: boolean;
  onCommentSubmit?: SubmitHandler<ReportInjectComment>;
}

const InjectReportResult: React.FC<Props> = ({
  style,
  injects,
  initialInjectComments = [],
  canEditComment = false,
  onCommentSubmit = () => {},
}) => {
  // Standard hooks
  const { t, fldt, tPick } = useFormatter();

  const inputRef = useRef<HTMLInputElement>(null);
  const [injectsComments, setInjectsComments] = useState<ReportInjectComment[]>(initialInjectComments);
  const [editInjectId, setEditInjectId] = useState<InjectResultDTO['inject_id'] | null>(null);

  const findInjectCommentsByInjectId = (injectId: InjectResultDTO['inject_id']) => (injectsComments ?? []).find((c) => c.inject_id === injectId);

  const handleCommentChange = (injectCommentEdited: ReportInjectComment | null, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editInjectId) return;

    const newCommentValue = e.target.value;

    setInjectsComments((prevComments) => {
      if (injectCommentEdited) {
        return prevComments.map((comment) => (comment.inject_id === injectCommentEdited.inject_id
          ? { ...comment, report_inject_comment: newCommentValue }
          : comment));
      }
      return [
        ...prevComments,
        {
          inject_id: editInjectId,
          report_inject_comment: newCommentValue,
        },
      ];
    });
  };

  useEffect(() => {
    if (inputRef.current && editInjectId) {
      inputRef.current.setSelectionRange(
        findInjectCommentsByInjectId(editInjectId)?.report_inject_comment?.length || 0,
        findInjectCommentsByInjectId(editInjectId)?.report_inject_comment?.length || 0,
      );
    }
  }, [editInjectId, injectsComments]);

  const saveComment = () => {
    if (!editInjectId) return;
    const editedComments = findInjectCommentsByInjectId(editInjectId);
    if (editedComments) {
      onCommentSubmit(editedComments);
      setEditInjectId(null);
    }
  };

  const columns = [
    {
      label: 'Type',
      render: (inject: InjectResultDTO) => {
        return inject.inject_injector_contract
          ? <InjectorContract variant="list" label={tPick(inject.inject_injector_contract?.injector_contract_labels)} />
          : <InjectorContract variant="list" label={t('Deleted')} deleted={true} />;
      },
    },
    {
      label: 'Title',
      render: (inject: InjectResultDTO) => inject.inject_title,
    },
    {
      label: 'Execution date',
      render: (inject: InjectResultDTO) => <>{fldt(inject.inject_status?.tracking_sent_date)}</>,
    },
    {
      label: 'Scores',
      render: (inject: InjectResultDTO) => <AtomicTestingResult expectations={inject.inject_expectation_results} />,
    },
    {
      label: 'Targets',
      render: (inject: InjectResultDTO) => <ItemTargets targets={inject.inject_targets} />,
    },
    {
      label: 'Comments',
      render: (inject: InjectResultDTO) => {
        const currentInjectComment = findInjectCommentsByInjectId(inject.inject_id);

        return (editInjectId === inject.inject_id
          ? <TextField
              inputRef={inputRef}
              value={currentInjectComment?.report_inject_comment}
              onChange={(value: React.ChangeEvent<HTMLInputElement>) => handleCommentChange(currentInjectComment ?? null, value)}
              multiline
              variant="outlined"
              fullWidth
              autoFocus
              onBlur={saveComment}
              sx={{
                '& .MuiOutlinedInput-root': {
                  border: 'none', // Removes the border
                  outline: 'none', // Removes the outline
                  boxShadow: 'none', // Removes any shadow
                  padding: '0px', // Adjust padding for textarea
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none', // Removes the notched outline
                },
                '& .MuiInputBase-input': {
                  fontWeight: 400,
                  lineHeight: '1.43',
                  fontSize: '0.8rem',
                  padding: '0', // Optional: Remove padding inside input
                },
              }}
            /> : currentInjectComment?.report_inject_comment);
      },
    },
  ];

  return (
    <div style={style}>
      <Typography variant="h4" gutterBottom>
        {t('Injects results')}
      </Typography>

      <TableContainer component={Paper}>
        <Table aria-label="injects results">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  sx={col.label === 'Comment' ? { padding: '0px', width: '35%', flexGrow: 1 } : {}}
                  key={col.label}
                > {t(col.label)} </TableCell>))}
            </TableRow>
          </TableHead>
          <TableBody>
            {injects.map((inject) => (
              <TableRow
                key={inject.inject_id}
              >
                {columns.map((col) => (
                  <TableCell
                    sx={col.label === 'Comments' ? { padding: '8px 0 8px 0', width: '35%', flexGrow: 1 } : {}}
                    key={`${inject.inject_id}-${col.label}`}
                  >
                    {col.render(inject)}
                  </TableCell>))
                }
                { canEditComment && editInjectId !== inject.inject_id
                  ? <TableCell key={`${inject.inject_id}-edit}`} sx={{ padding: '0px', width: '45px' }} align="right">
                    <IconButton color="primary" onClick={() => setEditInjectId(inject.inject_id)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell> : <TableCell sx={{ padding: '0px', width: '45px' }}></TableCell>
                 }
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default InjectReportResult;
