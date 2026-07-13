import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, User, Phone, CheckCircle, Leaf } from 'lucide-react-native';
import { useAuth } from '../../store/authProvider';
import { UserStackParamList } from '../../navigation/types';
import { userService } from '../../services/user.service';

export default function UpdateProfileScreen() {
    const { user, refreshProfile } = useAuth();
    const navigation = useNavigation<NativeStackNavigationProp<UserStackParamList>>();

    const [userName, setUserName] = useState(user?.userName || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ userName?: string }>({});

    const validate = (): boolean => {
        const newErrors: { userName?: string } = {};
        if (!userName.trim()) {
            newErrors.userName = 'The username cannot be left blank.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdate = async () => {
        if (!validate()) return;
        try {
            setLoading(true);
            await userService.updateProfile({ userName, phone });
            await refreshProfile();
            Alert.alert('Success', 'Information updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (err) {
            Alert.alert('Error', 'Unable to update information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── Header ── */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.7}
                        >
                            <ArrowLeft size={20} color="#0D1B2A" />
                        </TouchableOpacity>
                        <View style={styles.headerCenter}>
                            <View style={styles.headerIconWrapper}>
                                <Leaf size={16} color="#fff" />
                            </View>
                            <Text style={styles.headerTitle}>Update profile</Text>
                        </View>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* ── Avatar Preview ── */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarRing}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {userName
                                        ? userName
                                            .split(' ')
                                            .slice(-2)
                                            .map((w: string) => w.charAt(0).toUpperCase())
                                            .join('')
                                        : 'U'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.avatarHint}>The information will be displayed on your profile.</Text>
                    </View>

                    {/* ── Form Card ── */}
                    <View style={styles.formCard}>
                        {/* UserName Field */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>
                                Username <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={[styles.inputWrapper, errors.userName ? styles.inputError : null]}>
                                <View style={styles.inputIcon}>
                                    <User size={18} color={errors.userName ? '#E53935' : '#27AE60'} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter username"
                                    placeholderTextColor="#AEAEB2"
                                    value={userName}
                                    onChangeText={text => {
                                        setUserName(text);
                                        if (errors.userName && text.trim()) {
                                            setErrors(prev => ({ ...prev, userName: undefined }));
                                        }
                                    }}
                                    autoCapitalize="words"
                                    returnKeyType="next"
                                />
                            </View>
                            {errors.userName ? (
                                <Text style={styles.errorText}>{errors.userName}</Text>
                            ) : null}
                        </View>

                        {/* Phone Field — no required validation */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Phone number</Text>
                            <View style={styles.inputWrapper}>
                                <View style={styles.inputIcon}>
                                    <Phone size={18} color="#27AE60" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập số điện thoại (tuỳ chọn)"
                                    placeholderTextColor="#AEAEB2"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    returnKeyType="done"
                                />
                            </View>
                        </View>

                        {/* Email Field — read-only */}
                        {!!user?.email && (
                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Email</Text>
                                <View style={[styles.inputWrapper, styles.inputDisabled]}>
                                    <TextInput
                                        style={[styles.input, styles.inputTextDisabled]}
                                        value={user.email}
                                        editable={false}
                                    />
                                    <View style={styles.lockedBadge}>
                                        <Text style={styles.lockedText}>Cannot be fixed</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* ── Save Button ── */}
                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                        onPress={handleUpdate}
                        activeOpacity={0.85}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <CheckCircle size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.saveButtonText}>Save changes</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* ── Cancel Button ── */}
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                        disabled={loading}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    scroll: {
        padding: 20,
        paddingBottom: 48,
    },

    /* Header */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 14,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F5F7FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerIconWrapper: {
        width: 30,
        height: 30,
        borderRadius: 9,
        backgroundColor: '#27AE60',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0D1B2A',
    },

    /* Avatar Section */
    avatarSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarRing: {
        width: 96,
        height: 96,
        borderRadius: 24,
        borderWidth: 3,
        borderColor: '#27AE60',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: '#27AE60',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    avatar: {
        width: 84,
        height: 84,
        borderRadius: 20,
        backgroundColor: '#27AE60',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 1,
    },
    avatarHint: {
        fontSize: 13,
        color: '#8E8E93',
        fontWeight: '500',
    },

    /* Form Card */
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        gap: 20,
    },
    fieldGroup: {
        gap: 8,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0D1B2A',
        marginLeft: 4,
    },
    required: {
        color: '#E53935',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E8EDF2',
        borderRadius: 14,
        backgroundColor: '#FAFBFC',
        paddingHorizontal: 14,
        paddingVertical: 2,
        minHeight: 52,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#0D1B2A',
        fontWeight: '500',
        paddingVertical: 10,
    },
    inputError: {
        borderColor: '#E53935',
        backgroundColor: '#FEF5F5',
    },
    inputDisabled: {
        backgroundColor: '#F0F2F5',
        borderColor: '#E8EDF2',
    },
    inputTextDisabled: {
        color: '#8E8E93',
    },
    lockedBadge: {
        backgroundColor: '#EEF0F2',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    lockedText: {
        fontSize: 11,
        color: '#8E8E93',
        fontWeight: '600',
    },
    errorText: {
        fontSize: 12,
        color: '#E53935',
        fontWeight: '500',
        marginLeft: 4,
    },

    /* Save Button */
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#27AE60',
        borderRadius: 16,
        paddingVertical: 18,
        marginBottom: 12,
        shadowColor: '#27AE60',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.3,
    },

    /* Cancel Button */
    cancelButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#8E8E93',
    },
});
