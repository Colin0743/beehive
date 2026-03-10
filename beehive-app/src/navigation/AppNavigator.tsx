import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { Home, Compass, PlusCircle, Inbox, User } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useAuthStore } from '../store/authStore';

import ProjectListScreen from '../screens/ProjectListScreen';
import HomeScreen from '../screens/HomeScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import CreateScreen from '../screens/CreateScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

// 认证流（未登录时显示）
function AuthNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
    );
}

// 底部导航栏
function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size, focused }) => {
                    if (route.name === 'Home') return <Home color={color} size={24} />;
                    if (route.name === 'Tasks') return <Inbox color={color} size={24} />;
                    if (route.name === 'Create') return <PlusCircle color={color} size={28} strokeWidth={focused ? 2.5 : 2} />;
                    if (route.name === 'Profile') return <User color={color} size={24} />;
                },
                tabBarActiveTintColor: Colors.textPrimary,
                tabBarInactiveTintColor: Colors.textMuted,
                headerStyle: { backgroundColor: Colors.ink },
                headerTintColor: Colors.textPrimary,
                tabBarStyle: {
                    backgroundColor: Colors.ink,
                    borderTopColor: Colors.inkBorder,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                headerTitleStyle: { fontWeight: 'bold', fontSize: 16 }
            })}
        >
            <Tab.Screen name="Home" component={ProjectListScreen} options={{ title: 'Discover' }} />
            <Tab.Screen name="Tasks" component={HomeScreen} options={{ title: 'Tasks' }} />
            <Tab.Screen
                name="Create"
                component={CreateScreen}
                options={{
                    title: 'Create',
                    tabBarLabelStyle: { marginTop: 4 }
                }}
            />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>
    );
}

// 加载页面
function LoadingScreen() {
    return (
        <View style={{ flex: 1, backgroundColor: Colors.ink, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.gold} />
        </View>
    );
}

// 主堆栈路由
export default function AppNavigator() {
    const initialize = useAuthStore((s) => s.initialize);
    const initialized = useAuthStore((s) => s.initialized);
    const loading = useAuthStore((s) => s.loading);
    const user = useAuthStore((s) => s.user);

    useEffect(() => {
        initialize();
    }, []);

    if (!initialized || loading) {
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer theme={DarkTheme}>
            <Stack.Navigator screenOptions={{
                headerStyle: { backgroundColor: Colors.ink },
                headerTintColor: Colors.textPrimary,
                headerTitleStyle: { fontWeight: 'bold' }
            }}>
                {!user ? (
                    // 未登录：显示 Auth 流 + 可以游客浏览
                    <>
                        <Stack.Screen
                            name="Auth"
                            component={AuthNavigator}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="MainTabs"
                            component={TabNavigator}
                            options={{ headerShown: false }}
                        />
                    </>
                ) : (
                    // 已登录：直接进入主界面
                    <>
                        <Stack.Screen
                            name="MainTabs"
                            component={TabNavigator}
                            options={{ headerShown: false }}
                        />
                    </>
                )}
                <Stack.Screen
                    name="ProjectDetail"
                    component={ProjectDetailScreen}
                    options={{ title: 'Details' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
