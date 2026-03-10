import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import MasonryList from '@react-native-seoul/masonry-list';
import { getProjects } from '../lib/api/projects';
import { Project } from '../types';
import { Colors, SharedStyles } from '../constants/Colors';

const CATEGORIES = [
    { key: 'all', label: 'All', value: 'all' },
    { key: 'film', label: 'Film', value: '电影' },
    { key: 'animation', label: 'Animation', value: '动画' },
    { key: 'commercial', label: 'Commercial', value: '商业制作' },
    { key: 'publicWelfare', label: 'Charity', value: '公益' },
    { key: 'other', label: 'Other', value: '其他' },
];

const { width } = Dimensions.get('window');

const getImageHeight = (index: number) => {
    return index % 3 === 0 ? 1.5 : (index % 2 === 0 ? 1.2 : 0.8);
};

export default function ProjectListScreen({ navigation }: any) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getProjects(selectedCategory === 'all' ? undefined : selectedCategory);
            setProjects(data);
        } catch (err) {
            console.error('Failed to fetch projects:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const filteredProjects = useMemo(() => {
        if (selectedCategory === 'all') return projects;
        const cat = CATEGORIES.find(c => c.key === selectedCategory);
        if (!cat) return projects;
        return projects.filter(p => p.category === cat.value);
    }, [projects, selectedCategory]);

    const renderCategoryTab = ({ item }: { item: typeof CATEGORIES[0] }) => {
        const isActive = item.key === selectedCategory;
        return (
            <TouchableOpacity
                style={styles.categoryTab}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(item.key)}
            >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{item.label}</Text>
                {isActive && <View style={styles.categoryIndicator} />}
            </TouchableOpacity>
        );
    };

    const renderProjectCard = ({ item, i }: { item: any, i: number }) => {
        const p = item as Project;
        const imageHeightRatio = getImageHeight(i);
        const cardWidth = (width - 32 - 12) / 2;
        const imageHeight = cardWidth * imageHeightRatio;
        const progress = p.targetDuration ? Math.min((p.currentDuration / p.targetDuration) * 100, 100) : 0;

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ProjectDetail', { id: p.id })}
            >
                <View style={[styles.imageContainer, { height: imageHeight }]}>
                    {p.coverImage ? (
                        <Image source={{ uri: p.coverImage }} style={styles.coverImage} />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Text style={styles.placeholderText}>No Image</Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.projectTitle} numberOfLines={2}>{p.title}</Text>

                    <View style={styles.cardFooter}>
                        <View style={styles.authorInfo}>
                            <View style={styles.avatarPlaceholder} />
                            <Text style={styles.authorName} numberOfLines={1}>{p.creatorName || 'Unknown'}</Text>
                        </View>
                        <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={SharedStyles.container}>
            <View style={styles.topBar}>
                <FlatList
                    horizontal
                    data={CATEGORIES}
                    renderItem={renderCategoryTab}
                    keyExtractor={item => item.key}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                />
            </View>

            <MasonryList
                data={filteredProjects}
                keyExtractor={(item: any): string => item.id}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                renderItem={renderProjectCard}
                contentContainerStyle={styles.masonryContainer}
                refreshing={loading}
                onRefresh={fetchProjects}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyTitle}>No projects yet</Text>
                            <Text style={styles.emptySubtitle}>Try another category</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    topBar: {
        backgroundColor: Colors.ink,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.inkBorder,
        paddingTop: 12,
        paddingBottom: 4,
    },
    categoryList: {
        paddingHorizontal: 16,
        gap: 20,
    },
    categoryTab: {
        paddingVertical: 8,
        position: 'relative',
        alignItems: 'center',
    },
    categoryText: {
        color: Colors.textSecondary,
        fontSize: 16,
        fontWeight: '500',
    },
    categoryTextActive: {
        color: Colors.textPrimary,
        fontWeight: 'bold',
        fontSize: 18,
    },
    categoryIndicator: {
        position: 'absolute',
        bottom: 0,
        height: 3,
        width: 16,
        backgroundColor: Colors.gold,
        borderRadius: 2,
    },
    masonryContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: Colors.inkLight,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 12,
        marginHorizontal: 6,
        borderWidth: 1,
        borderColor: Colors.inkBorder,
    },
    imageContainer: {
        width: '100%',
        backgroundColor: Colors.inkLighter,
    },
    coverImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.inkLighter,
    },
    placeholderText: {
        color: Colors.textMuted,
        fontSize: 12,
        fontWeight: 'bold',
    },
    cardContent: {
        padding: 10,
    },
    projectTitle: {
        color: Colors.textPrimary,
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        marginBottom: 10,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    avatarPlaceholder: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: Colors.inkBorder,
        marginRight: 6,
    },
    authorName: {
        color: Colors.textSecondary,
        fontSize: 12,
        flexShrink: 1,
    },
    progressText: {
        color: Colors.gold,
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        paddingTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        color: Colors.textPrimary,
        fontSize: 18,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        color: Colors.textMuted,
        fontSize: 14,
    },
});
