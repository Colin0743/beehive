import { test, expect } from '@playwright/test';

/**
 * 管理系统功能测试
 */
test.describe('管理系统测试', () => {
  // 辅助函数：创建管理员账号
  async function createAdminUser(page: any) {
    const timestamp = Date.now();
    const adminEmail = `admin${timestamp}@test.com`;
    const adminPassword = 'admin123456';

    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="text"]', `管理员${timestamp}`);
    await page.fill('input[type="email"]', adminEmail);
    const adminPasswordInputs = page.locator('input[type="password"]');
    await adminPasswordInputs.nth(0).fill(adminPassword);
    await adminPasswordInputs.nth(1).fill(adminPassword);
    const registerButton = page.locator('button').filter({ hasText: '注册' });
    await registerButton.click();
    await page.waitForURL('/', { timeout: 15000 });

    // 通过localStorage设置管理员角色
    await page.evaluate((email: string) => {
      const usersStr = localStorage.getItem('registeredUsers');
      if (usersStr) {
        const users = JSON.parse(usersStr);
        const user = users.find((u: any) => u.email === email);
        if (user) {
          user.role = 'admin';
          localStorage.setItem('registeredUsers', JSON.stringify(users));
          const currentUserStr = localStorage.getItem('user');
          if (currentUserStr) {
            const currentUser = JSON.parse(currentUserStr);
            if (currentUser.email === email) {
              currentUser.role = 'admin';
              localStorage.setItem('user', JSON.stringify(currentUser));
            }
          }
        }
      }
    }, adminEmail);

    return { adminEmail, adminPassword };
  }

  // 辅助函数：创建普通用户账号
  async function createNormalUser(page: any) {
    const timestamp = Date.now();
    const userEmail = `user${timestamp}@test.com`;
    const userPassword = 'user123456';

    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="text"]', `普通用户${timestamp}`);
    await page.fill('input[type="email"]', userEmail);
    const userPasswordInputs = page.locator('input[type="password"]');
    await userPasswordInputs.nth(0).fill(userPassword);
    await userPasswordInputs.nth(1).fill(userPassword);
    const registerButton = page.locator('button').filter({ hasText: '注册' });
    await registerButton.click();
    await page.waitForURL('/', { timeout: 15000 });

    return { userEmail, userPassword };
  }

  test('普通用户无法访问管理系统', async ({ page }) => {
    // 创建并登录普通用户
    const { userEmail, userPassword } = await createNormalUser(page);
    
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', userEmail);
    await page.fill('input[type="password"]', userPassword);
    const loginButton = page.locator('button').filter({ hasText: '登录' });
    await loginButton.click();
    await page.waitForURL('/', { timeout: 15000 });

    // 尝试访问管理系统
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(2000);

    // 应该被重定向到首页
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/admin');
  });

  test('管理员可以访问管理系统', async ({ page }) => {
    // 创建管理员账号
    const { adminEmail, adminPassword } = await createAdminUser(page);
    
    // 登录管理员
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    const loginButton = page.locator('button').filter({ hasText: '登录' });
    await loginButton.click();
    await page.waitForURL('/', { timeout: 15000 });

    // 确保管理员角色
    await page.evaluate((email: string) => {
      const usersStr = localStorage.getItem('registeredUsers');
      if (usersStr) {
        const users = JSON.parse(usersStr);
        const user = users.find((u: any) => u.email === email);
        if (user) {
          user.role = 'admin';
          localStorage.setItem('registeredUsers', JSON.stringify(users));
          const currentUserStr = localStorage.getItem('user');
          if (currentUserStr) {
            const currentUser = JSON.parse(currentUserStr);
            if (currentUser.email === email) {
              currentUser.role = 'admin';
              localStorage.setItem('user', JSON.stringify(currentUser));
            }
          }
        }
      }
    }, adminEmail);

    // 访问管理系统
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // 应该能看到管理系统页面
    await expect(page.locator('text=数据统计')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/.*admin\/dashboard/);
  });

  test('管理系统应该显示数据统计', async ({ page }) => {
    // 创建管理员账号并登录
    const { adminEmail, adminPassword } = await createAdminUser(page);
    
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    const loginButton = page.locator('button').filter({ hasText: '登录' });
    await loginButton.click();
    await page.waitForURL('/', { timeout: 15000 });

    // 访问管理系统
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // 检查统计卡片
    await expect(page.locator('text=总项目数')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=总用户数')).toBeVisible();
  });

  test('管理系统应该显示项目管理页面', async ({ page }) => {
    // 创建管理员账号并登录
    const { adminEmail, adminPassword } = await createAdminUser(page);
    
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    const loginButton = page.locator('button').filter({ hasText: '登录' });
    await loginButton.click();
    await page.waitForURL('/', { timeout: 15000 });

    // 访问项目管理页面
    await page.goto('/admin/projects');
    await page.waitForLoadState('networkidle');

    // 应该能看到项目管理页面
    await expect(page.locator('text=项目管理')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/.*admin\/projects/);
  });

  test('管理系统应该显示用户管理页面', async ({ page }) => {
    // 创建管理员账号并登录
    const { adminEmail, adminPassword } = await createAdminUser(page);
    
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    const loginButton = page.locator('button').filter({ hasText: '登录' });
    await loginButton.click();
    await page.waitForURL('/', { timeout: 15000 });

    // 访问用户管理页面
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // 应该能看到用户管理页面
    await expect(page.locator('text=用户管理')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/.*admin\/users/);
  });

  test('管理系统导航应该正常工作', async ({ page }) => {
    // 创建管理员账号并登录
    const { adminEmail, adminPassword } = await createAdminUser(page);
    
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    const loginButton = page.locator('button').filter({ hasText: '登录' });
    await loginButton.click();
    await page.waitForURL('/', { timeout: 15000 });

    // 访问管理系统
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');

    // 点击项目管理链接
    await page.click('a[href="/admin/projects"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*admin\/projects/);

    // 点击用户管理链接
    await page.click('a[href="/admin/users"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*admin\/users/);

    // 点击数据统计链接
    await page.click('a[href="/admin/dashboard"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*admin\/dashboard/);
  });
});

