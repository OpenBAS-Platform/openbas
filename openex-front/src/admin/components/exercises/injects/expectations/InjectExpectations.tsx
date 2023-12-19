import React, { FunctionComponent, useState } from 'react';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItem from '@mui/material/ListItem';
import { makeStyles } from '@mui/styles';
import { ArrowDropDownOutlined, ArrowDropUpOutlined, AssignmentTurnedIn } from '@mui/icons-material';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import * as R from 'ramda';
import { NewspaperVariantMultipleOutline } from 'mdi-material-ui';
import type { Theme } from '../../../../../components/Theme';
import InjectAddExpectation from './InjectAddExpectation';
import type { Exercise } from '../../../../../utils/api-types';
import { useFormatter } from '../../../../../components/i18n';
import { truncate } from '../../../../../utils/String';
import ExpectationPopover from './ExpectationPopover';
import type { ExpectationInput } from './Expectation';

const useStyles = makeStyles((theme: Theme) => ({
  item: {
    paddingLeft: 10,
    height: 50,
  },
  column: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
  },
  header: {
    display: 'inline-flex',
    placeItems: 'center',
    gap: 5,
    fontSize: theme.typography.h4.fontSize,
    fontWeight: 700,
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  bodyItem: {
    fontSize: theme.typography.h3.fontSize,
  },
}));

interface InjectExpectationsProps {
  exercise: Exercise;
  predefinedExpectationDatas: ExpectationInput[];
  expectationDatas: ExpectationInput[];
  handleExpectations: (expectations: ExpectationInput[]) => void;
}

const InjectExpectations: FunctionComponent<InjectExpectationsProps> = ({
  exercise,
  predefinedExpectationDatas,
  expectationDatas,
  handleExpectations,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();

  const [expectations, setExpectations] = useState(expectationDatas ?? []);

  const predefinedExpectations = predefinedExpectationDatas
    .filter((pe) => !expectations.map((e) => e.expectation_type).includes(pe.expectation_type));

  const headers = [
    {
      field: 'expectation_name',
      label: 'Name',
      isSortable: true,
    },
    {
      field: 'expectation_description',
      label: 'Description',
      isSortable: true,
    },
    {
      field: 'expectation_score',
      label: 'Score',
      isSortable: true,
    },
    {
      field: 'expectation_type',
      label: 'Type',
      isSortable: true,
    },
  ];

  // -- SORT HEADERS --

  const [sortBy, setSortBy] = useState('expectation_name');
  const [sortAsc, setSortAsc] = useState(true);

  const sortComponent = (asc: boolean) => {
    return asc ? (
      <ArrowDropDownOutlined />
    ) : (
      <ArrowDropUpOutlined />
    );
  };

  const reverseBy = (field: string) => {
    setSortBy(field);
    setSortAsc(!sortAsc);
  };

  const sortHeader = (header: { field: string, label: string, isSortable: boolean }) => {
    if (header.isSortable) {
      return (
        <div className={classes.header} onClick={() => reverseBy(header.field)}>
          <span>{t(header.label)}</span>
          {sortBy === header.field ? sortComponent(sortAsc) : ''}
        </div>
      );
    }
    return (
      <div className={classes.header}>
        <span>{t(header.label)}</span>
      </div>
    );
  };

  const sortExpectations = R.sortWith(
    sortAsc
      ? [R.ascend(R.prop(sortBy))]
      : [R.descend(R.prop(sortBy))],
  );
  const sortedExpectations: ExpectationInput[] = sortExpectations(expectations);

  // -- ACTIONS --

  const handleAddExpectation = (expectation: ExpectationInput) => {
    const values = [...sortedExpectations, expectation];
    setExpectations(values);
    handleExpectations(values);
  };

  const handleUpdateExpectation = (expectation: ExpectationInput, idx: number) => {
    const values = sortedExpectations.map((item, i) => (i !== idx ? item : expectation));
    setExpectations(values);
    handleExpectations(values);
  };

  const handleRemoveExpectation = (idx: number) => {
    const values = sortedExpectations.filter((_, i) => i !== idx);
    setExpectations(values);
    handleExpectations(values);
  };

  // -- UTILS --

  const typeLabel = (type: string) => {
    if (type === 'ARTICLE') {
      return t('Automatic');
    }
    return t('Manual');
  };

  const typeIcon = (type: string) => {
    if (type === 'ARTICLE') {
      return <NewspaperVariantMultipleOutline />;
    }
    return <AssignmentTurnedIn />;
  };

  return (
    <>
      <List>
        <ListItem classes={{ root: classes.item }}>
          <ListItemIcon>
          </ListItemIcon>
          <ListItemText
            primary={
              <div className={classes.column}>
                {headers.map((header) => (sortHeader(header)))}
              </div>
            }
          />
          <ListItemSecondaryAction>
          </ListItemSecondaryAction>
        </ListItem>
        {sortedExpectations.map((expectation, idx) => (
          <ListItem
            key={idx}
            classes={{ root: classes.item }}
            divider={true}
          >
            <ListItemIcon>
              {typeIcon(expectation.expectation_type)}
            </ListItemIcon>
            <ListItemText
              primary={
                <div className={classes.column}>
                  <div className={classes.bodyItem}>
                    {truncate(expectation.expectation_name || '', 40)}
                  </div>
                  <div className={classes.bodyItem}>
                    {truncate(expectation.expectation_description || '', 15)}
                  </div>
                  <div className={classes.bodyItem}>
                    {expectation.expectation_score}
                  </div>
                  <div className={classes.bodyItem}>
                    {typeLabel(expectation.expectation_type)}
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <ExpectationPopover
                index={idx}
                exercise={exercise}
                expectation={expectation}
                handleUpdate={handleUpdateExpectation}
                handleDelete={handleRemoveExpectation}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <InjectAddExpectation
        exercise={exercise}
        handleAddExpectation={handleAddExpectation}
        predefinedExpectations={predefinedExpectations}
      />
    </>
  );
};

export default InjectExpectations;
