import { Controller, useFormContext } from 'react-hook-form';

import TagField from './TagField';

interface Props {
  name: string;
  label: string;
}

const TagFieldController = ({ name, label }: Props) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <TagField
          label={label}
          fieldValue={value ?? []}
          fieldOnChange={onChange}
          error={error}
        />
      )}
    />
  );
};

export default TagFieldController;
