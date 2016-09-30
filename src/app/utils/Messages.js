import {fromJS} from 'immutable'

export const i18n = {
  messages: {
    fr: {
      'Sign out': 'Déconnexion'
    }
  }
}
export const i18nRegister = (data) => {
  var mergedMessages = fromJS(i18n.messages).mergeDeep(fromJS(data))
  i18n.messages = mergedMessages.toJS()
}