import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { withStyles } from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide';
import { Add } from '@material-ui/icons';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';
import { fetchIncident } from '../../../../../actions/Incident';
import { downloadFile } from '../../../../../actions/File';
import {
  addInject,
  updateInject,
  deleteInject,
} from '../../../../../actions/Inject';
import InjectForm from './InjectForm';
import InjectContentForm from './InjectContentForm';
import InjectAudiences from './InjectAudiences';
import { submitForm } from '../../../../../utils/Action';

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
    right: 330,
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
    injectData.inject_content = JSON.stringify(data);
    this.setState({ injectData }, () => this.selectAudiences());
  }

  onAudiencesChange(data) {
    const { injectData } = this.state;
    injectData.inject_audiences = data;
    this.setState({ injectData });
  }

  onSubaudiencesChange(data) {
    const { injectData } = this.state;
    injectData.inject_subaudiences = data;
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
    this.props
      .addInject(
        this.props.exerciseId,
        this.props.eventId,
        this.props.incidentId,
        data,
      )
      .then(() => {
        this.props.fetchIncident(
          this.props.exerciseId,
          this.props.eventId,
          this.props.incidentId,
        );
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
            eventId={this.props.eventId}
            incidentId={this.props.incidentId}
            onChangeAudiences={this.onAudiencesChange.bind(this)}
            onChangeSubaudiences={this.onSubaudiencesChange.bind(this)}
            onChangeSelectAll={this.onSelectAllAudiences.bind(this)}
            audiences={this.props.audiences}
            subaudiences={this.props.subaudiences}
            injectAudiencesIds={[]}
            injectSubaudiencesIds={[]}
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
  exerciseId: PropTypes.string,
  audiences: PropTypes.array,
  subaudiences: PropTypes.array,
  eventId: PropTypes.string,
  incidentId: PropTypes.string,
  inject_types: PropTypes.object,
  fetchIncident: PropTypes.func,
  addInject: PropTypes.func,
  updateInject: PropTypes.func,
  deleteInject: PropTypes.func,
  downloadFile: PropTypes.func,
};

export default R.compose(
  connect(null, {
    fetchIncident,
    addInject,
    updateInject,
    deleteInject,
    downloadFile,
  }),
  withStyles(styles),
)(CreateInject);
