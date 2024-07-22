import React, { FunctionComponent, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { ControlPointOutlined } from '@mui/icons-material';
import { useFormatter } from '../../../../../../components/i18n';
import LessonsTemplateQuestionForm, { LessonsTemplateQuestionInputForm } from './LessonsTemplateQuestionForm';
import { addLessonsTemplateQuestion } from '../../../../../../actions/Lessons';
import Drawer from '../../../../../../components/common/Drawer';
import { useAppDispatch } from '../../../../../../utils/hooks';
import type { LessonsTemplateCategory } from '../../../../../../utils/api-types';
import type { Theme } from '../../../../../../components/Theme';

interface Props {
  lessonsTemplateId: string;
  lessonsTemplateCategoryId: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  text: {
    fontSize: 15,
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
}));

const CreateLessonsTemplateQuestion: FunctionComponent<Props> = ({
  lessonsTemplateId,
  lessonsTemplateCategoryId,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const onSubmit = (data: LessonsTemplateQuestionInputForm) => {
    return dispatch(
      addLessonsTemplateQuestion(
        lessonsTemplateId,
        lessonsTemplateCategoryId,
        data,
      ),
    ).then((result: { result: string, entities: { lessonstemplatequestions: Record<string, LessonsTemplateCategory> } }) => {
      if (result.result) {
        return handleClose();
      }
      return result;
    });
  };
  return (
    <>
      <ListItemButton
        divider
        onClick={handleOpen}
        color="primary"
      >
        <ListItemIcon color="primary">
          <ControlPointOutlined color="primary" />
        </ListItemIcon>
        <ListItemText
          primary={t('Create a new lessons learned question')}
          classes={{ primary: classes.text }}
        />
      </ListItemButton>
      <Drawer
        open={open}
        handleClose={handleClose}
        title={t('Create a new lessons learned question')}
      >
        <LessonsTemplateQuestionForm onSubmit={onSubmit} handleClose={handleClose} />
      </Drawer>
    </>
  );
};

export default CreateLessonsTemplateQuestion;
