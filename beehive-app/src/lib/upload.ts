import { supabase } from './supabase';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

/**
 * 打开图库选择图片，上传到 Supabase Storage，返回公共 URL
 */
export async function pickAndUploadImage(
    userId: string,
    folder: string = 'covers'
): Promise<string | null> {
    // 请求权限
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access to upload images.');
        return null;
    }

    // 打开图库
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) {
        return null;
    }

    const asset = result.assets[0];
    const uri = asset.uri;

    // 构造文件名
    const ext = uri.split('.').pop() || 'jpg';
    const fileName = `${userId}/${folder}/${Date.now()}.${ext}`;

    // 读取文件为 blob
    try {
        const response = await fetch(uri);
        const blob = await response.blob();

        // 上传到 Supabase Storage
        const { data, error } = await supabase.storage
            .from('media')
            .upload(fileName, blob, {
                contentType: asset.mimeType || `image/${ext}`,
                upsert: false,
            });

        if (error) {
            console.error('[upload] Supabase Storage error:', error);
            Alert.alert('Upload Failed', error.message);
            return null;
        }

        // 获取公共 URL
        const { data: urlData } = supabase.storage
            .from('media')
            .getPublicUrl(data.path);

        return urlData.publicUrl;
    } catch (err: any) {
        console.error('[upload] Error:', err);
        Alert.alert('Upload Failed', err.message || 'Unknown error');
        return null;
    }
}
