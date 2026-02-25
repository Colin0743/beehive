import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminClient = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

async function upsertRole(
  user: { id: string; user_metadata?: Record<string, unknown>; email?: string | null },
  role: 'admin' | 'user'
) {
  if (!adminClient) throw new Error('Supabase admin client not configured');
  const name = (user.user_metadata?.name as string) || user.email?.split('@')[0] || '用户';
  const avatar = (user.user_metadata?.avatar as string) || '/default-avatar.svg';
  const { error: upsertError } = await adminClient
    .from('profiles')
    .upsert({ id: user.id, name, avatar, role }, { onConflict: 'id' });
  if (upsertError) throw upsertError;
}

/**
 * 管理系统功能测试
 */
test.describe('管理系统测试', () => {
  // 辅助函数：创建管理员账号
  async function createAdminUser() {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const adminEmail = `admin${uniqueId}@test.com`;
    const adminPassword = 'admin123456';
    if (!adminClient) throw new Error('Supabase admin client not configured');
    const { data, error } = await adminClient.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { name: `管理员${uniqueId}` },
    });
    if (error || !data.user) throw error || new Error('Failed to create user');
    await upsertRole(data.user, 'admin');

    return { adminEmail, adminPassword };
  }

  // 辅助函数：创建普通用户账号
  async function createNormalUser() {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const userEmail = `user${uniqueId}@test.com`;
    const userPassword = 'user123456';
    if (!adminClient) throw new Error('Supabase admin client not configured');
    const { data, error } = await adminClient.auth.admin.createUser({
      email: userEmail,
      password: userPassword,
      email_confirm: true,
      user_metadata: { name: `普通用户${uniqueId}` },
    });
    if (error || !data.user) throw error || new Error('Failed to create user');
    await upsertRole(data.user, 'user');

    return { userEmail, userPassword };
  }

  test('普通用户无法访问管理系统', async ({ page }) => {
    // 创建并登录普通用户
    const { userEmail, userPassword } = await createNormalUser();
    
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
    const { adminEmail, adminPassword } = await createAdminUser();
    
    // 登录管理员
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

    // 应该能看到管理系统页面
    await expect(page.getByRole('heading', { name: '数据统计' })).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/.*admin\/dashboard/);
  });

  test('管理系统应该显示数据统计', async ({ page }) => {
    // 创建管理员账号并登录
    const { adminEmail, adminPassword } = await createAdminUser();
    
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
    const { adminEmail, adminPassword } = await createAdminUser();
    
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
    await expect(page.getByRole('heading', { name: '项目管理' })).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/.*admin\/projects/);
  });

  test('管理系统应该显示用户管理页面', async ({ page }) => {
    // 创建管理员账号并登录
    const { adminEmail, adminPassword } = await createAdminUser();
    
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
    await expect(page.getByRole('heading', { name: '用户管理' })).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/.*admin\/users/);
  });

  test('管理系统导航应该正常工作', async ({ page }) => {
    // 创建管理员账号并登录
    const { adminEmail, adminPassword } = await createAdminUser();
    
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

