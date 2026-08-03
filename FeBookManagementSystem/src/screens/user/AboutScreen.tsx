import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Info, Globe, Shield, FileText, ChevronRight, BookOpen } from 'lucide-react-native';

export default function AboutScreen() {
    const openUrl = (url: string) => {
        Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.headerIconWrapper}>
                            <Info size={18} color="#fff" />
                        </View>
                        <Text style={styles.headerTitle}>About</Text>
                    </View>
                </View>

                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <View style={styles.logoCircle}>
                        <BookOpen size={40} color="#fff" style={styles.logoIcon} />
                        <Text style={styles.logoText}>K2H</Text>
                    </View>
                    <Text style={styles.appName}>K2H Library Management</Text>
                    <Text style={styles.appVersion}>Version 1.0.0</Text>
                </View>

                {/* Description */}
                <View style={styles.card}>
                    <Text style={styles.description}>
                        K2H Library is a modern and comprehensive book management platform. It streamlines the processes of borrowing, returning, and tracking books, providing a seamless experience for both readers and administrators.
                    </Text>
                </View>

                {/* Links */}
                <View style={styles.linksCard}>
                    <TouchableOpacity style={styles.linkRow} onPress={() => openUrl('https://example.com')}>
                        <View style={styles.linkLeft}>
                            <View style={[styles.linkIconWrapper, { backgroundColor: '#E3F2FD' }]}>
                                <Globe size={18} color="#1976D2" />
                            </View>
                            <Text style={styles.linkText}>Website</Text>
                        </View>
                        <ChevronRight size={20} color="#C7C7CC" />
                    </TouchableOpacity>
                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.linkRow} onPress={() => openUrl('https://example.com/privacy')}>
                        <View style={styles.linkLeft}>
                            <View style={[styles.linkIconWrapper, { backgroundColor: '#E8F5E9' }]}>
                                <Shield size={18} color="#388E3C" />
                            </View>
                            <Text style={styles.linkText}>Privacy Policy</Text>
                        </View>
                        <ChevronRight size={20} color="#C7C7CC" />
                    </TouchableOpacity>
                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.linkRow} onPress={() => openUrl('https://example.com/terms')}>
                        <View style={styles.linkLeft}>
                            <View style={[styles.linkIconWrapper, { backgroundColor: '#FFF3E0' }]}>
                                <FileText size={18} color="#F57C00" />
                            </View>
                            <Text style={styles.linkText}>Terms of Service</Text>
                        </View>
                        <ChevronRight size={20} color="#C7C7CC" />
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>© 2026 K2H Team. All rights reserved.</Text>
            </ScrollView>
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
        paddingBottom: 40,
    },
    /* Header */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerIconWrapper: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#27AE60',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0D1B2A',
    },
    /* Logo Section */
    logoSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#27AE60',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#27AE60',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    logoIcon: {
        marginBottom: 4,
    },
    logoText: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 2,
    },
    appName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0D1B2A',
        marginBottom: 6,
    },
    appVersion: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '600',
    },
    /* Description Card */
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        color: '#4A5568',
        textAlign: 'center',
    },
    /* Links Card */
    linksCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    linkLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    linkIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
    },
    divider: {
        height: 1,
        backgroundColor: '#EDF2F7',
        marginLeft: 48,
    },
    /* Footer */
    footer: {
        textAlign: 'center',
        fontSize: 13,
        color: '#AEAEB2',
        fontWeight: '500',
    },
});
