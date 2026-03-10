import React from 'react';
import { TextInput, TextInputProps, StyleSheet, Platform } from 'react-native';
import { Colors } from '../constants/Colors';

/**
 * 统一输入框组件，解决 Android 上字符顶部被裁剪的问题。
 * 原因：Android 的 TextInput 默认有 minHeight 限制，
 * 用 height 替代 paddingVertical 可以更可靠地控制。
 */
export default function AppInput(props: TextInputProps) {
    const { style, multiline, ...rest } = props;
    return (
        <TextInput
            style={[styles.base, multiline && styles.multiline, style]}
            placeholderTextColor={Colors.textMuted}
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    base: {
        backgroundColor: Colors.inkLight,
        borderWidth: 1,
        borderColor: Colors.inkBorder,
        borderRadius: 10,
        paddingHorizontal: 16,
        // 用固定 height 代替 paddingVertical，彻底规避 Android 字符裁剪
        height: 52,
        color: Colors.textPrimary,
        fontSize: 16,
        // Android 字体内边距修复
        includeFontPadding: false,
    },
    multiline: {
        height: 120,
        paddingTop: 14,
        paddingBottom: 14,
    },
});
