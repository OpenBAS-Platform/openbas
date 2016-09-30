import React, {Component} from 'react'
import {T} from '../../components/I18n'
import {i18nRegister} from '../../utils/Messages'

i18nRegister({
  fr: {
    'Welcome to OpenEX {name}': 'Bienvenue to OpenEX {name}'
  }
})

class IndexAuthenticated extends Component {
  render() {
    return (
      <div>
        <T name="boby">Welcome to OpenEX :name</T>
      </div>
    );
  }
}
export default IndexAuthenticated;