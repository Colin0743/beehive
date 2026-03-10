import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, FlatList, RefreshControl, Platform } from 'react-native';
import { Settings, ChevronRight, Wallet, Image as ImageIcon, Briefcase, Lock, LogOut, Bell, Star, Users } from 'lucide-react-native';
import { Colors, SharedStyles } from '../constants/Colors';
import { useAuthStore } from '../store/authStore';
import { getUserProjects } from '../lib/api/projects';
import { getFollowedProjects, getParticipatedProjects, getUserBalance, getUnreadNotificationCount, getNotifications } from '../lib/api/relations';
import { mockRecharge, RECHARGE_OPTIONS } from '../lib/api/payments';
import { Project, Notification } from '../types';

export default function ProfileScreen({ navigation }: any) {
    const user = useAuthStore((s) => s.user);
    const signOut = useAuthStore((s) => s.signOut);
    const [balanceCents, setBalanceCents] = useState(0);
    const [myProjects, setMyProjects] = useState<Project[]>([]);
    const [followedProjects, setFollowedProjects] = useState<Project[]>([]);
    const [participatedProjects, setParticipatedProjects] = useState<Project[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'created' | 'joined' | 'followed'>('created');
    const [showRecharge, setShowRecharge] = useState(false);
    const [recharging, setRecharging] = useState(false);

    const loadData = useCallback(async () => {
        if (!user) return;
        try {
            const [bal, my, fol, par, unread] = await Promise.all([
                getUserBalance(user.id),
                getUserProjects(user.id),
                getFollowedProjects(user.id),
                getParticipatedProjects(user.id),
                getUnreadNotificationCount(user.id),
            ]);
            setBalanceCents(bal);
            setMyProjects(my);
            setFollowedProjects(fol);
            setParticipatedProjects(par);
            setUnreadCount(unread);
        } catch (err) {
            console.error('Failed to load profile data:', err);
        }
    }, [user]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleLogout = async () => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm('Are you sure you want to sign out?');
            if (confirmed) {
                try {
                    await signOut();
                } catch (err: any) {
                    window.alert(err.message);
                }
            }
            return;
        }

        Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out', style: 'destructive',
                onPress: async () => {
                    try { await signOut(); } catch (err: any) {
                        Alert.alert('Error', err.message);
                    }
                },
            },
        ]);
    };

    const handleShowNotifications = async () => {
        if (!user) return;
        if (!showNotifications) {
            const notifs = await getNotifications(user.id);
            setNotifications(notifs);
        }
        setShowNotifications(!showNotifications);
    };

    // 未登录 — 参照 Twitter/Instagram 风格，展示预览 + 底部 CTA 按钮
    if (!user) {
        return (
            <View style={[SharedStyles.container, { flex: 1 }]}>
                {/* 模糊的假内容背景，增加"已有内容"的感觉 */}
                <View style={styles.guestPreview}>
                    {/* 假头像区域 */}
                    <View style={styles.guestAvatarCircle}>
                        <Text style={styles.guestAvatarText}>?</Text>
                    </View>
                    <View style={styles.guestNamePlaceholder} />
                    <View style={styles.guestEmailPlaceholder} />

                    {/* 假统计数据 */}
                    <View style={styles.guestStatsRow}>
                        {['Projects', 'Following', 'Tasks'].map((label) => (
                            <View key={label} style={styles.guestStatItem}>
                                <View style={styles.guestStatNum} />
                                <Text style={styles.guestStatLabel}>{label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 遮罩层 + 文字 */}
                <View style={styles.guestOverlay}>
                    <Text style={styles.guestTitle}>Sign in to see your profile</Text>
                    <Text style={styles.guestSubtitle}>
                        Track your projects, tasks and follow creators you love.
                    </Text>
                </View>

                {/* 底部 CTA 按钮 */}
                <View style={styles.guestCTA}>
                    <TouchableOpacity
                        style={styles.guestSignInBtn}
                        onPress={() => navigation.navigate('Auth')}
                    >
                        <Text style={styles.guestSignInText}>Sign In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.guestRegisterBtn}
                        onPress={() => {
                            navigation.navigate('Auth');
                            // 导航到 Auth 栈后自动导航到 Register
                            setTimeout(() => navigation.navigate('Register'), 100);
                        }}
                    >
                        <Text style={styles.guestRegisterText}>Create Account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const balanceDisplay = (balanceCents / 100).toFixed(2);

    const currentProjects = activeTab === 'created' ? myProjects
        : activeTab === 'joined' ? participatedProjects
            : followedProjects;

    const renderProjectItem = ({ item }: { item: Project }) => (
        <TouchableOpacity
            style={styles.projectItem}
            onPress={() => navigation.navigate('ProjectDetail', { id: item.id })}
        >
            {item.coverImage ? (
                <Image source={{ uri: item.coverImage }} style={styles.projectThumb} />
            ) : (
                <View style={[styles.projectThumb, { backgroundColor: Colors.inkLighter, justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: Colors.textMuted, fontSize: 10 }}>N/A</Text>
                </View>
            )}
            <View style={styles.projectInfo}>
                <Text style={styles.projectTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.projectMeta}>{item.category} · {item.participantsCount} members</Text>
            </View>
            <ChevronRight color={Colors.textMuted} size={18} />
        </TouchableOpacity>
    );

    return (
        <ScrollView
            style={SharedStyles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    {user.avatar ? (
                        <Image source={{ uri: user.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, { backgroundColor: Colors.gold, justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ color: Colors.ink, fontSize: 24, fontWeight: 'bold' }}>{user.name[0]?.toUpperCase()}</Text>
                        </View>
                    )}
                    <View style={styles.userText}>
                        <Text style={styles.username}>{user.name}</Text>
                        <Text style={styles.bio}>{user.email}</Text>
                    </View>
                </View>
            </View>

            {/* Wallet Card */}
            <View style={styles.walletCard}>
                <View style={styles.walletHeader}>
                    <View style={styles.walletTitleRow}>
                        <Wallet color={Colors.gold} size={20} />
                        <Text style={styles.walletTitle}>Wallet</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowRecharge(!showRecharge)}>
                        <Text style={styles.walletLink}>{showRecharge ? 'Hide' : 'Top Up'}</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.balanceLabel}>Balance (USD)</Text>
                <Text style={styles.balanceAmount}>${balanceDisplay}</Text>
                {showRecharge && (
                    <View style={styles.rechargeRow}>
                        {RECHARGE_OPTIONS.map((opt) => (
                            <TouchableOpacity
                                key={opt.cents}
                                style={styles.rechargeBtn}
                                disabled={recharging}
                                onPress={async () => {
                                    if (!user) return;
                                    setRecharging(true);
                                    try {
                                        const { newBalance } = await mockRecharge(user.id, opt.cents);
                                        setBalanceCents(newBalance);
                                        Alert.alert('Success', `Recharged ${opt.label}`);
                                    } catch (err: any) {
                                        Alert.alert('Error', err.message);
                                    } finally {
                                        setRecharging(false);
                                    }
                                }}
                            >
                                <Text style={styles.rechargeBtnText}>{opt.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Notifications Button */}
            <TouchableOpacity style={styles.notifBtn} onPress={handleShowNotifications}>
                <Bell color={Colors.textPrimary} size={20} />
                <Text style={styles.notifBtnText}>Notifications</Text>
                {unreadCount > 0 && (
                    <View style={styles.notifBadge}>
                        <Text style={styles.notifBadgeText}>{unreadCount}</Text>
                    </View>
                )}
                <ChevronRight color={Colors.textMuted} size={18} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            {/* Notifications List */}
            {showNotifications && (
                <View style={styles.notifList}>
                    {notifications.length === 0 ? (
                        <Text style={styles.notifEmpty}>No notifications</Text>
                    ) : (
                        notifications.slice(0, 10).map((n) => (
                            <View key={n.id} style={[styles.notifItem, !n.isRead && styles.notifItemUnread]}>
                                <Text style={styles.notifMessage}>{n.message}</Text>
                                <Text style={styles.notifTime}>{new Date(n.createdAt).toLocaleDateString()}</Text>
                            </View>
                        ))
                    )}
                </View>
            )}

            {/* Project Tabs */}
            <View style={styles.tabRow}>
                {([
                    { key: 'created', icon: <ImageIcon size={16} color={activeTab === 'created' ? Colors.gold : Colors.textMuted} />, label: `Created (${myProjects.length})` },
                    { key: 'joined', icon: <Users size={16} color={activeTab === 'joined' ? Colors.gold : Colors.textMuted} />, label: `Joined (${participatedProjects.length})` },
                    { key: 'followed', icon: <Star size={16} color={activeTab === 'followed' ? Colors.gold : Colors.textMuted} />, label: `Followed (${followedProjects.length})` },
                ] as const).map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        {tab.icon}
                        <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Project List */}
            <View style={styles.projectList}>
                {currentProjects.length === 0 ? (
                    <Text style={styles.emptyText}>No projects yet</Text>
                ) : (
                    currentProjects.map((p) => (
                        <View key={p.id}>{renderProjectItem({ item: p })}</View>
                    ))
                )}
            </View>

            {/* Actions */}
            <View style={styles.menuGroup}>
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                    <View style={styles.menuLeft}>
                        <LogOut color="#ef4444" size={22} style={styles.menuIcon} />
                        <Text style={[styles.menuText, { color: '#ef4444' }]}>Sign Out</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.versionText}>Bee Studio AI v1.2.5</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24 },
    userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.inkLight, marginRight: 16 },
    userText: { flex: 1 },
    username: { color: Colors.textPrimary, fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    bio: { color: Colors.textMuted, fontSize: 14 },
    walletCard: { marginHorizontal: 20, marginBottom: 16, backgroundColor: Colors.inkLight, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.inkBorder },
    walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    walletTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    walletTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
    walletLink: { color: Colors.gold, fontSize: 14, fontWeight: '500' },
    balanceLabel: { color: Colors.textMuted, fontSize: 12, marginBottom: 4 },
    balanceAmount: { color: Colors.textPrimary, fontSize: 32, fontWeight: 'bold', letterSpacing: 1 },
    notifBtn: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 16, backgroundColor: Colors.inkLight, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.inkBorder, gap: 10 },
    notifBtnText: { color: Colors.textPrimary, fontSize: 16 },
    notifBadge: { backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    notifBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    notifList: { marginHorizontal: 20, marginBottom: 16, backgroundColor: Colors.inkLight, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.inkBorder },
    notifEmpty: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', paddingVertical: 16 },
    notifItem: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.inkBorder },
    notifItemUnread: { borderLeftWidth: 3, borderLeftColor: Colors.gold, paddingLeft: 12 },
    notifMessage: { color: Colors.textPrimary, fontSize: 14, lineHeight: 20 },
    notifTime: { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
    tabRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 12, gap: 8 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, backgroundColor: Colors.inkLight, borderRadius: 8, borderWidth: 1, borderColor: Colors.inkBorder },
    tabActive: { borderColor: Colors.gold, backgroundColor: 'rgba(212,175,55,0.08)' },
    tabText: { color: Colors.textMuted, fontSize: 12 },
    tabTextActive: { color: Colors.gold, fontWeight: '600' },
    projectList: { marginHorizontal: 20, marginBottom: 16 },
    projectItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.inkLight, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.inkBorder },
    projectThumb: { width: 48, height: 48, borderRadius: 8, marginRight: 12 },
    projectInfo: { flex: 1 },
    projectTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 4 },
    projectMeta: { color: Colors.textMuted, fontSize: 12 },
    emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', paddingVertical: 32 },
    menuGroup: { backgroundColor: Colors.inkLight, marginHorizontal: 20, marginBottom: 16, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: Colors.inkBorder, marginTop: 8 },
    menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    menuLeft: { flexDirection: 'row', alignItems: 'center' },
    menuIcon: { marginRight: 12 },
    menuText: { color: Colors.textPrimary, fontSize: 16 },
    footer: { paddingVertical: 30, alignItems: 'center' },
    versionText: { color: Colors.textMuted, fontSize: 12 },
    rechargeRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
    rechargeBtn: { flex: 1, backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: 8, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.gold },
    rechargeBtnText: { color: Colors.gold, fontSize: 14, fontWeight: '600' },
    // Guest state styles
    guestPreview: { padding: 24, paddingTop: 60, alignItems: 'center', opacity: 0.25 },
    guestAvatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.inkBorder, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    guestAvatarText: { color: Colors.textPrimary, fontSize: 32, fontWeight: 'bold' },
    guestNamePlaceholder: { height: 20, width: 140, backgroundColor: Colors.inkBorder, borderRadius: 4, marginBottom: 10 },
    guestEmailPlaceholder: { height: 14, width: 180, backgroundColor: Colors.inkLighter, borderRadius: 4, marginBottom: 24 },
    guestStatsRow: { flexDirection: 'row', gap: 32 },
    guestStatItem: { alignItems: 'center', gap: 6 },
    guestStatNum: { height: 22, width: 40, backgroundColor: Colors.inkBorder, borderRadius: 4 },
    guestStatLabel: { color: Colors.textMuted, fontSize: 12 },
    guestOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 160, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    guestTitle: { color: Colors.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    guestSubtitle: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
    guestCTA: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingBottom: 48, gap: 12, backgroundColor: Colors.ink, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.inkBorder },
    guestSignInBtn: { backgroundColor: Colors.gold, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
    guestSignInText: { color: Colors.ink, fontSize: 16, fontWeight: 'bold' },
    guestRegisterBtn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.inkBorder },
    guestRegisterText: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
});
