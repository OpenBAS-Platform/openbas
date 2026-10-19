import type { APIRequestContext } from '@playwright/test';

import { type RoleInput } from '../../src/utils/api-types';
import { tenantApiPath } from '../utils/url';

type Capability = NonNullable<RoleInput['role_capabilities']>[number];

export interface TenantUser {
  userId: string;
  email: string;
  password: string;
  groupId: string;
  roleId: string;
}

/**
 * Creates a non-admin user of the default tenant who logs in with a password and holds the given
 * capabilities through a dedicated role and group.
 */
class AccessApiHelpers {
  readonly roleUri = tenantApiPath('/api/roles');
  readonly groupUri = tenantApiPath('/api/groups');
  readonly userUri = tenantApiPath('/api/users');
  constructor(private request: APIRequestContext) {}

  async createUserWithCapabilities(capabilities: Capability[]): Promise<TenantUser> {
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const email = `e2e-${suffix}@test.io`;
    const password = `E2e-${suffix}`;

    const role = await (await this.request.post(this.roleUri, {
      data: {
        role_name: `E2E role ${suffix}`,
        role_capabilities: capabilities,
      },
    })).json();
    const group = await (await this.request.post(this.groupUri, { data: { group_name: `E2E group ${suffix}` } })).json();
    await this.request.put(`${this.groupUri}/${group.group_id}/roles`, { data: { group_roles: [role.role_id] } });
    const user = await (await this.request.post(this.userUri, {
      data: {
        user_email: email,
        user_plain_password: password,
        user_firstname: 'E2E',
        user_lastname: suffix,
      },
    })).json();
    await this.request.put(`${this.groupUri}/${group.group_id}/users`, { data: { group_users: [user.user_id] } });

    return {
      userId: user.user_id,
      email,
      password,
      groupId: group.group_id,
      roleId: role.role_id,
    };
  }

  async deleteUser(user: TenantUser) {
    await this.request.delete(`${this.userUri}/${user.userId}`);
    await this.request.delete(`${this.groupUri}/${user.groupId}`);
    await this.request.delete(`${this.roleUri}/${user.roleId}`);
  }
}

export default AccessApiHelpers;
