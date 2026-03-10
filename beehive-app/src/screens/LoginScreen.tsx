import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useAuthStore } from '../store/authStore';
import AppInput from '../components/AppInput';

type EmailStep = 'hidden' | 'input';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailStep, setEmailStep] = useState<EmailStep>('hidden');
    const [loading, setLoading] = useState(false);

    const signIn = useAuthStore((s) => s.signInWithPassword);
    const signInWithOAuth = useAuthStore((s) => s.signInWithOAuth);

    const handleEmailLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter your email and password.');
            return;
        }
        setLoading(true);
        try {
            await signIn(email.trim(), password);
        } catch (err: any) {
            if (err.message?.includes('Invalid login credentials')) {
                Alert.alert('Login Failed', 'Incorrect email or password.');
            } else if (err.message?.includes('Email not confirmed')) {
                Alert.alert('Email Not Verified', 'Please check your inbox and verify your email, or sign up again.');
            } else {
                Alert.alert('Login Failed', err.message || 'An unknown error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = async (provider: 'apple' | 'google') => {
        setLoading(true);
        try {
            await signInWithOAuth(provider);
        } catch (err: any) {
            Alert.alert(`${provider} Login Failed`, err.message || 'An error occurred during sign in.');
        } finally {
            setLoading(false);
        }
    };

    const handleAppleLogin = () => handleOAuthLogin('apple');
    const handleGoogleLogin = () => handleOAuthLogin('google');

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.inner}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Logo */}
                <View style={styles.logoArea}>
                    <Text style={styles.logoEmoji}>🐝</Text>
                    <Text style={styles.logoTitle}>Bee Studio AI</Text>
                    <Text style={styles.logoSubtitle}>AI Video Collaboration Platform</Text>
                </View>

                {/* Primary: 第三方登录 */}
                <View style={styles.ssoArea}>
                    {/* Apple Login temporarily hidden pending developer credentials
                    <TouchableOpacity
                        style={styles.ssoBtn}
                        onPress={handleAppleLogin}
                        disabled={loading}
                    >
                        <Ionicons name="logo-apple" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.ssoBtnText}>Continue with Apple</Text>
                    </TouchableOpacity>
                    */}

                    <TouchableOpacity
                        style={[styles.ssoBtn, styles.ssoBtnGoogle]}
                        onPress={handleGoogleLogin}
                        disabled={loading}
                    >
                        <Ionicons name="logo-google" size={18} color="#EA4335" style={{ marginRight: 8 }} />
                        <Text style={styles.ssoBtnTextDark}>Continue with Google</Text>
                    </TouchableOpacity>
                </View>

                {/* 分割线 */}
                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Secondary: 邮箱登录（折叠） */}
                {emailStep === 'hidden' ? (
                    <TouchableOpacity
                        style={styles.emailToggleBtn}
                        onPress={() => setEmailStep('input')}
                        disabled={loading}
                    >
                        <Text style={styles.emailToggleText}>Continue with Email</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.emailForm}>
                        <AppInput
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoFocus
                        />
                        <AppInput
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        <TouchableOpacity
                            style={[styles.signInBtn, loading && styles.btnDisabled]}
                            onPress={handleEmailLogin}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator color={Colors.ink} />
                                : <Text style={styles.signInBtnText}>Sign In</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelEmailBtn}
                            onPress={() => setEmailStep('hidden')}
                            disabled={loading}
                        >
                            <Text style={styles.cancelEmailText}>Back</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* 底部链接 */}
                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.footerText}>
                            Don't have an account? <Text style={styles.footerLink}>Sign Up</Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.guestBtn}
                    onPress={() => navigation.getParent()?.navigate('MainTabs')}
                >
                    <Text style={styles.guestText}>Browse as Guest →</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.ink },
    inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 48 },

    // Logo
    logoArea: { alignItems: 'center', marginBottom: 48 },
    logoEmoji: { fontSize: 56, marginBottom: 12 },
    logoTitle: { color: Colors.gold, fontSize: 30, fontWeight: 'bold', letterSpacing: 1 },
    logoSubtitle: { color: Colors.textMuted, fontSize: 13, marginTop: 6 },

    // SSO
    ssoArea: { gap: 12 },
    ssoBtn: {
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 12,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ssoBtnGoogle: {
        backgroundColor: '#fff',
        borderColor: '#ddd',
    },
    ssoBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    ssoBtnTextDark: { color: '#111', fontSize: 16, fontWeight: '600' },

    // Divider
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#333' },
    dividerText: { color: Colors.textMuted, paddingHorizontal: 12, fontSize: 13 },

    // Email toggle
    emailToggleBtn: {
        borderWidth: 1,
        borderColor: Colors.gold,
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
    },
    emailToggleText: { color: Colors.gold, fontSize: 16, fontWeight: '600' },

    // Email form
    emailForm: { gap: 12 },
    signInBtn: {
        backgroundColor: Colors.gold,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 4,
    },
    btnDisabled: { opacity: 0.6 },
    signInBtnText: { color: Colors.ink, fontSize: 16, fontWeight: 'bold' },
    cancelEmailBtn: { alignItems: 'center', paddingVertical: 8 },
    cancelEmailText: { color: Colors.textMuted, fontSize: 14 },

    // Footer
    footer: { alignItems: 'center', marginTop: 32 },
    footerText: { color: Colors.textSecondary, fontSize: 14 },
    footerLink: { color: Colors.gold, fontWeight: '600' },
    guestBtn: { alignItems: 'center', marginTop: 16 },
    guestText: { color: Colors.textMuted, fontSize: 13 },
});
