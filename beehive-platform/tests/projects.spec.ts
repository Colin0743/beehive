import { test, expect } from '@playwright/test';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminClient = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

async function createConfirmedUser(email: string, password: string, name: string) {
  if (!adminClient) throw new Error('Supabase admin client not configured');
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error || !data.user) throw error || new Error('Failed to create user');
  return data.user;
}

/**
 * 项目功能测试
 */
test.describe('项目功能测试', () => {
  let testEmail: string;
  let testPassword: string;
  let createdProject: Record<string, unknown> | null = null;

  test.beforeEach(async ({ page }) => {
    createdProject = null;
    // 拦截上传 API，返回模拟数据
    await page.route('/api/upload', async route => {
      const request = route.request();
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { url: 'https://example.com/mock-file-url.mp4' }
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.route('**/api/projects**', async route => {
      const request = route.request();
      const url = new URL(request.url());
      const path = url.pathname;

      if (request.method() === 'POST' && path.endsWith('/api/projects')) {
        const body = JSON.parse(request.postData() ?? '{}') as Record<string, unknown>;
        const id = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        createdProject = {
          id,
          title: body.title,
          description: body.description,
          category: body.category,
          target_duration: body.target_duration ?? null,
          current_duration: body.current_duration ?? 0,
          telegram_group: body.telegram_group ?? null,
          cover_image: body.cover_image ?? null,
          video_file: body.video_file ?? null,
          creator_id: 'test-user',
          creator_name: '测试用户',
          participants_count: body.participants_count ?? 0,
          status: 'active',
          review_status: 'approved',
          created_at: new Date().toISOString(),
          logs: [],
          tasks: [],
        };
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: createdProject }),
        });
        return;
      }

      if (request.method() === 'GET' && path.startsWith('/api/projects/')) {
        if (createdProject && path.endsWith(String(createdProject.id))) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, data: createdProject }),
          });
          return;
        }
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: '项目不存在' }),
        });
        return;
      }

      if (request.method() === 'GET' && path.endsWith('/api/projects')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] }),
        });
        return;
      }

      await route.continue();
    });

    // 清除 localStorage
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.waitForLoadState('networkidle');
    
    // 注册并登录测试用户
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    testEmail = `test${uniqueId}@example.com`;
    testPassword = 'test123456';
    const testName = `测试用户${uniqueId}`;
    await createConfirmedUser(testEmail, testPassword, testName);
    
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    const loginButton = page.locator('button').filter({ hasText: '登录' });
    await loginButton.click();
    await page.waitForURL('/', { timeout: 10000 });
    let profileStatus = 0;
    for (let i = 0; i < 5; i += 1) {
      const response = await page.request.get('/api/auth/profile');
      profileStatus = response.status();
      if (profileStatus === 200) break;
      await page.waitForTimeout(1000);
    }
    expect(profileStatus).toBe(200);
  });

  test('应该能够访问创建项目页面', async ({ page }) => {
    await page.goto('/projects/new');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/.*projects\/new/);
    const title = page.locator('h1');
    await expect(title).toBeVisible({ timeout: 10000 });
    await expect(title).toContainText('创建新项目');
  });

  test('创建项目表单验证应该正常工作', async ({ page }) => {
    await page.goto('/projects/new');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 10000 });
    
    // 等待富文本编辑器加载
    await page.waitForTimeout(2000);
    
    // 尝试提交空表单
    const submitButton = page.locator('button').filter({ hasText: '创建项目' });
    await submitButton.click();
    
    // 应该显示验证错误
    await page.waitForTimeout(1000);
    const errorMessages = page.locator('text=/请输入/');
    const count = await errorMessages.count();
    expect(count).toBeGreaterThan(0);
  });

  test('应该能够创建新项目（包含文件上传和条款勾选）', async ({ page }) => {
    await page.goto('/projects/new');
    
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const projectTitle = `测试项目${uniqueId}`;
    
    // 1. 填写基本信息
    await page.fill('input[name="title"]', projectTitle);
    await page.selectOption('select[name="category"]', { label: '动画' }); // 假设有“动画”选项
    await page.fill('input[name="targetDuration"]', '100');
    await page.fill('input[name="telegramGroup"]', 'https://t.me/test');
    
    // 2. 填写描述 (RichTextEditor 可能需要特殊处理，假设它是 contenteditable div)
    // 尝试直接定位编辑器区域
    const editor = page.locator('.ql-editor');
    await expect(editor).toBeVisible({ timeout: 10000 });
    await editor.fill('这是一个测试项目描述，包含足够的字数以通过验证。');
    
    // 3. 上传封面图
    // 使用 setInputFiles 处理隐藏的 file input
    await page.setInputFiles('input#cover-input', path.join(__dirname, 'fixtures/test-image.jpg'));
    await expect(page.locator('img[alt="Cover preview"]')).toBeVisible({ timeout: 10000 });
    
    // 4. 上传视频
    await page.setInputFiles('input#video-input', path.join(__dirname, 'fixtures/test-video.mp4'));
    await expect(page.locator('video')).toBeVisible({ timeout: 10000 });
    
    // 5. 勾选条款 (关键步骤)
    // 定位包含条款文本的 label 或直接定位 checkbox
    const termsCheckbox = page.locator('input[type="checkbox"]');
    await termsCheckbox.check();
    expect(await termsCheckbox.isChecked()).toBe(true);
    
    // 6. 提交表单
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    
    // 7. 验证跳转
    // 应该跳转到项目详情页 /projects/[id]
    await page.waitForURL(/\/projects\/.+/, { timeout: 15000 });
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/projects\/.+/);
    
    // 验证项目标题存在
    await expect(page.getByText(projectTitle, { exact: true })).toBeVisible({ timeout: 10000 });
  });

  test('应该能够访问项目列表', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const heroTitle = page.locator('h1');
    await expect(heroTitle).toBeVisible({ timeout: 10000 });
    await expect(heroTitle).toContainText('泱泱云合AI制片厂');
  });
});
