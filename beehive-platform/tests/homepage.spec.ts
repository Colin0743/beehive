import { test, expect } from '@playwright/test';

/**
 * 首页功能测试
 */
test.describe('首页测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该显示页面标题', async ({ page }) => {
    await expect(page).toHaveTitle(/泱泱云合AI制片厂/);
  });

  test('应该显示主标题和副标题', async ({ page }) => {
    const title = page.locator('h1');
    await expect(title).toBeVisible();
    await expect(title).toContainText('泱泱云合AI制片厂');
    
    const subtitle = page.locator('p').filter({ hasText: 'AI视频创作者的协作平台' }).first();
    await expect(subtitle).toBeVisible();
  });

  test('应该显示首页主行动按钮', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const startButton = page.locator('a[href="/projects/new"] button').filter({ hasText: '开始创作' }).first();
    await expect(startButton).toBeVisible({ timeout: 10000 });
  });

  test('应该显示精选项目标题', async ({ page }) => {
    const featuredTitle = page.locator('text=精选项目');
    await expect(featuredTitle).toBeVisible();
  });

  test('应该显示项目分类导航', async ({ page }) => {
    const categoryNav = page.locator('a[href^="/projects?category="]');
    const count = await categoryNav.count();
    expect(count).toBeGreaterThan(0);
  });
});

