import type { APIRequestContext } from '@playwright/test';

import { tenantApiPath } from '../utils/url';

class UserApiHelpers {
  readonly userUri = tenantApiPath('/api/users');
  constructor(private request: APIRequestContext) {}

  /**
   * Creates a user in the default tenant through the tenant endpoint, the one the
   * Users screen uses without an Enterprise Edition licence.
   */
  async createUser(email: string, password: string) {
    const response = await this.request.post(this.userUri, {
      data: {
        user_email: email,
        user_firstname: 'E2E',
        user_lastname: 'User',
        user_plain_password: password,
        user_tags: [],
      },
    });
    if (!response.ok()) {
      throw new Error(`User creation failed: ${response.status()} ${await response.text()}`);
    }
    return response.json();
  }

  /** Detaches the user from the default tenant (platform deletion needs EE). */
  async detachUser(id: string) {
    await this.request.delete(`${this.userUri}/${id}`);
  }
}

export default UserApiHelpers;
