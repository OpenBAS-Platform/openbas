import { simpleDelCall, simplePostCall } from '../../utils/Action';
import { type PlayerBulkProcessingInput, type SearchPaginationInput } from '../../utils/api-types';

const PLAYER_URI = '/api/players';

export const searchPlayers = (searchPaginationInput: SearchPaginationInput, notifyError: boolean = true) => {
  const data = searchPaginationInput;
  const uri = `${PLAYER_URI}/search`;
  return simplePostCall(uri, data, undefined, notifyError);
};

// "Injects played" for the person detail page: every inject (atomic testing or simulation inject)
// that concerns the player - targeted through one of their teams or evidenced by the player-level
// expectations persisted at execution time. Resolved server-side.
export const searchInjectsForPlayer = (userId: string, searchPaginationInput: SearchPaginationInput, notifyError: boolean = true) => {
  return simplePostCall(`${PLAYER_URI}/${userId}/injects/search`, searchPaginationInput, undefined, notifyError);
};

export const bulkDeletePlayers = (input: PlayerBulkProcessingInput) => {
  return simpleDelCall(PLAYER_URI, { data: input });
};
