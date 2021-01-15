import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';
import { dateToISO } from '../../../../../utils/Time';
import * as Constants from '../../../../../constants/ComponentTypes';
import { fetchIncident } from '../../../../../actions/Incident';
import { downloadFile } from '../../../../../actions/File';
import {
  addInject,
  updateInject,
  deleteInject,
} from '../../../../../actions/Inject';
import { DialogTitleElement } from '../../../../../components/Dialog';
import { Step, Stepper, StepLabel } from '../../../../../components/Stepper';
import InjectForm from './InjectForm';
import InjectContentForm from './InjectContentForm';
import InjectAudiences from './InjectAudiences';

i18nRegister({
  fr: {
    '1. Parameters': '1. Paramètres',
    '2. Content': '2. Contenu',
    '3. Audiences': '3. Audiences',
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
    // eslint-disable-next-line no-param-reassign
    data.inject_date = this.convertDate(
      `${data.inject_date_only} ${data.inject_time}`,
    );
    // eslint-disable-next-line no-param-reassign
    delete data.inject_date_only;
    // eslint-disable-next-line no-param-reassign
    delete data.inject_time;
    this.setState({ injectData: data });
  }

  // eslint-disable-next-line consistent-return,class-methods-use-this
  convertDate(dateToConvert) {
    const regexDateFr = RegExp(
      '^(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[012])[/](19|20)\\d\\d[ ]([0-1][0-9]|2[0-3])[:]([0-5][0-9])$',
    );
    const regexDateEn = RegExp(
      '^(19|20)\\d\\d[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])[ ]([0-1][0-9]|2[0-3])[:]([0-5][0-9])$',
    );
    let timeSplitted;
    let dateSplitted;
    let split;
    let newDate;

    if (regexDateFr.test(dateToConvert)) {
      split = dateToConvert.split(' ');
      dateSplitted = split[0].split('/');
      // eslint-disable-next-line prefer-destructuring
      timeSplitted = split[1];
      newDate = `${dateSplitted[2]}-${dateSplitted[1]}-${dateSplitted[0]} ${timeSplitted}`;
      return newDate;
    }
    if (regexDateEn.test(dateToConvert)) {
      return dateToConvert;
    }
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
        (a) => a.file_name !== name,
        this.state.injectAttachments,
      ),
    });
  }

  onContentSubmit(data) {
    const { injectData } = this.state;
    // eslint-disable-next-line no-param-reassign
    data.attachments = this.state.injectAttachments;
    injectData.inject_content = JSON.stringify(data);
    this.setState({ injectData });
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
        this.refs.injectForm.submit();
        break;
      case 1:
        this.refs.contentForm.getWrappedInstance().submit();
        break;
      case 2:
        this.createInject();
        break;
      default:
        break;
    }
  }

  createInject() {
    const data = R.assoc(
      'inject_date',
      dateToISO(this.state.injectData.inject_date),
      this.state.injectData,
    );
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

  onInjectTypeChange(event, index, value) {
    this.setState({ type: value });
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
        /* eslint-disable */
        return (
          <InjectForm
            ref="injectForm"
            onSubmit={this.onGlobalSubmit.bind(this)}
            onSubmitSuccess={this.selectContent.bind(this)}
            onInjectTypeChange={this.onInjectTypeChange.bind(this)}
            initialValues={{ inject_type: "openex_manual" }}
            types={this.props.inject_types}
          />
        );
      /* eslint-enable */
      case 1:
        /* eslint-disable */
        return (
          <InjectContentForm
            ref="contentForm"
            types={this.props.inject_types}
            type={this.state.type}
            onSubmit={this.onContentSubmit.bind(this)}
            onSubmitSuccess={this.selectAudiences.bind(this)}
            onContentAttachmentAdd={this.onContentAttachmentAdd.bind(this)}
            onContentAttachmentDelete={this.onContentAttachmentDelete.bind(
              this
            )}
            downloadAttachment={this.downloadAttachment.bind(this)}
            attachments={this.state.injectAttachments}
          />
        );
      /* eslint-enable */
      case 2:
        /* eslint-disable */
        return (
          <InjectAudiences
            ref="injectAudiences"
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
      /* eslint-enable */
      default:
        return 'Go away!';
    }
  }

  render() {
    const actions = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleClose.bind(this)}
      />,
      <Button
        key="create"
        label={this.state.stepIndex === 2 ? 'Create' : 'Next'}
        primary={true}
        onClick={this.handleNext.bind(this)}
      />,
    ];

    return (
      <div>
        <Fab
          type={Constants.BUTTON_TYPE_FLOATING_PADDING}
          onClick={this.handleOpen.bind(this)}
        />
        <DialogTitleElement
          title={
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
          }
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose.bind(this)}
          autoScrollBodyContent={true}
          actions={actions}
        >
          <div>{this.getStepContent(this.state.stepIndex)}</div>
        </DialogTitleElement>
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

export default connect(null, {
  fetchIncident,
  addInject,
  updateInject,
  deleteInject,
  downloadFile,
})(CreateInject);
