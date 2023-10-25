import { setIn } from 'final-form';

const schemaValidator = (schema) => async (values) => {
  try {
    await schema.validate(values, { abortEarly: false });
  } catch (e) {
    return e.inner.reduce((errors, error) => {
      return setIn(errors, error.path, error.message);
    }, {});
  }
  return {};
};

export default schemaValidator;
