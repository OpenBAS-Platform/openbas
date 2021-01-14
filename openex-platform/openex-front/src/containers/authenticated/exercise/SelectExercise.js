import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import { i18nRegister } from '../../../utils/Messages';

i18nRegister({
  fr: {
    'Simple exercise': 'Exercice simple',
    'Standard exercise': 'Exercice standard',
  },
});

const styles = {
  tabDesc: {
    padding: '30px',
    fontSize: '16px',
    textAlign: 'center',
    color: 'black',
  },
  tabs: {
    marginTop: '15px',
  },
  buttons: {
    float: 'right',
  },
};

class SelectExercise extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabs: 'tabStandardExercise',
    };
  }

  handleChangeTabs(tab) {
    this.changeValuesTabs(tab.props.value);
  }

  changeValuesTabs(val) {
    this.setState({ tabs: val });
    this.props.change('tabs', val);
  }

  handleSelectStandardExercise() {
    this.props.createStandardExercise();
  }

  handleSelectSimpleExercise() {
    this.props.createSimpleExercise();
  }

  handleCloseSelect() {
    this.props.closeSelect();
  }

  handleImportExercise() {
    this.props.importExercise();
  }

  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <Tabs style={styles.tabs}>
          <Tab
            label="Exercice standard"
            value="tabStandardExercise"
            onActive={this.handleChangeTabs.bind(this)}
          >
            <div style={styles.tabDesc}>
              Un exercice standard est un exercice répondant à la norme ISO
              22301, permettant de manier plusieurs événements et plusieurs
              audiences.
            </div>
            <div style={styles.buttons}>
              <Button
                label="Cancel"
                primary={true}
                onClick={this.props.closeSelect}
              />
              <Button
                label="Import"
                primary={true}
                onClick={this.props.importExercise}
              />
              <Button
                label="Create"
                primary={true}
                onClick={this.props.createStandardExercise}
              />
            </div>
          </Tab>
          <Tab
            label="Exercice simple"
            value="tabSimpleExercise"
            onActive={this.handleChangeTabs.bind(this)}
          >
            <div style={styles.tabDesc}>
              Un exercice simple est un exercice réduit à un seul événement et
              une seule audience.
            </div>
            <div style={styles.buttons}>
              <Button
                label="Cancel"
                primary={true}
                onClick={this.props.closeSelect}
              />
              <Button
                label="Import"
                primary={true}
                onClick={this.props.importExercise}
              />
              <Button
                label="Create"
                primary={true}
                onClick={this.props.createSimpleExercise}
              />
            </div>
          </Tab>
        </Tabs>
      </form>
    );
  }
}

SelectExercise.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  createSimpleExercise: PropTypes.func,
  createStandardExercise: PropTypes.func,
  closeSelect: PropTypes.func,
  importExercise: PropTypes.func,
};

export default SelectExercise;
