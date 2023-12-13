import React, { FunctionComponent, useState } from 'react';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItem from '@mui/material/ListItem';
import { makeStyles } from '@mui/styles';
import { ArrowDropDownOutlined, ArrowDropUpOutlined, AssignmentTurnedIn } from '@mui/icons-material';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import * as R from 'ramda';
import { Theme } from '../../../../../components/Theme';
import InjectAddExpectationManual from './InjectAddExpectationManual';
import { Exercise } from '../../../../../utils/api-types';
import { useFormatter } from '../../../../../components/i18n';
import { ExpectationInput } from '../../../../../actions/Expectation';
import { truncate } from '../../../../../utils/String';
import ExpectationManualPopover from './ExpectationManualPopover';

const useStyles = makeStyles((theme: Theme) => ({
  item: {
    paddingLeft: 10,
    height: 50,
  },
  column: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
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
  expectationDatas: ExpectationInput[];
  handleExpectations: (expectations: ExpectationInput[]) => void;
}

const InjectExpectationsManual: FunctionComponent<InjectExpectationsProps> = ({
  exercise,
  expectationDatas,
  handleExpectations,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();

  const [expectations, setExpectations] = useState(expectationDatas ?? []);

  const handleAddExpectation = (expectation: ExpectationInput) => {
    const values = [...expectations, expectation];
    setExpectations(values);
    handleExpectations(values);
  };

  const handleUpdateExpectation = (expectation: ExpectationInput, idx: number) => {
    const values = expectations.map((item, i) => (i !== idx ? item : expectation));
    setExpectations(values);
    handleExpectations(values);
  };

  const handleRemoveExpectation = (idx: number) => {
    const values = expectations.filter((_, i) => i !== idx);
    setExpectations(values);
    handleExpectations(values);
  };

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
      isSortable: false,
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
      <div>
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
            } />
          <ListItemSecondaryAction>
          </ListItemSecondaryAction>
        </ListItem>
        {sortedExpectations?.map((expectation, idx) => (
          <ListItem
            key={idx}
            classes={{ root: classes.item }}
            divider={true}
          >
            <ListItemIcon>
              <AssignmentTurnedIn />
            </ListItemIcon>
            <ListItemText
              primary={
                <div className={classes.column}>
                  <div className={classes.bodyItem}>
                    {truncate(expectation.expectation_name || '', 22)}
                  </div>
                  <div className={classes.bodyItem}>
                    {truncate(expectation.expectation_description || '', 22)}
                  </div>
                  <div className={classes.bodyItem}>
                    {expectation.expectation_score}
                  </div>
                </div>
              } />
            <ListItemSecondaryAction>
              <ExpectationManualPopover
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
      <InjectAddExpectationManual exercise={exercise} handleAddExpectation={handleAddExpectation} />
    </>
  );
};

export default InjectExpectationsManual;
