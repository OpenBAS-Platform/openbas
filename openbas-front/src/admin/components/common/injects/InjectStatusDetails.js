import { PreviewOutlined } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, IconButton, Table, TableBody, TableCell, TableRow } from '@mui/material';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { Component } from 'react';

import Transition from '../../../../components/common/Transition';
import inject18n from '../../../../components/i18n';

class InjectStatusDetails extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  render() {
    const { t, status } = this.props;
    return (
      <div>
        <IconButton
          onClick={this.handleOpen.bind(this)}
          aria-haspopup="true"
          size="large"
        >
          <PreviewOutlined />
        </IconButton>
        {status && (
          <Dialog
            open={this.state.open}
            TransitionComponent={Transition}
            onClose={this.handleClose.bind(this)}
            fullWidth={true}
            maxWidth="md"
            PaperProps={{ elevation: 1 }}
          >
            <DialogContent>
              <Table selectable={false} size="small">
                <TableBody displayRowCheckbox={false}>
                  {Object.entries(status).map(
                    ([key, value]) => {
                      if (key === 'status_traces') {
                        return (
                          <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell>
                              <Table selectable={false} size="small" key={key}>
                                <TableBody displayRowCheckbox={false}>
                                  {value.filter(trace => !!trace.execution_message)
                                    .map(trace => (
                                      <TableRow key={trace.execution_category}>
                                        <TableCell>
                                          {trace.execution_message}
                                        </TableCell>
                                        <TableCell>
                                          {trace.execution_status}
                                        </TableCell>
                                        <TableCell>{trace.execution_time}</TableCell>
                                      </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                            </TableCell>
                          </TableRow>
                        );
                      }
                      return (
                        <TableRow key={key}>
                          <TableCell>{key}</TableCell>
                          <TableCell>{value}</TableCell>
                        </TableRow>
                      );
                    },
                  )}
                </TableBody>
              </Table>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose.bind(this)}>
                {t('Close')}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </div>
    );
  }
}

InjectStatusDetails.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  status: PropTypes.object,
};

export default R.compose(inject18n)(InjectStatusDetails);
