import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Accordion, AccordionDetails, AccordionSummary, FormControl, IconButton, InputLabel, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { Add, DeleteOutlined, ExpandMore } from '@mui/icons-material';
import { useFormatter } from '../../../../components/i18n';

const useStyles = makeStyles(() => ({
    container: {
        display: 'inline-flex',
        alignItems: 'center',
    },
    importerStyle: {
        display: 'flex',
        alignItems: 'center',
        marginTop: 20,
    },
}));

const InjectForm = ({
                        props,
                        values,
                        form,
                        injects,
                    }) => {
    const classes = useStyles();
    const { t } = useFormatter();

    const [parents, setParents] = useState(injects.filter((currentInject) => currentInject.inject_id === values.inject_depends_on));
    const [childrens, setChildrens] = useState(injects.filter((currentInject) => currentInject.inject_depends_on === values.inject_id));

    const handleChangeParent = (_event, parent) => {
        const rx = /\.\$select-(.*)-inject-(.*)/g;
        const arr = rx.exec(parent.key);

        const newParents = [...parents.slice(0, arr[1]), injects[arr[2]], ...parents.slice(arr[1] + 1)];
        setParents(newParents);
    };

    const AddParent = () => {
        setParents([...parents, '']);
    };

    const handleChangeChildren = (_event, child) => {
        const rx = /\.\$select-(.*)-inject-(.*)/g;
        const arr = rx.exec(child.key);

        const newChildrens = [...childrens.slice(0, arr[1]), injects[arr[2]], ...childrens.slice(arr[1] + 1)];
        setChildrens(newChildrens);
    };

    const AddChildren = () => {
        setChildrens([...childrens, '']);
    };

    return (
        <>
            <div className={classes.importerStyle}>
                <Typography variant="h2" sx={{ m: 0 }}>
                    {t('Parent')}
                </Typography>
                <IconButton
                    color="secondary"
                    aria-label="Add"
                    size="large"
                    disabled={parents.length > 0}
                    onClick={AddParent}
                >
                    <Add fontSize="small"/>
                </IconButton>
            </div>

            {parents.map((parent, index) => {
                return (
                    <Accordion
                        key={parent.inject_id}
                        variant="outlined"
                        style={{ width: '100%', marginBottom: '10px' }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMore/>}
                        >
                            <div className={classes.container}>
                                <Typography>
                                    #{index + 1} {parent.inject_title}
                                </Typography>
                                <Tooltip title={t('Delete')}>
                                    <IconButton color="error">
                                        <DeleteOutlined fontSize="small"/>
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormControl style={{ width: '100%' }}>
                                <InputLabel id="inject_id">{t('Inject')}</InputLabel>
                                <Select
                                    labelId="condition"
                                    fullWidth={true}
                                    value={parent.inject_id}
                                    onChange={handleChangeParent}
                                >
                                    {injects.map((currentInject, selectIndex) => {
                                        return (<MenuItem key={`select-${index}-inject-${selectIndex}`} value={currentInject.inject_id}>{currentInject.inject_title}</MenuItem>);
                                    })}
                                </Select>
                            </FormControl>
                            <FormControl style={{ width: '100%' }}>
                                <InputLabel id="condition">{t('Condition')}</InputLabel>
                                <Select
                                    labelId="condition"
                                    value={'Success'}
                                    fullWidth={true}
                                    disabled
                                >
                                    <MenuItem value="Success">{t('Success')}</MenuItem>
                                </Select>
                            </FormControl>
                        </AccordionDetails>
                    </Accordion>
                );
            })}

            <div className={classes.importerStyle}>
                <Typography variant="h2" sx={{ m: 0 }}>
                    {t('Childrens')}
                </Typography>
                <IconButton
                    color="secondary"
                    aria-label="Add"
                    size="large"
                    onClick={AddChildren}
                >
                    <Add fontSize="small"/>
                </IconButton>
            </div>
            {childrens.map((children, index) => {
                return (
                    <Accordion
                        key={children.inject_id}
                        variant="outlined"
                        style={{ width: '100%', marginBottom: '10px' }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMore/>}
                        >
                            <div className={classes.container}>
                                <Typography>
                                    #{index + 1} {children.inject_title}
                                </Typography>
                                <Tooltip title={t('Delete')}>
                                    <IconButton color="error">
                                        <DeleteOutlined fontSize="small"/>
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormControl style={{ width: '100%' }}>
                                <InputLabel id="inject_id">{t('Inject')}</InputLabel>
                                <Select
                                    labelId="condition"
                                    fullWidth={true}
                                    value={childrens[index].inject_id}
                                    onChange={handleChangeChildren}
                                >
                                    {injects.map((currentInject, selectIndex) => {
                                        return (<MenuItem key={`select-${index}-inject-${selectIndex}`} value={currentInject.inject_id}>{currentInject.inject_title}</MenuItem>);
                                    })}
                                </Select>
                            </FormControl>
                            <FormControl style={{ width: '100%' }}>
                                <InputLabel id="condition">{t('Condition')}</InputLabel>
                                <Select
                                    labelId="condition"
                                    value={'Success'}
                                    fullWidth={true}
                                    disabled
                                >
                                    <MenuItem value="Success">{t('Success')}</MenuItem>
                                </Select>
                            </FormControl>
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </>
    );
};

export default InjectForm;
