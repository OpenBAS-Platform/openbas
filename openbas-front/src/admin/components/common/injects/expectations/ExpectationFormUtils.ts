import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UseFormProps } from 'react-hook-form';
import { zodImplement } from '../../../../../utils/Zod';
import type { ExpectationInput } from './Expectation';

export const infoMessage = (type: string, t: (key: string) => string) => {
  if (type === 'ARTICLE') {
    return t('This expectation is handled automatically by the platform and triggered when target reads the articles');
  }
  return '';
};

export const formProps = (initialValues: ExpectationInput, t: (key: string) => string): UseFormProps<ExpectationInput> => ({
  mode: 'onTouched',
  resolver: zodResolver(zodImplement<ExpectationInput>().with({
    expectation_type: z.string(),
    expectation_name: z.string().min(1, { message: t('Should not be empty') }),
    expectation_description: z.string().optional(),
    expectation_score: z.coerce.number().min(1, 'Score must be greater than 0'),
    expectation_expectation_group: z.coerce.boolean(),
  })),
  defaultValues: initialValues,
});
