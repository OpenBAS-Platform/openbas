import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withStyles } from '@mui/styles';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import OldTextField from '../../../../components/fields/OldTextField';
import inject18n from '../../../../components/i18n';

const styles = (theme) => ({
    duration: {
        marginTop: 20,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: 4,
        padding: 15,
    },
    durationDisabled: {
        marginTop: 20,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        border: `1px solid ${theme.palette.action.disabled}`,
        borderRadius: 4,
        padding: 15,
    },
    trigger: {
        fontFamily: 'Consolas, monaco, monospace',
        fontSize: 12,
        paddingTop: 15,
        color: theme.palette.primary.main,
    },
    triggerDisabled: {
        fontFamily: 'Consolas, monaco, monospace',
        fontSize: 12,
        paddingTop: 15,
        color: theme.palette.action.disabled,
    },
    icon: {
        paddingTop: 4,
        display: 'inline-block',
    },
    text: {
        display: 'inline-block',
        flexGrow: 1,
        marginLeft: 10,
    },
    autoCompleteIndicator: {
        display: 'none',
    },
});

class InjectForm extends Component {
    render() {
        const {
            t,
            values,
            form,
            injects,
        } = this.props;

        const handleChange = (event) => {
            form.mutators.setValue('inject_depends_to', event.target.value);
        };

        return (
            <>
                <OldTextField
                    variant="standard"
                    name="inject_title"
                    fullWidth={true}
                    label={t('From')}
                    disabled
                />

                <FormControl style={{ width: '100%', paddingTop: '20px' }}>
                    <InputLabel id="condition" style={{ paddingTop: '30px' }}>{t('Condition')}</InputLabel>
                    <Select
                        labelId="condition"
                        value={'Success'}
                        fullWidth={true}
                        disabled
                    >
                        <MenuItem value="Success">{t('Success')}</MenuItem>
                    </Select>
                </FormControl>
                <FormControl style={{ width: '100%', paddingTop: '20px' }}>
                    <InputLabel id="to" style={{ paddingTop: '30px' }}>{t('To')}</InputLabel>
                    <Select
                        variant="standard"
                        labelId="to"
                        fullWidth={true}
                        value={values.inject_depends_to}
                        onChange={handleChange}
                        multiple
                    >
                        <MenuItem key={'null'} value={null}>{t('-')}</MenuItem>
                        {
                            injects.map((inject) => {
                                return <MenuItem key={inject.inject_id} value={inject.inject_id}>{inject.inject_title}</MenuItem>;
                            })
                        }
                    </Select>
                </FormControl>
            </>
        );
    }
}

InjectForm.propTypes = {
    classes: PropTypes.object,
    t: PropTypes.func,
    tPick: PropTypes.func,
    injects: PropTypes.object,
};

export default R.compose(inject18n, withStyles(styles))(InjectForm);
