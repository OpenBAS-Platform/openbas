import * as schema from './Schema';
import { getReferential, putReferential, postReferential, delReferential } from '../utils/Action';

export const fetchLessonsTemplates = () => (dispatch) => {
  const uri = '/api/lessons_templates';
  return getReferential(schema.arrayOfLessonsTemplates, uri)(dispatch);
};

export const updateLessonsTemplate = (lessonsTemplateId, data) => (dispatch) => {
  const uri = `/api/lessons_templates/${lessonsTemplateId}`;
  return putReferential(schema.lessonsTemplate, uri, data)(dispatch);
};

export const addLessonsTemplate = (data) => (dispatch) => {
  const uri = '/api/lessons_templates';
  return postReferential(schema.lessonsTemplate, uri, data)(dispatch);
};

export const deleteLessonsTemplate = (lessonsTemplateId) => (dispatch) => {
  const uri = `/api/lessons_templates/${lessonsTemplateId}`;
  return delReferential(uri, 'lessons_templates', lessonsTemplateId)(dispatch);
};

export const fetchLessonsTemplateCategories = (lessonsTemplateId) => (dispatch) => {
  const uri = `/api/lessons_templates/${lessonsTemplateId}/lessons_template_categories`;
  return getReferential(
    schema.arrayOfLessonsTemplateCategories,
    uri,
  )(dispatch);
};

export const updateLessonsTemplateCategory = (lessonsTemplateId, lessonsTemplateCategoryId, data) => (dispatch) => {
  const uri = `/api/lessons_templates/${lessonsTemplateId}/lessons_template_categories/${lessonsTemplateCategoryId}`;
  return putReferential(schema.lessonsTemplateCategory, uri, data)(dispatch);
};

export const addLessonsTemplateCategory = (lessonsTemplateId, data) => (dispatch) => {
  const uri = `/api/lessons_templates/${lessonsTemplateId}/lessons_template_categories`;
  return postReferential(schema.lessonsTemplateCategory, uri, data)(dispatch);
};

export const deleteLessonsTemplateCategory = (lessonsTemplateId, lessonsTemplateCategoryId) => (dispatch) => {
  const uri = `/api/lessons_templates/${lessonsTemplateId}/lessons_template_categories/${lessonsTemplateCategoryId}`;
  return delReferential(
    uri,
    'lessonstemplatecategorys',
    lessonsTemplateCategoryId,
  )(dispatch);
};

export const fetchLessonsTemplateQuestions = (lessonsTemplateId) => (dispatch) => {
  const uri = `/api/lessons_templates/${lessonsTemplateId}/lessons_template_questions`;
  return getReferential(
    schema.arrayOfLessonsTemplateQuestions,
    uri,
  )(dispatch);
};

export const updateLessonsTemplateQuestion = (
  lessonsTemplateId,
  lessonsTemplateCategoryId,
  lessonsTemplateQuestionId,
  data,
) => (dispatch) => {
  const uri = `/api/lessons_templates/${lessonsTemplateId}/lessons_template_categories/${lessonsTemplateCategoryId}/lessons_template_questions/${lessonsTemplateQuestionId}`;
  return putReferential(schema.lessonsTemplateQuestion, uri, data)(dispatch);
};

export const addLessonsTemplateQuestion = (lessonsTemplateId, lessonsTemplateCategoryId, data) => (dispatch) => {
  const uri = `/api/lessons_templates/${lessonsTemplateId}/lessons_template_categories/${lessonsTemplateCategoryId}/lessons_template_questions`;
  return postReferential(schema.lessonsTemplateQuestion, uri, data)(dispatch);
};

export const deleteLessonsTemplateQuestion = (lessonsTemplateId, lessonsTemplateCategoryId, lessonsTemplateQuestionId) => (dispatch) => {
  const uri = `/api/lessons_templates/${lessonsTemplateId}/lessons_template_categories/${lessonsTemplateCategoryId}/lessons_template_questions/${lessonsTemplateQuestionId}`;
  return delReferential(
    uri,
    'lessonstemplatequestions',
    lessonsTemplateQuestionId,
  )(dispatch);
};

