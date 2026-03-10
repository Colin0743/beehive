import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { Upload, ChevronDown, X } from 'lucide-react-native';
import { Colors, SharedStyles } from '../constants/Colors';
import { useAuthStore } from '../store/authStore';
import { createProject } from '../lib/api/projects';
import { pickAndUploadImage } from '../lib/upload';

const CATEGORY_OPTIONS = ['动画', '电影', '商业制作', '公益', '其他'];

export default function CreateScreen({ navigation }: any) {
    const user = useAuthStore((s) => s.user);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [targetDuration, setTargetDuration] = useState('');
    const [telegramGroup, setTelegramGroup] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const handlePickImage = async () => {
        if (!user) return;
        setUploadingImage(true);
        try {
            const url = await pickAndUploadImage(user.id, 'covers');
            if (url) setCoverImageUrl(url);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async () => {
        if (!user) {
            Alert.alert('Sign In Required', 'Please sign in to create a project.');
            return;
        }
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a project title');
            return;
        }
        if (!category) {
            Alert.alert('Error', 'Please select a category');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Error', 'Please enter a description');
            return;
        }

        setLoading(true);
        try {
            const project = await createProject(
                {
                    title: title.trim(),
                    description: description.trim(),
                    category,
                    targetDuration: parseInt(targetDuration) || 300,
                    telegramGroup: telegramGroup.trim(),
                    coverImage: coverImageUrl,
                },
                user.id,
                user.name
            );
            Alert.alert('Success!', 'Your project has been created.', [
                {
                    text: 'View Project',
                    onPress: () => {
                        if (project) {
                            navigation.navigate('ProjectDetail', { id: project.id });
                        }
                        // Reset form
                        setTitle('');
                        setDescription('');
                        setCategory('');
                        setTargetDuration('');
                        setTelegramGroup('');
                    },
                },
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    // 未登录提示
    if (!user) {
        return (
            <View style={[SharedStyles.container, styles.guestContainer]}>
                <Text style={styles.guestEmoji}>🔒</Text>
                <Text style={styles.guestTitle}>Sign In Required</Text>
                <Text style={styles.guestSubtitle}>You need to sign in to create projects</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={SharedStyles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={90}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>New Project</Text>
                    <Text style={styles.headerSubtitle}>Publish a project to recruit collaborators</Text>
                </View>
                {/* Cover Image */}
                <View style={styles.section}>
                    <Text style={styles.label}>Cover Image</Text>
                    {coverImageUrl ? (
                        <View style={{ position: 'relative' }}>
                            <Image source={{ uri: coverImageUrl }} style={styles.coverPreview} />
                            <TouchableOpacity
                                style={styles.removeImageBtn}
                                onPress={() => setCoverImageUrl('')}
                            >
                                <X color="#fff" size={16} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.uploadArea} onPress={handlePickImage} disabled={uploadingImage}>
                            {uploadingImage ? (
                                <ActivityIndicator color={Colors.gold} />
                            ) : (
                                <>
                                    <Upload color={Colors.textMuted} size={32} />
                                    <Text style={styles.uploadText}>Tap to select image</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Title */}
                <View style={styles.section}>
                    <Text style={styles.label}>Title *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Give your project a clear name"
                        placeholderTextColor={Colors.inkBorder}
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Category */}
                <View style={styles.section}>
                    <Text style={styles.label}>Category *</Text>
                    <TouchableOpacity
                        style={styles.dropdownBtn}
                        onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                    >
                        <Text style={category ? styles.dropdownTextSelected : styles.dropdownText}>
                            {category || 'Select category'}
                        </Text>
                        <ChevronDown color={Colors.textMuted} size={20} />
                    </TouchableOpacity>
                    {showCategoryPicker && (
                        <View style={styles.pickerDropdown}>
                            {CATEGORY_OPTIONS.map((opt) => (
                                <TouchableOpacity
                                    key={opt}
                                    style={[styles.pickerItem, category === opt && styles.pickerItemActive]}
                                    onPress={() => { setCategory(opt); setShowCategoryPicker(false); }}
                                >
                                    <Text style={[styles.pickerItemText, category === opt && styles.pickerItemTextActive]}>
                                        {opt}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Target Duration */}
                <View style={styles.section}>
                    <Text style={styles.label}>Duration Goal (seconds)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 300"
                        placeholderTextColor={Colors.inkBorder}
                        value={targetDuration}
                        onChangeText={setTargetDuration}
                        keyboardType="numeric"
                    />
                </View>

                {/* Telegram Group */}
                <View style={styles.section}>
                    <Text style={styles.label}>Telegram Group Link</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="https://t.me/..."
                        placeholderTextColor={Colors.inkBorder}
                        value={telegramGroup}
                        onChangeText={setTelegramGroup}
                        autoCapitalize="none"
                    />
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.label}>Description *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe your project, requirements, vision..."
                        placeholderTextColor={Colors.inkBorder}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        textAlignVertical="top"
                    />
                </View>
            </ScrollView>

            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={Colors.ink} />
                    ) : (
                        <Text style={styles.submitBtnText}>Publish Project</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    guestContainer: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
    guestEmoji: { fontSize: 48, marginBottom: 16 },
    guestTitle: { color: Colors.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
    guestSubtitle: { color: Colors.textMuted, fontSize: 14 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    header: { marginTop: 20, marginBottom: 30 },
    headerTitle: { color: Colors.textPrimary, fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
    headerSubtitle: { color: Colors.textMuted, fontSize: 14 },
    section: { marginBottom: 24 },
    label: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 12 },
    input: { backgroundColor: Colors.inkLight, borderWidth: 1, borderColor: Colors.inkBorder, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, color: Colors.textPrimary, fontSize: 16, includeFontPadding: false, textAlignVertical: 'center' },
    textArea: { height: 120, textAlignVertical: 'top' },
    dropdownBtn: { backgroundColor: Colors.inkLight, borderWidth: 1, borderColor: Colors.inkBorder, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dropdownText: { color: Colors.textMuted, fontSize: 16 },
    dropdownTextSelected: { color: Colors.textPrimary, fontSize: 16 },
    pickerDropdown: { backgroundColor: Colors.inkLight, borderWidth: 1, borderColor: Colors.inkBorder, borderRadius: 8, marginTop: 4, overflow: 'hidden' },
    pickerItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.inkBorder },
    pickerItemActive: { backgroundColor: 'rgba(212, 175, 55, 0.1)' },
    pickerItemText: { color: Colors.textSecondary, fontSize: 15 },
    pickerItemTextActive: { color: Colors.gold, fontWeight: '600' },
    bottomBar: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16, backgroundColor: Colors.ink, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.inkBorder },
    submitBtn: { backgroundColor: Colors.gold, borderRadius: 8, paddingVertical: 16, alignItems: 'center' },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnText: { color: Colors.ink, fontSize: 16, fontWeight: 'bold' },
    coverPreview: { width: '100%', height: 180, borderRadius: 12, backgroundColor: Colors.inkLighter },
    removeImageBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 14, width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
    uploadArea: { height: 160, backgroundColor: Colors.inkLight, borderRadius: 12, borderWidth: 1, borderColor: Colors.inkBorder, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
    uploadText: { color: Colors.textMuted, marginTop: 12, fontSize: 14 },
});
