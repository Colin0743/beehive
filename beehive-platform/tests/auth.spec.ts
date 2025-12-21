import { test, expect } from '@playwright/test';

/**
 * 用户认证功能测试
 */
test.describe('用户认证测试', () => {
  test.beforeEach(async ({ page }) => {
    // 清除 localStorage
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('应该能够访问注册页面', async ({ page }) => {
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*auth\/register/);
    
    const title = page.locator('h2').filter({ hasText: '加入蜂巢' });
    await expect(title).toBeVisible({ timeout: 10000 });
  });

  test('应该能够访问登录页面', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*auth\/login/);
    
    const title = page.locator('h2').filter({ hasText: '欢迎回到蜂巢' });
    await expect(title).toBeVisible({ timeout: 10000 });
  });

  test('注册表单验证应该正常工作', async ({ page }) => {
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
    
    // 尝试提交空表单
    const submitButton = page.locator('button').filter({ hasText: '注册' });
    await submitButton.click();
    
    // 应该显示验证错误
    await page.waitForTimeout(1000);
    const errorMessages = page.locator('text=/请输入/');
    const count = await errorMessages.count();
    expect(count).toBeGreaterThan(0);
  });

  test('注册新用户应该成功', async ({ page }) => {
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
    
    // 填写注册表单
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    const testName = `测试用户${timestamp}`;
    const testPassword = 'test123456';
    
    await page.fill('input[type="text"]', testName);
    await page.fill('input[type="email"]', testEmail);
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(testPassword);
    await passwordInputs.nth(1).fill(testPassword);
    
    // 提交表单
    const submitButton = page.locator('button').filter({ hasText: '注册' });
    await submitButton.click();
    
    // 应该跳转到首页
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');
  });

  test('登录表单验证应该正常工作', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // 尝试提交空表单
    const submitButton = page.locator('button').filter({ hasText: '登录' });
    await submitButton.click();
    
    // 应该显示验证错误
    await page.waitForTimeout(1000);
    const errorMessages = page.locator('text=/请输入/');
    const count = await errorMessages.count();
    expect(count).toBeGreaterThan(0);
  });

  test('使用错误密码登录应该失败', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // 先注册一个用户
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    const testName = `测试用户${timestamp}`;
    const testPassword = 'test123456';
    
    await page.fill('input[type="text"]', testName);
    await page.fill('input[type="email"]', testEmail);
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(testPassword);
    await passwordInputs.nth(1).fill(testPassword);
    
    const registerButton = page.locator('button').filter({ hasText: '注册' });
    await registerButton.click();
    await page.waitForURL('/', { timeout: 10000 });
    
    // 登出
    await page.evaluate(() => localStorage.clear());
    
    // 尝试用错误密码登录
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'wrongpassword');
    
    const loginButton = page.locator('button').filter({ hasText: '登录' });
    await loginButton.click();
    
    // 应该显示错误消息
    await page.waitForTimeout(2000);
    const errorMessage = page.locator('text=/邮箱或密码错误/');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('使用正确密码登录应该成功', async ({ page }) => {
    // 先注册一个用户
    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    const testName = `测试用户${timestamp}`;
    const testPassword = 'test123456';
    
    await page.fill('input[type="text"]', testName);
    await page.fill('input[type="email"]', testEmail);
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(testPassword);
    await passwordInputs.nth(1).fill(testPassword);
    
    const registerButton = page.locator('button').filter({ hasText: '注册' });
    await registerButton.click();
    await page.waitForURL('/', { timeout: 10000 });
    
    // 登出
    await page.evaluate(() => localStorage.clear());
    
    // 使用正确密码登录
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    const loginButton = page.locator('button').filter({ hasText: '登录' });
    await loginButton.click();
    
    // 应该跳转到首页
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');
  });
});

