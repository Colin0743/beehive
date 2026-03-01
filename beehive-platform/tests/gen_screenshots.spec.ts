import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

test.describe('Generate Screenshots for Manual', () => {
    let userEmail = `test_${Date.now()}@example.com`;
    let userPassword = 'Password123!';

    test.beforeAll(async () => {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const supabaseAdmin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY,
                { auth: { autoRefreshToken: false, persistSession: false } }
            );

            const { data, error } = await supabaseAdmin.auth.admin.createUser({
                email: userEmail,
                password: userPassword,
                email_confirm: true,
            });
            if (error) console.log('Error creating user:', error);
            else console.log('Test user created:', userEmail);
        }
    });

    test('take screenshots', async ({ page }) => {
        test.setTimeout(120000); // 120 secs total

        // Login
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'public/images/screenshot_login.png' });

        // Perform login
        await page.fill('input[type="email"]', userEmail);
        await page.fill('input[type="password"]', userPassword);
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000); // Wait for login to complete

        // Recharge
        await page.goto('http://localhost:3000/recharge');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'public/images/screenshot_recharge.png' });

        // Create project
        await page.goto('http://localhost:3000/projects/new');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'public/images/screenshot_create.png' });

        // Task hall
        await page.goto('http://localhost:3000/tasks');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'public/images/screenshot_tasks.png' });

        // Dashboard (Profile)
        await page.goto('http://localhost:3000/profile');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'public/images/screenshot_dashboard.png' });
    });
});
