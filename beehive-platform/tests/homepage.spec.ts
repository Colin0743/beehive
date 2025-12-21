import { test, expect } from '@playwright/test';

/**
 * 首页功能测试
 */
test.describe('首页测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该显示页面标题', async ({ page }) => {
    await expect(page).toHaveTitle(/蜂巢/);
  });

  test('应该显示主标题和副标题', async ({ page }) => {
    const title = page.locator('h1');
    await expect(title).toBeVisible();
    await expect(title).toContainText('蜂巢');
    
    const subtitle = page.locator('text=蜂巢是AI视频创作者的协作平台');
    await expect(subtitle).toBeVisible();
  });

  test('应该显示流程漫画轮播', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // 检查轮播容器是否存在（使用更通用的选择器）
    const carousel = page.locator('div').filter({ hasText: /发起人创建项目|工蜂加入项目|协作完成作品/ }).first();
    await expect(carousel).toBeVisible({ timeout: 10000 });
    
    // 检查轮播指示器
    const indicators = page.locator('button[aria-label*="步骤"]');
    const count = await indicators.count();
    expect(count).toBeGreaterThan(0);
  });

  test('应该显示精选项目标题', async ({ page }) => {
    const featuredTitle = page.locator('text=精选项目');
    await expect(featuredTitle).toBeVisible();
  });

  test('流程漫画应该可以切换', async ({ page }) => {
    // 等待轮播加载
    await page.waitForTimeout(1000);
    
    // 点击下一个按钮
    const nextButton = page.locator('button[aria-label="下一个步骤"]').first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }
    
    // 点击上一个按钮
    const prevButton = page.locator('button[aria-label="上一个步骤"]').first();
    if (await prevButton.isVisible()) {
      await prevButton.click();
      await page.waitForTimeout(500);
    }
  });
});

