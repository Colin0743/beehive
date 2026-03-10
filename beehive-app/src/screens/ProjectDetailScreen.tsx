import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, Linking, Alert } from 'react-native';
import { Heart, Users, MessageSquare } from 'lucide-react-native';
import { getProjectById } from '../lib/api/projects';
import { followProject, unfollowProject, isFollowing, participateInProject, isParticipating } from '../lib/api/relations';
import { Project } from '../types';
import { Colors } from '../constants/Colors';
import { useAuthStore } from '../store/authStore';

export default function ProjectDetailScreen({ route, navigation }: any) {
    const { id } = route.params || {};
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [followed, setFollowed] = useState(false);
    const [participating, setParticipating] = useState(false);
    const user = useAuthStore((s) => s.user);

    useEffect(() => {
        async function load() {
            if (!id) return;
            const data = await getProjectById(id);
            setProject(data);
            setLoading(false);

            // 检查关注和参与状态
            if (user) {
                const [f, p] = await Promise.all([
                    isFollowing(id, user.id),
                    isParticipating(id, user.id),
                ]);
                setFollowed(f);
                setParticipating(p);
            }
        }
        load();
    }, [id, user]);

    const handleFollow = async () => {
        if (!user) {
            Alert.alert('Sign In Required', 'Please sign in to follow projects.');
            return;
        }
        try {
            if (followed) {
                await unfollowProject(id, user.id);
                setFollowed(false);
            } else {
                await followProject(id, user.id);
                setFollowed(true);
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to update follow status');
        }
    };

    const handleJoin = async () => {
        if (!user) {
            Alert.alert('Sign In Required', 'Please sign in to join projects.');
            return;
        }
        if (participating) {
            // 已参与，打开 Telegram
            if (project?.telegramGroup) {
                Linking.openURL(project.telegramGroup);
            } else {
                Alert.alert('No Group Link', 'The project creator has not provided a group link yet.');
            }
            return;
        }
        try {
            await participateInProject(id, user.id);
            setParticipating(true);
            Alert.alert('Joined!', 'You have joined this project as a Worker Bee. 🐝');
        } catch (err: any) {
            if (err.message?.includes('duplicate')) {
                setParticipating(true);
            } else {
                Alert.alert('Error', err.message || 'Failed to join project');
            }
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.gold} />
            </View>
        );
    }

    if (!project) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Project not found</Text>
            </View>
        );
    }

    const progress = project.targetDuration > 0
        ? Math.min(100, Math.round((project.currentDuration / project.targetDuration) * 100))
        : 0;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {project.coverImage ? (
                <Image source={{ uri: project.coverImage }} style={styles.coverImage} />
            ) : (
                <View style={[styles.coverImage, styles.placeholderImage]}>
                    <Text style={styles.placeholderText}>No Cover</Text>
                </View>
            )}

            <View style={styles.infoContainer}>
                <Text style={styles.title}>{project.title}</Text>

                <View style={styles.authorRow}>
                    <View style={styles.avatarPlaceholder} />
                    <Text style={styles.authorName}>{project.creatorName || 'Unknown'}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Director</Text>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Users color={Colors.textMuted} size={16} />
                        <Text style={styles.statText}>{project.participantsCount} members</Text>
                    </View>
                    <View style={styles.statItem}>
                        <MessageSquare color={Colors.textMuted} size={16} />
                        <Text style={styles.statText}>{project.logs?.length ?? 0} logs</Text>
                    </View>
                </View>

                {/* Progress */}
                <View style={styles.progressCard}>
                    <Text style={styles.progressLabel}>Progress ({progress}%)</Text>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                    </View>
                    <View style={styles.progressStats}>
                        <Text style={styles.progressStatText}>Completed: {project.currentDuration}s</Text>
                        <Text style={styles.progressStatText}>Goal: {project.targetDuration}s</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.description}>{project.description || 'No description'}</Text>

                {/* Logs */}
                {project.logs && project.logs.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Project Logs</Text>
                        {project.logs.map((log) => (
                            <View key={log.id} style={styles.logItem}>
                                <View style={styles.logDot} />
                                <View style={styles.logContent}>
                                    <Text style={styles.logText}>{log.content}</Text>
                                    <Text style={styles.logMeta}>
                                        {log.creatorName} · {new Date(log.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.followBtn} onPress={handleFollow}>
                        <Heart
                            color={followed ? '#ef4444' : Colors.textPrimary}
                            size={20}
                            fill={followed ? '#ef4444' : 'none'}
                        />
                        <Text style={styles.followBtnText}>{followed ? 'Following' : 'Follow'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
                        <Text style={styles.joinButtonText}>
                            {participating ? 'Open Group Chat' : 'Join as Worker Bee 🐝'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.ink },
    content: { paddingBottom: 40 },
    center: { flex: 1, backgroundColor: Colors.ink, alignItems: 'center', justifyContent: 'center' },
    errorText: { color: '#ff4444', fontSize: 16 },
    coverImage: { width: '100%', height: 240, backgroundColor: Colors.inkLighter },
    placeholderImage: { alignItems: 'center', justifyContent: 'center' },
    placeholderText: { color: Colors.textMuted },
    infoContainer: { padding: 16 },
    title: { color: Colors.textPrimary, fontSize: 26, fontWeight: 'bold', marginBottom: 16 },
    authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, marginRight: 10, backgroundColor: Colors.inkBorder },
    authorName: { color: Colors.textPrimary, fontSize: 16, fontWeight: '500', marginRight: 8 },
    badge: { backgroundColor: Colors.inkLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: Colors.inkBorder },
    badgeText: { color: Colors.gold, fontSize: 12, fontWeight: '600' },
    statsRow: { flexDirection: 'row', gap: 24, marginBottom: 20 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statText: { color: Colors.textSecondary, fontSize: 13 },
    progressCard: { backgroundColor: Colors.inkLight, padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: Colors.inkBorder },
    progressLabel: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
    progressBarBg: { height: 8, backgroundColor: Colors.inkBorder, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
    progressBarFill: { height: '100%', backgroundColor: Colors.gold },
    progressStats: { flexDirection: 'row', justifyContent: 'space-between' },
    progressStatText: { color: Colors.textSecondary, fontSize: 14 },
    sectionTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    description: { color: Colors.textSecondary, fontSize: 16, lineHeight: 24, marginBottom: 24 },
    logItem: { flexDirection: 'row', marginBottom: 16, paddingLeft: 8 },
    logDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gold, marginTop: 6, marginRight: 12 },
    logContent: { flex: 1 },
    logText: { color: Colors.textPrimary, fontSize: 14, lineHeight: 20, marginBottom: 4 },
    logMeta: { color: Colors.textMuted, fontSize: 12 },
    actionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    followBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.inkLight, borderWidth: 1, borderColor: Colors.inkBorder, borderRadius: 8, paddingVertical: 14, paddingHorizontal: 20 },
    followBtnText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
    joinButton: { flex: 1, backgroundColor: Colors.gold, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
    joinButtonText: { color: Colors.ink, fontSize: 15, fontWeight: 'bold' },
});
