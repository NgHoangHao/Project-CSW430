import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LogOut, ShieldCheck, Pencil } from 'lucide-react-native';
import { useAuth } from '../../store/authProvider';
import { AdminStackParamList } from '../../navigation/types';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = user?.userName || 'User';
  const email = user?.email || '';
  const phone = user?.phone || '';
  const initials = displayName
    .split(' ')
    .slice(-2)
    .map((w: string) => w.charAt(0).toUpperCase())
    .join('');

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoggingOut(true);
            await logout();
            // AppNavigator automatically switches to AuthNavigator when isLoggedIn becomes false
          } catch (err) {
            console.log('Logout error:', err);
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconWrapper}>
              <ShieldCheck size={18} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Administrator</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('UpdateProfile')}
          >
            <Pencil size={18} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        {/* ── User Info Card ── */}
        <View style={styles.card}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.onlineDot} />
          </View>

          {/* Info */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            {!!email && <Text style={styles.userEmail}>{email}</Text>}
            {!!phone && (
              <View style={styles.phoneBadge}>
                <Text style={styles.phoneText}>Phone: {phone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Admin Card ── */}
        <View style={styles.adminCard}>
          {/* Decorative circles */}
          <View style={styles.decCircle1} />
          <View style={styles.decCircle2} />

          <View style={styles.adminCardTop}>
            <View style={styles.adminBrandRow}>
              <View style={styles.adminIconWrapper}>
                <ShieldCheck size={16} color="#fff" />
              </View>
              <Text style={styles.adminBrandText}>BOOKCONNECT</Text>
            </View>
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>System Administrator</Text>
            </View>
          </View>

          <Text style={styles.adminName}>{displayName}</Text>
          <Text style={styles.adminSince}>Management System</Text>
        </View>

        {/* ── Logout Button ── */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color="#E53935" />
          ) : (
            <>
              <LogOut size={20} color="#E53935" style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>

        {/* ── Footer ── */}
        <Text style={styles.footer}>BookConnect v2.0.1 · © 2026</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
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
    backgroundColor: '#2C3E50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0D1B2A',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F4F4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* User Info Card */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#2C3E50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#27AE60',
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0D1B2A',
  },
  userEmail: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  phoneBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2F4F4',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  phoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
  },

  /* Admin Card */
  adminCard: {
    backgroundColor: '#2C3E50',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  decCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    right: -30,
    top: -30,
  },
  decCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    right: 40,
    bottom: -20,
  },
  adminCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  adminBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminBrandText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1.5,
  },
  adminBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  adminBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  adminName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  adminSince: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },

  /* Logout */
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE8E7',
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E53935',
  },

  /* Footer */
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#AEAEB2',
    fontWeight: '500',
  },
});
