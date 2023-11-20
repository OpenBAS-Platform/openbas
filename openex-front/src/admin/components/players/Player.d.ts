import { UpdatePlayerInput, User } from '../../../utils/api-types';
import { Option } from '../../../utils/Option';

export type PlayerInputForm = UpdatePlayerInput & { user_organization: Option, user_country: Option, user_tags: Option[] }
export type UserStore = User & { user_organization: string }
