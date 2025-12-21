'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Container, Button, Dropdown, Image } from 'semantic-ui-react';
import { useAuth } from '@/contexts/AuthContext';
import Logo from './Logo';

export default function Header() {
  const { user, isLoggedIn, isAdminUser, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <Menu fixed="top" inverted style={{ backgroundColor: 'var(--primary-color)' }}>
      <Container>
        {/* Logo和品牌名称 */}
        <Menu.Item as={Link} href="/" header>
          <Logo size="md" showText={true} />
        </Menu.Item>

        {/* 主导航菜单 */}
        <Menu.Item as={Link} href="/">
          发现项目
        </Menu.Item>

        {/* 分类浏览 */}
        <Menu.Item as={Link} href="/categories">
          分类浏览
        </Menu.Item>

        {isLoggedIn && (
          <Menu.Item as={Link} href="/profile">
            个人中心
          </Menu.Item>
        )}

        {/* 右侧菜单 */}
        <Menu.Menu position="right">
          {isLoggedIn ? (
            <>
              {/* 创建项目按钮 */}
              <Menu.Item>
                <Button 
                  as={Link} 
                  href="/projects/new"
                  color="orange"
                  size="small"
                >
                  创建项目
                </Button>
              </Menu.Item>

              {/* 用户下拉菜单 */}
              <Dropdown
                item
                trigger={
                  <div className="flex items-center space-x-2">
                    <Image
                      src={user?.avatar || '/default-avatar.svg'}
                      avatar
                      size="mini"
                    />
                    <span>{user?.name}</span>
                  </div>
                }
              >
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} href="/profile">
                    个人中心
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    退出登录
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </>
          ) : (
            <>
              <Menu.Item>
                <Button 
                  as={Link} 
                  href="/auth/login"
                  basic
                  inverted
                  size="small"
                >
                  登录
                </Button>
              </Menu.Item>
              <Menu.Item>
                <Button 
                  as={Link} 
                  href="/auth/register"
                  color="orange"
                  size="small"
                >
                  注册
                </Button>
              </Menu.Item>
            </>
          )}
        </Menu.Menu>
      </Container>
    </Menu>
  );
}
