import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import inject18n from '../../../components/i18n';
import { ColorPickerField } from '../../../components/ColorPickerField';
import { Select } from '../../../components/Select';
import { TextField } from '../../../components/TextField';

class MediaParametersForm extends Component {
  render() {
    const { t, onSubmit, initialValues } = this.props;
    return (
      <Form
        keepDirtyOnReinitialize={true}
        initialValues={initialValues}
        onSubmit={onSubmit}
        mutators={{
          setValue: ([field, value], state, { changeValue }) => {
            changeValue(state, field, () => value);
          },
        }}
      >
        {({ handleSubmit, submitting, pristine }) => (
          <form id="mediaParametersForm" onSubmit={handleSubmit}>
            <Grid container={true} spacing={3}>
              <Grid item={true} xs={6}>
                <Select
                  variant="standard"
                  label={t('Type')}
                  name="media_type"
                  fullWidth={true}
                >
                  <MenuItem key="newspaper" value="newspaper">
                    {t('newspaper')}
                  </MenuItem>
                  <MenuItem key="microblogging" value="microblogging">
                    {t('microblogging')}
                  </MenuItem>
                  <MenuItem key="tv" value="tv">
                    {t('tv')}
                  </MenuItem>
                </Select>
                <TextField
                  variant="standard"
                  name="media_name"
                  fullWidth={true}
                  label={t('Name')}
                  style={{ marginTop: 20 }}
                />
                <ColorPickerField
                  variant="standard"
                  name="media_primary_color_dark"
                  fullWidth={true}
                  label={t('Primary color (dark)')}
                  style={{ marginTop: 20 }}
                />
                <ColorPickerField
                  variant="standard"
                  name="media_secondary_color_dark"
                  fullWidth={true}
                  label={t('Secondary color (dark)')}
                  style={{ marginTop: 20 }}
                />
              </Grid>
              <Grid item={true} xs={6}>
                <TextField
                  variant="standard"
                  name="media_description"
                  fullWidth={true}
                  label={t('Subtitle')}
                />
                <TextField
                  variant="standard"
                  name="media_text"
                  fullWidth={true}
                  label={t('Text')}
                  style={{ marginTop: 20 }}
                />
                <ColorPickerField
                  variant="standard"
                  name="media_primary_color_light"
                  fullWidth={true}
                  label={t('Primary color (light)')}
                  style={{ marginTop: 18 }}
                />
                <ColorPickerField
                  variant="standard"
                  name="media_secondary_color_light"
                  fullWidth={true}
                  label={t('Secondary color (light)')}
                  style={{ marginTop: 20 }}
                />
              </Grid>
            </Grid>
            <div style={{ marginTop: 20 }}>
              <Button
                variant="contained"
                color="secondary"
                type="submit"
                disabled={pristine || submitting}
              >
                {t('Update')}
              </Button>
            </div>
          </form>
        )}
      </Form>
    );
  }
}

MediaParametersForm.propTypes = {
  t: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
};

export default inject18n(MediaParametersForm);
