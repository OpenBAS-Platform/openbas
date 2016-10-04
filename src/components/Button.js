import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import RaisedButton from 'material-ui/RaisedButton'
import {injectIntl} from 'react-intl'

const style = {
  margin: 5,
}

const ButtonIntl = (props) => (
  <RaisedButton primary={true}
                label={props.intl.formatMessage({id: props.label})}
                type={props.type}
                disabled={props.disabled}
                onClick={props.onClick}
                style={style}/>
)
export const Button = injectIntl(ButtonIntl)

ButtonIntl.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  intl: PropTypes.object,
  disabled: PropTypes.bool,
  onClick: PropTypes.func
}

export const LinkButtonIntl = (props) => (
  <RaisedButton primary={true}
                containerElement={<Link to={props.to}/>}
                disabled={props.disabled}
                label={props.intl.formatMessage({id: props.label})}
                style={style}/>
)
export const LinkButton = injectIntl(LinkButtonIntl)

LinkButtonIntl.propTypes = {
  to: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  intl: PropTypes.object,
  label: PropTypes.string.isRequired
}