import { Schema, arrayOf } from 'normalizr'

export const token = new Schema('tokens', { idAttribute: 'token_id' })
export const arrayOfTokens = arrayOf(token)

export const user = new Schema('users', { idAttribute: 'user_id' })

token.define({
  token_user: user
})