export const fetchLessonsCategories = (exerciseId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/lessons_categories`;
  return getReferential(schema.arrayOfLessonsCategories, uri)(dispatch);
};

export const updateLessonsCategory = (exerciseId, lessonsCategoryId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/lessons_categories/${lessonsCategoryId}`;
  return putReferential(schema.lessonsCategory, uri, data)(dispatch);
};

export const updateLessonsCategoryAudiences = (exerciseId, lessonsCategoryId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/lessons_categories/${lessonsCategoryId}/audiences`;
  return putReferential(schema.lessonsCategory, uri, data)(dispatch);
};

export const addLessonsCategory = (exerciseId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/lessons_categories`;
  return postReferential(schema.lessonsCategory, uri, data)(dispatch);
};

export const deleteLessonsCategory = (exerciseId, lessonsCategoryId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/lessons_categories/${lessonsCategoryId}`;
  return delReferential(uri, 'lessonscategorys', lessonsCategoryId)(dispatch);
};

export const applyLessonsTemplate = (exerciseId, lessonsTemplateId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/lessons_apply_template/${lessonsTemplateId}`;
  return postReferential(schema.arrayOfLessonsCategories, uri, {})(dispatch);
};

export const fetchLessonsQuestions = (exerciseId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/lessons_questions`;
  return getReferential(schema.arrayOfLessonsQuestions, uri)(dispatch);
};

export const updateLessonsQuestion = (exerciseId, lessonsCategoryId, lessonsQuestionId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/lessons_categories/${lessonsCategoryId}/lessons_questions/${lessonsQuestionId}`;
  return putReferential(schema.lessonsQuestion, uri, data)(dispatch);
};

export const addLessonsQuestion = (exerciseId, lessonsCategoryId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/lessons_categories/${lessonsCategoryId}/lessons_questions`;
  return postReferential(schema.lessonsQuestion, uri, data)(dispatch);
};

export const deleteLessonsQuestion = (exerciseId, lessonsCategoryId, lessonsQuestionId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/lessons_categories/${lessonsCategoryId}/lessons_questions/${lessonsQuestionId}`;
  return delReferential(uri, 'lessonsquestions', lessonsQuestionId)(dispatch);
};

export const resetLessonsAnswers = (exerciseId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/lessons_answers_reset`;
  return postReferential(schema.arrayOfLessonsCategories, uri, {})(dispatch);
};

export const emptyLessonsCategories = (exerciseId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/lessons_empty`;
  return postReferential(schema.arrayOfLessonsCategories, uri, {})(dispatch);
};

export const sendLessons = (exerciseId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/lessons_send`;
  return postReferential(schema.arrayOfLessonsCategories, uri, data)(dispatch);
};

export const fetchLessonsAnswers = (exerciseId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/lessons_answers`;
  return getReferential(schema.arrayOfLessonsAnswers, uri)(dispatch);
};

export const fetchPlayerLessonsCategories = (exerciseId, userId) => (dispatch) => {
  const uri = `/api/player/lessons/${exerciseId}/lessons_categories?userId=${userId}`;
  return getReferential(schema.arrayOfLessonsCategories, uri)(dispatch);
};

export const fetchPlayerLessonsQuestions = (exerciseId, userId) => (dispatch) => {
  const uri = `/api/player/lessons/${exerciseId}/lessons_questions?userId=${userId}`;
  return getReferential(schema.arrayOfLessonsQuestions, uri)(dispatch);
};

export const fetchPlayerLessonsAnswers = (exerciseId, userId) => (dispatch) => {
  const uri = `/api/player/lessons/${exerciseId}/lessons_answers?userId=${userId}`;
  return getReferential(schema.arrayOfLessonsAnswers, uri)(dispatch);
};

export const addLessonsAnswers = (exerciseId, lessonsCategoryId, lessonsQuestionId, data, userId) => (dispatch) => {
  const uri = `/api/player/lessons/${exerciseId}/lessons_categories/${lessonsCategoryId}/lessons_questions/${lessonsQuestionId}/lessons_answers?userId=${userId}`;
  return postReferential(schema.arrayOfLessonsAnswers, uri, data)(dispatch);
};
