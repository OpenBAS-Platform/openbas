import { z } from 'zod';

type ZodImplements<Model> = {
  [key in keyof Model]-?: undefined extends Model[key]
    ? null extends Model[key]
      ? z.ZodNullableType<z.ZodOptionalType<z.ZodType<Model[key]>>>
      : z.ZodOptionalType<z.ZodType<Model[key]>>
    : null extends Model[key]
      ? z.ZodNullableType<z.ZodType<Model[key]>>
      : z.ZodType<Model[key]>;
};

export function zodImplement<Model = never>() {
  return {
    with: <
      Schema extends ZodImplements<Model> & {
        [unknownKey in Exclude<keyof Schema, keyof Model>]: never;
      },
    >(
      schema: Schema,
    ) => z.object(schema),
  };
}
