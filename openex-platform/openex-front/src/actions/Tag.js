import * as schema from './Schema'
import {getReferential, postReferential, delReferential} from '../utils/Action'

export const fetchTags = () => (dispatch) => {
  return getReferential(schema.arrayOfTags, '/api/tag')(dispatch)
}

export const addTag = (data) => (dispatch) => {
    let uri = '/api/tag'
    return postReferential(schema.tag, uri, data)(dispatch)
}

export const deleteTag = (tag_id) => (dispatch) => {
    let uri = '/api/tag/' + tag_id
    return delReferential(uri, 'tag', tag_id)(dispatch)
}
