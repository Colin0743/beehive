import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import MasonryList from '@react-native-seoul/masonry-list';
import { getAllPublishedTasks } from '../lib/api/tasks';
import { Task } from '../types';
import { Colors, SharedStyles } from '../constants/Colors';
import { PlayCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const getImageHeight = (index: number) => {
    return index % 3 === 0 ? 1.4 : (index % 2 === 0 ? 1.1 : 0.85);
};

export default function HomeScreen({ navigation }: any) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllPublishedTasks();
            setTasks(data);
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const renderTaskCard = ({ item, i }: { item: any, i: number }) => {
        const task = item as Task;
        const imageHeightRatio = getImageHeight(i);
        const cardWidth = (width - 32 - 12) / 2;
        const imageHeight = cardWidth * imageHeightRatio;
        const coverImage = task.projectCoverImage || (task.referenceImages?.[0]);

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => {
                    if (task.projectId) {
                        navigation.navigate('ProjectDetail', { id: task.projectId });
                    }
                }}
            >
                <View style={[styles.imageContainer, { height: imageHeight }]}>
                    {coverImage ? (
                        <Image source={{ uri: coverImage }} style={styles.coverImage} />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <PlayCircle color={Colors.textMuted} size={32} />
                        </View>
                    )}

                    <View style={styles.overlayGradient}>
                        <Text style={styles.overlayTitle} numberOfLines={2}>
                            {task.prompt || 'Untitled Task'}
                        </Text>
                        {task.projectName && (
                            <Text style={styles.overlayProject} numberOfLines={1}>
                                📁 {task.projectName}
                            </Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={SharedStyles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Task Hall</Text>
                <Text style={styles.headerSubtitle}>Accept tasks, earn rewards</Text>
            </View>

            <MasonryList
                data={tasks}
                keyExtractor={(item: any): string => item.id}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                renderItem={renderTaskCard}
                contentContainerStyle={styles.masonryContainer}
                refreshing={loading}
                onRefresh={fetchTasks}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No published tasks yet</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: Colors.ink,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.inkBorder,
        zIndex: 10,
    },
    headerTitle: { ...SharedStyles.title, fontSize: 28, marginBottom: 4 },
    headerSubtitle: { color: Colors.textMuted, fontSize: 14 },
    masonryContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
    card: {
        backgroundColor: Colors.inkLight,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
        marginHorizontal: 6,
        borderWidth: 1,
        borderColor: Colors.inkBorder,
    },
    imageContainer: { width: '100%', backgroundColor: Colors.inkLighter, position: 'relative' },
    coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    placeholderImage: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.inkLighter },
    overlayGradient: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        padding: 12, paddingTop: 24,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    overlayTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
    overlayProject: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 4 },
    emptyContainer: { paddingTop: 100, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: Colors.textMuted, fontSize: 16 },
});
