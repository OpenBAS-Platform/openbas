import { UpdatePlayerInput, User } from '../../../utils/api-types';
import { Option } from '../../../utils/Option';

export type PlayerInputForm = Omit<UpdatePlayerInput, 'user_organization' | 'user_country' | 'user_tags'> & { user_organization: Option | undefined, user_country: Option | undefined, user_tags: Option[] };
export type UserStore = User & { user_organization: string };
