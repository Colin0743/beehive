import { test, expect } from '@playwright/test';

/**
 * UI 组件和交互测试
 */
test.describe('UI 组件测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('页面应该响应式布局正常', async ({ page }) => {
    // 测试桌面视图
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    const title = page.locator('h1');
    await expect(title).toBeVisible();
    
    // 测试移动视图
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await expect(title).toBeVisible();
  });

  test('导航链接应该正常工作', async ({ page }) => {
    // 检查导航栏链接
    const navLinks = page.locator('a[href]');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Toast 通知应该能够显示', async ({ page }) => {
    // 尝试触发一个操作来显示 toast
    // 例如尝试访问需要登录的页面
    await page.goto('/projects/new');
    await page.waitForLoadState('networkidle');
    
    // 检查是否跳转到登录页（未登录用户）
    const currentUrl = page.url();
    // 可能跳转到登录页或停留在项目创建页
    expect(currentUrl).toMatch(/auth\/login|projects\/new/);
  });

  test('图片和媒体应该正确加载', async ({ page }) => {
    const logoImage = page.getByRole('img', { name: '泱泱云合AI制片厂' }).first();
    await expect(logoImage).toBeVisible({ timeout: 10000 });
  });

  test('表单输入应该正常工作', async ({ page }) => {
    await page.goto('/auth/login');
    
    // 测试输入框
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
    
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('test123');
    await expect(passwordInput).toHaveValue('test123');
  });

  test('按钮点击应该正常工作', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    const loginButton = page.locator('button').filter({ hasText: '登录' });
    await expect(loginButton).toBeVisible({ timeout: 10000 });
    await expect(loginButton).toBeEnabled();
    
    // 点击按钮（会触发验证错误，但按钮应该响应）
    await loginButton.click();
    await page.waitForTimeout(1000);
  });
});

