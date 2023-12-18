import { zodResolver } from '@hookform/resolvers/zod';
import { zodImplement } from '../../../../../utils/Zod';
import { ExpectationInput } from '../../../../../actions/Expectation';
import { z } from 'zod';
import { UseFormProps } from 'react-hook-form';

export const infoMessage = (type: string, t: (key: string) => string) => {
  if (type === 'ARTICLE') {
    return t('This expectation is handled automatically by the platform and triggered when audience reads articles');
  }
  return '';
};

export const formProps = (initialValues: ExpectationInput): UseFormProps<ExpectationInput> => ({
  mode: 'onTouched',
  resolver: zodResolver(zodImplement<ExpectationInput>().with({
    expectation_type: z.string(),
    expectation_name: z.string().min(1, { message: 'Should not be empty' }),
    expectation_description: z.string().optional(),
    expectation_score: z.coerce.number(),
  })),
  defaultValues: initialValues,
});
