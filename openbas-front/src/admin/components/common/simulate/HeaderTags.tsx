import { Button, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { AddOutlined } from '@mui/icons-material';
import { Form } from 'react-final-form';
import * as R from 'ramda';
import { FunctionComponent, useState } from 'react';
import Transition from '../../../../components/common/Transition';
import TagField from '../../../../components/TagField';
import TagChip from '../tags/TagChip';
import { useFormatter } from '../../../../components/i18n';
import { Option } from '../../../../utils/Option';

interface Props {
  tags: string[] | undefined;
  disabled?: boolean;
  updateTags: (tagIds: string[]) => void;
}

const HeaderTags: FunctionComponent<Props> = ({
  tags,
  disabled = false,
  updateTags,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const [openTagAdd, setOpenTagAdd] = useState(false);
  const handleToggleAddTag = () => setOpenTagAdd(!openTagAdd);

  const deleteTag = (tagId: string) => {
    const tagIds = tags?.filter((id: string) => id !== tagId) ?? [];
    updateTags(tagIds);
  };
  const submitTags = (values: { tags: Option[] }) => {
    handleToggleAddTag();
    updateTags(R.uniq([
      ...values.tags.map((tag) => tag.id),
      ...(tags ?? []),
    ]));
  };
  return (
    <div>
      <IconButton
        color="primary"
        aria-label="Tag"
        onClick={handleToggleAddTag}
        disabled={disabled}
      >
        <AddOutlined />
      </IconButton>
      <Dialog
        TransitionComponent={Transition}
        open={openTagAdd}
        onClose={handleToggleAddTag}
        fullWidth
        maxWidth="xs"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Add tags')}</DialogTitle>
        <DialogContent>
          <Form
            keepDirtyOnReinitialize
            initialValues={{ tags: [] }}
            onSubmit={submitTags}
            mutators={{
              setValue: ([field, value], state, { changeValue }) => {
                changeValue(state, field, () => value);
              },
            }}
          >
            {({ handleSubmit, form, values, submitting, pristine }) => (
              <form id="tagsForm" onSubmit={handleSubmit}>
                <TagField
                  name="tags"
                  label={null}
                  values={values}
                  setFieldValue={form.mutators.setValue}
                  placeholder={t('Tags')}
                />
                <div style={{ float: 'right', marginTop: 20 }}>
                  <Button
                    onClick={handleToggleAddTag}
                    style={{ marginRight: 10 }}
                    disabled={submitting}
                  >
                    {t('Cancel')}
                  </Button>
                  <Button
                    color="secondary"
                    type="submit"
                    disabled={pristine || submitting}
                  >
                    {t('Add')}
                  </Button>
                </div>
              </form>
            )}
          </Form>
        </DialogContent>
      </Dialog>
      {R.take(5, tags ?? []).map((tag: string) => (
        <TagChip
          key={tag}
          tagId={tag}
          isReadOnly={disabled}
          deleteTag={deleteTag}
        />
      ))}
    </div>
  );
};

export default HeaderTags;
