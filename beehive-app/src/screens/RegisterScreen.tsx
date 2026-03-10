import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useAuthStore } from '../store/authStore';
import AppInput from '../components/AppInput';

export default function RegisterScreen({ navigation }: any) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'details' | 'otp'>('details');
    const [loading, setLoading] = useState(false);

    const auth = useAuthStore();
    const signUp = auth.signUpWithPassword;
    const verifyOtp = auth.verifyOtp;

    const handleRegister = async () => {
        if (!name.trim()) { Alert.alert('Error', 'Please enter your name'); return; }
        if (!email.trim()) { Alert.alert('Error', 'Please enter your email'); return; }
        if (password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }
        if (password !== confirmPassword) { Alert.alert('Error', 'Passwords do not match'); return; }

        setLoading(true);
        try {
            await signUp(email.trim(), password, name.trim());
            Alert.alert(
                'Verification Sent',
                'A 6-digit code has been sent to your email. Please enter it to complete registration.',
            );
            setStep('otp');
        } catch (err: any) {
            Alert.alert('Registration Failed', err.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            Alert.alert('Error', 'Please enter 6-digit code');
            return;
        }
        setLoading(true);
        try {
            await verifyOtp(email.trim(), otp.trim(), 'signup');
            Alert.alert('Success', 'Account verified! Welcome to Bee Studio AI.');
            // Navigation to MainTabs is handled by AuthStore listener or RootNavigator
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
                <View style={styles.headerArea}>
                    <Text style={styles.headerTitle}>Create Account</Text>
                    <Text style={styles.headerSubtitle}>Join the AI video collaboration community</Text>
                </View>

                <View style={styles.form}>
                    {step === 'details' ? (
                        <>
                            <AppInput placeholder="Username" value={name} onChangeText={setName} autoCapitalize="words" />
                            <AppInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
                            <AppInput placeholder="Password (min 6 characters)" value={password} onChangeText={setPassword} secureTextEntry />
                            <AppInput placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

                            <TouchableOpacity
                                style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
                                onPress={handleRegister}
                                disabled={loading}
                            >
                                {loading ? <ActivityIndicator color={Colors.ink} /> : <Text style={styles.registerBtnText}>Send Verification Code</Text>}
                            </TouchableOpacity>

                            <View style={styles.footer}>
                                <TouchableOpacity onPress={() => navigation.goBack()}>
                                    <Text style={styles.footerText}>
                                        Already have an account? <Text style={styles.footerLink}>Sign In</Text>
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <>
                            <Text style={styles.otpTip}>
                                Verify your account{'\n'}
                                <Text style={{ color: Colors.gold }}>{email}</Text>
                            </Text>
                            <AppInput
                                placeholder="6-digit OTP"
                                value={otp}
                                onChangeText={(val) => setOtp(val.replace(/\D/g, ''))}
                                keyboardType="number-pad"
                                maxLength={6}
                                style={styles.otpInput}
                            />

                            <TouchableOpacity
                                style={[styles.registerBtn, (loading || otp.length < 6) && styles.registerBtnDisabled]}
                                onPress={handleVerifyOtp}
                                disabled={loading || otp.length < 6}
                            >
                                {loading ? (
                                    <ActivityIndicator color={Colors.ink} />
                                ) : (
                                    <Text style={styles.registerBtnText}>Complete Registration</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.backBtn}
                                onPress={() => setStep('details')}
                                disabled={loading}
                            >
                                <Text style={styles.backText}>Back to Edit Info</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.ink },
    inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 48 },
    headerArea: { alignItems: 'center', marginBottom: 40 },
    headerTitle: { color: Colors.textPrimary, fontSize: 28, fontWeight: 'bold' },
    headerSubtitle: { color: Colors.textMuted, fontSize: 14, marginTop: 8 },
    form: { gap: 16 },
    registerBtn: { backgroundColor: Colors.gold, borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
    registerBtnDisabled: { opacity: 0.6 },
    registerBtnText: { color: Colors.ink, fontSize: 16, fontWeight: 'bold' },
    otpTip: { color: Colors.textSecondary, textAlign: 'center', marginBottom: 8, lineHeight: 20 },
    otpInput: { textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: 'bold' },
    backBtn: { alignItems: 'center', marginTop: 16 },
    backText: { color: Colors.gold, fontSize: 14 },
    footer: { alignItems: 'center', marginTop: 12 },
    footerText: { color: Colors.textSecondary, fontSize: 14 },
    footerLink: { color: Colors.gold, fontWeight: '600' },
});
