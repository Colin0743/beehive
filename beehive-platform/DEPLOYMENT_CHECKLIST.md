# 生产环境部署收尾清单

Node 项目已在宝塔添加成功后，按以下步骤完成生产环境配置。

---

## 1. SSL 证书（必须）

**原因**：Supabase Auth、支付回调、浏览器安全均要求 HTTPS。

### 操作（宝塔）

1. 登录宝塔 → **网站** → 找到 `yangyangyunhe.cloud` 站点
2. 若未添加站点：**添加站点** → 域名填 `yangyangyunhe.cloud` 和 `www.yangyangyunhe.cloud`
3. 点击站点 → **SSL** 选项卡
4. 选择 **Let's Encrypt** → 勾选两个域名 → **申请**
5. 开启 **强制 HTTPS**（建议）

---

## 2. Supabase 回调 URL

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard) → 你的项目
2. **Authentication** → **URL Configuration**
3. **Site URL**：`https://www.yangyangyunhe.cloud`
4. **Redirect URLs** 添加：
   - `https://www.yangyangyunhe.cloud/**`
   - `https://yangyangyunhe.cloud/**`

---

## 3. 文件权限

SSH 连接服务器后执行：

```bash
cd /www/wwwroot/beehive-platform
bash scripts/deploy-permissions.sh
```

或手动执行：

```bash
chown -R www:www /www/wwwroot/beehive-platform
chmod -R 755 /www/wwwroot/beehive-platform
chmod -R 775 /www/wwwroot/beehive-platform/public
```

---

## 4. 环境变量（服务器）

在宝塔 Node 项目 **环境变量** 或服务器 `.env.local` 中确保包含：

```
NEXT_PUBLIC_APP_URL=https://www.yangyangyunhe.cloud
```

添加后需 **重启 Node 项目**。

---

## 5. Nginx 反向代理

宝塔 **网站** → 对应站点 → **设置** → **反向代理**

- 目标 URL：`http://127.0.0.1:3001`
- 若绑定域名时已自动配置，可跳过

---

## 6. 验证

- [ ] `https://www.yangyangyunhe.cloud` 可访问
- [ ] 邮箱 OTP 登录/注册正常
- [ ] 支付回调（若启用）：`https://域名/api/recharge/callback/...`
