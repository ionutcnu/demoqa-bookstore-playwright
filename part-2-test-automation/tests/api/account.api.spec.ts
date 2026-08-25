import { randomUUID } from 'node:crypto';
import { expect, test } from '../../src/fixtures/test-fixtures';
import type { TokenResponse } from '../../src/models/user';

test.describe('Account API', () => {
  test('invalid credentials do not produce an access token', async ({
    accountApi,
  }) => {
    const response = await accountApi.generateToken({
      userName: `missing_${randomUUID()}`,
      password: 'Invalid1!',
    });

    expect(response.status()).toBe(200);

    const token = (await response.json()) as TokenResponse;
    expect(token.status).toBe('Failed');
    expect(token.token).toBeNull();
    expect(token.result).toContain('authorization failed');
  });
});
