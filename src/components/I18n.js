import React, {PropTypes} from 'react'
import {FormattedMessage} from 'react-intl'

export const T = (props) => {
  const id = props.children.replace(/(:(\w+))/g,"{$2}")
  return (<FormattedMessage id={id} defaultMessage={id} values={props}/>)
}

T.propTypes = {
  children: PropTypes.string,
  values: PropTypes.object,
}