import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import withStyles from '@mui/styles/withStyles';
import Slide from '@mui/material/Slide';
import { Add } from '@mui/icons-material';
import { i18nRegister } from '../../../../utils/Messages';
import { T } from '../../../../components/I18n';
import { downloadFile } from '../../../../actions/File';
import {
  addInject,
  updateInject,
  deleteInject,
} from '../../../../actions/Inject';
import InjectForm from './InjectForm';
import InjectContentForm from './InjectContentForm';
import InjectAudiences from './InjectAudiences';
import { submitForm } from '../../../../utils/Action';
import { addExercise } from '../../../../actions/Exercise';
import inject18n from '../../../../components/i18n';

i18nRegister({
  fr: {
    '1. Parameters': '1. Paramètres',
    '2. Content': '2. Contenu',
    '3. Audiences': '3. Audiences',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = () => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
});

class CreateInject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      stepIndex: 0,
      finished: false,
      type: 'openex_manual',
      injectData: null,
      injectAttachments: [],
    };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({
      open: false,
      stepIndex: 0,
      finished: false,
      type: 'openex_manual',
      injectData: null,
      injectAttachments: [],
    });
  }

  onGlobalSubmit(data) {
    this.setState({ injectData: data }, () => this.selectContent());
  }

  onContentAttachmentAdd(file) {
    this.setState({
      injectAttachments: R.append(file, this.state.injectAttachments),
    });
  }

  onContentAttachmentDelete(name, event) {
    event.stopPropagation();
    this.setState({
      injectAttachments: R.filter(
        (a) => a.document_name !== name,
        this.state.injectAttachments,
      ),
    });
  }

  onContentSubmit(data) {
    const { injectData } = this.state;
    // eslint-disable-next-line no-param-reassign
    data.attachments = this.state.injectAttachments;
    injectData.inject_content = data;
    this.setState({ injectData }, () => this.selectAudiences());
  }

  onAudiencesChange(data) {
    const { injectData } = this.state;
    injectData.inject_audiences = data;
    this.setState({ injectData });
  }

  onSelectAllAudiences(value) {
    const { injectData } = this.state;
    injectData.inject_all_audiences = value;
    this.setState({ injectData });
  }

  handleNext() {
    switch (this.state.stepIndex) {
      case 0:
        submitForm('injectForm');
        break;
      case 1:
        submitForm('contentForm');
        break;
      case 2:
        this.createInject();
        break;
      default:
        break;
    }
  }

  createInject() {
    const data = this.state.injectData;
    this.props.addInject(this.props.exerciseId, data).then(() => {
      // this.props.fetchIncident(
      //   this.props.exerciseId,
      // );
    });
    this.handleClose();
  }

  onInjectTypeChange(event) {
    this.setState({ type: event.target.value });
  }

  selectContent() {
    this.setState({ stepIndex: 1 });
  }

  selectAudiences() {
    this.setState({ stepIndex: 2, finished: true });
  }

  downloadAttachment(fileId, fileName) {
    return this.props.downloadFile(fileId, fileName);
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <InjectForm
            onSubmit={this.onGlobalSubmit.bind(this)}
            onInjectTypeChange={this.onInjectTypeChange.bind(this)}
            types={this.props.inject_types}
          />
        );
      case 1:
        return (
          <InjectContentForm
            types={this.props.inject_types}
            type={this.state.type}
            onSubmit={this.onContentSubmit.bind(this)}
            onContentAttachmentAdd={this.onContentAttachmentAdd.bind(this)}
            onContentAttachmentDelete={this.onContentAttachmentDelete.bind(
              this,
            )}
            downloadAttachment={this.downloadAttachment.bind(this)}
            attachments={this.state.injectAttachments}
          />
        );
      case 2:
        return (
          <InjectAudiences
            exerciseId={this.props.exerciseId}
            onChangeAudiences={this.onAudiencesChange.bind(this)}
            onChangeSelectAll={this.onSelectAllAudiences.bind(this)}
            audiences={this.props.audiences}
            injectAudiencesIds={[]}
            selectAll={false}
          />
        );
      default:
        return 'Go away!';
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Fab
          onClick={this.handleOpen.bind(this)}
          color="secondary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add />
        </Fab>
        <Dialog
          open={this.state.open}
          TransitionComponent={Transition}
          onClose={this.handleClose.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>
            <Stepper linear={false} activeStep={this.state.stepIndex}>
              <Step>
                <StepLabel>
                  <T>1. Parameters</T>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>
                  <T>2. Content</T>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>
                  <T>3. Audiences</T>
                </StepLabel>
              </Step>
            </Stepper>
          </DialogTitle>
          <DialogContent>
            {this.getStepContent(this.state.stepIndex)}
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={this.handleClose.bind(this)}>
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.handleNext.bind(this)}
            >
              <T>{this.state.stepIndex === 2 ? 'Create' : 'Next'}</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

CreateInject.propTypes = {
  exercise: PropTypes.object,
  audiences: PropTypes.array,
  inject_types: PropTypes.object,
  addInject: PropTypes.func,
  updateInject: PropTypes.func,
  deleteInject: PropTypes.func,
  downloadFile: PropTypes.func,
};

export default R.compose(
  connect(null, {
    addInject,
    updateInject,
    deleteInject,
    downloadFile,
  }),
  inject18n,
  withStyles(styles),
)(CreateInject);
