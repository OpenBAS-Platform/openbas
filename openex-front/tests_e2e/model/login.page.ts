import { Page } from '@playwright/test';

class LoginPage {
  constructor(private page: Page) {
  }

  getLoginPage() {
    return this.page.getByTestId('login-page');
  }

  getEmailInput() {
    return this.page.getByLabel('Email address');
  }

  getPasswordInput() {
    return this.page.getByLabel('Password');
  }

  getSignInButton() {
    return this.page.getByRole('button', { name: 'Sign in' });
  }
}

export default LoginPage;
