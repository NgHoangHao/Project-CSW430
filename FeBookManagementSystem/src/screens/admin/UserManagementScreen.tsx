import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Leaf,
  Bell,
  Mail,
  Trash2,
  BookOpen,
  AlertTriangle,
  Clock,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react-native';
import { userService } from '../../services/user.service';

const { width: screenWidth } = Dimensions.get('window');

interface UserListItem {
  userId: string;
  userName: string;
  email: string;
  phone?: string;
  createdAt?: string;
  borrowingBooks: number;
  expiredBooks: number;
  totalBorrowedBook: number;
  status: string;
}

type TabType = 'all' | 'active' | 'overdue' | 'blocked';

export default function UserManagementScreen() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    overdue: 0,
  });

  const [activeTab, setActiveTab] = useState<TabType>('all');

  const fetchUsers = useCallback(async (page: number, search: string, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await userService.getUserByPage(page, pageSize, search || undefined);
      if (response.data && response.data.success) {
        const resultData = response.data.data;
        const list: UserListItem[] = resultData.userList || [];
        setUsers(list);
        setTotalPages(resultData.totalPages || 1);

        // Calculate active, blocked, and overdue from the list and response stats
        const activeCount = resultData.totalActive ?? list.filter(u => u.status === 'ACTIVE').length;
        const blockedCount = resultData.totalBlock ?? list.filter(u => u.status === 'LOCK').length;
        const overdueCount = list.filter(u => u.expiredBooks > 0).length;

        setStats({
          total: resultData.total || list.length,
          active: activeCount,
          blocked: blockedCount,
          overdue: overdueCount,
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Unable to load user list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, searchText);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchText, fetchUsers]);

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchUsers(1, searchText, true);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      fetchUsers(prev, searchText);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      fetchUsers(next, searchText);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete user "${userName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await userService.deleteUser(userId);
              if (res.status === 200 || res.data?.success) {
                Alert.alert('Success', 'User deleted successfully.');
                // Refresh list
                fetchUsers(currentPage, searchText);
              } else {
                Alert.alert('Error', res.data?.message || 'Unable to delete user.');
              }
            } catch (err: any) {
              console.error('Error deleting user:', err);
              Alert.alert('Error', err.response?.data?.message || 'An error occurred while deleting user.');
            }
          },
        },
      ]
    );
  };

  const handleSendMail = (email: string) => {
    Alert.alert('Send Mail', `Send mail to ${email} feature is under development.`);
  };

  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  const handleShowDetails = (user: UserListItem) => {
    setSelectedUser(user);
    setDetailsModalVisible(true);
  };

  const handleAssignRole = async (roleId: string) => {
    if (!selectedUser) return;
    try {
      const res = await userService.assignRole(selectedUser.userId, [roleId]);
      if (res.data?.success) {
        Alert.alert('Success', 'Role assigned successfully!');
      } else {
        Alert.alert('Error', res.data?.message || 'Unable to assign role.');
      }
    } catch (err: any) {
      Alert.alert('Error', 'System error while assigning role.');
    }
  };

  const handleRevokeRole = async (roleId: string) => {
    if (!selectedUser) return;
    try {
      const res = await userService.deleteRole(selectedUser.userId, [roleId]);
      if (res.data?.success) {
        Alert.alert('Success', 'Role revoked successfully!');
      } else {
        Alert.alert('Error', res.data?.message || 'Unable to revoke role.');
      }
    } catch (err: any) {
      Alert.alert('Error', 'System error while revoking role.');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
    return (parts[parts.length - 2].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
  };

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return minutes === 0 ? 'Just now' : `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const getMembershipId = (user: UserListItem) => {
    const year = user.createdAt ? new Date(user.createdAt).getFullYear() : 2026;
    const prefix = String(user.userId).slice(0, 4).toUpperCase() || '0000';
    return `LIB-${year}-${prefix}`;
  };

  const filteredUsers = users.filter(user => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return user.status === 'ACTIVE' && user.expiredBooks === 0;
    if (activeTab === 'overdue') return user.expiredBooks > 0;
    if (activeTab === 'blocked') return user.status === 'LOCK';
    return true;
  });

  const renderUserCard = ({ item }: { item: UserListItem }) => {

    const isBlocked = item.status === 'LOCK';
    const isOverdue = item.expiredBooks > 0;

    let avatarBg = '#27AE60'; // Active / default
    let statusText = 'Active';
    let statusColor = '#27AE60';
    let statusBg = '#EAFBF1';

    if (isBlocked) {
      avatarBg = '#93A5B8';
      statusText = 'Blocked';
      statusColor = '#EB5757';
      statusBg = '#FEE8E7';
    } else if (isOverdue) {
      avatarBg = '#F2994A';
      statusText = 'Overdue';
      statusColor = '#F2994A';
      statusBg = '#FFF5E6';
    }

    const initials = getInitials(item.userName);
    const cardCode = getMembershipId(item);
    const timeAgo = formatRelativeTime(item.createdAt);

    return (
      <View style={styles.card}>

        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.userName} numberOfLines={1}>{item.userName}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusLabel, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>


        <View style={styles.statsContainer}>
          {/* Borrowing stat */}
          <View style={styles.statBox}>
            <BookOpen size={16} color="#2F80ED" style={styles.statIcon} />
            <Text style={styles.statCount}>{item.borrowingBooks}</Text>
            <Text style={styles.statLabel}>Borrowing</Text>
          </View>
          {/* Overdue stat */}
          <View style={styles.statBox}>
            <AlertTriangle size={16} color="#EB5757" style={styles.statIcon} />
            <Text style={styles.statCount}>{item.expiredBooks}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
          {/* Total borrowed stat */}
          <View style={styles.statBox}>
            <Clock size={16} color="#4F4F4F" style={styles.statIcon} />
            <Text style={styles.statCount}>{item.totalBorrowedBook}</Text>
            <Text style={styles.statLabel}>Total Borrowed</Text>
          </View>
        </View>


        <View style={styles.cardFooterInfo}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{cardCode}</Text>
          </View>
          <Text style={styles.timeText}>{timeAgo}</Text>
        </View>


        <View style={styles.divider} />


        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleShowDetails(item)}>
            <ChevronRight size={16} color="#4F4F4F" />
            <Text style={styles.actionText}>Details</Text>
          </TouchableOpacity>

          <View style={styles.verticalDivider} />

          <TouchableOpacity style={styles.actionButton} onPress={() => handleSendMail(item.email)}>
            <Mail size={16} color="#4F4F4F" />
            <Text style={styles.actionText}>Send Mail</Text>
          </TouchableOpacity>

          <View style={styles.verticalDivider} />

          <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteUser(item.userId, item.userName)}>
            <Trash2 size={16} color="#EB5757" />
            <Text style={[styles.actionText, { color: '#EB5757' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
          onPress={handlePrevPage}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={18} color={currentPage === 1 ? '#C4C4C4' : '#27AE60'} />
        </TouchableOpacity>
        
        <Text style={styles.paginationInfo}>
          {currentPage} / {totalPages}
        </Text>

        <TouchableOpacity
          style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
          onPress={handleNextPage}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={18} color={currentPage === totalPages ? '#C4C4C4' : '#27AE60'} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrapper}>
            <Leaf size={16} color="#ffffff" />
          </View>
          <Text style={styles.headerTitle}>Users</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
          <Bell size={20} color="#333" />
          <View style={styles.bellBadge} />
        </TouchableOpacity>
      </View>


      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Name, email, card code..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Tab Filters */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Active</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'overdue' && styles.activeTab]}
            onPress={() => setActiveTab('overdue')}
          >
            <Text style={[styles.tabText, activeTab === 'overdue' && styles.activeTabText]}>Overdue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'blocked' && styles.activeTab]}
            onPress={() => setActiveTab('blocked')}
          >
            <Text style={[styles.tabText, activeTab === 'blocked' && styles.activeTabText]}>Blocked</Text>
          </TouchableOpacity>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsRow}>
          {/* Total Metric */}
          <View style={[styles.metricCard, { backgroundColor: '#F8F9FA' }]}>
            <Text style={[styles.metricNumber, { color: '#333333' }]}>{stats.total}</Text>
            <Text style={styles.metricLabel}>Total</Text>
          </View>
          {/* Active Metric */}
          <View style={[styles.metricCard, { backgroundColor: '#EAFBF1' }]}>
            <Text style={[styles.metricNumber, { color: '#27AE60' }]}>{stats.active}</Text>
            <Text style={styles.metricLabel}>Active</Text>
          </View>
          {/* Overdue Metric */}
          <View style={[styles.metricCard, { backgroundColor: '#FFF5E6' }]}>
            <Text style={[styles.metricNumber, { color: '#F2994A' }]}>{stats.overdue}</Text>
            <Text style={styles.metricLabel}>Overdue</Text>
          </View>
          {/* Blocked Metric */}
          <View style={[styles.metricCard, { backgroundColor: '#FEE8E7' }]}>
            <Text style={[styles.metricNumber, { color: '#EB5757' }]}>{stats.blocked}</Text>
            <Text style={styles.metricLabel}>Blocked</Text>
          </View>
        </View>

        {/* Loading Spinner */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#27AE60" />
            <Text style={{ marginTop: 10, color: '#828282' }}>Loading users...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserCard}
            keyExtractor={(item) => item.userId}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#27AE60']}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={{ color: '#828282' }}>No users found.</Text>
              </View>
            }
            ListFooterComponent={renderPagination}
          />
        )}
      </View>


      {selectedUser && (
        <Modal visible={detailsModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>User Details</Text>
                <TouchableOpacity onPress={() => setDetailsModalVisible(false)} style={styles.closeBtn}>
                  <Text style={{ fontSize: 16, color: '#333' }}>X</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.userInfoSection}>
                <Text style={styles.infoText}>Name: {selectedUser.userName}</Text>
                <Text style={styles.infoText}>Email: {selectedUser.email}</Text>
                <Text style={styles.infoText}>Phone: {selectedUser.phone || 'Not updated'}</Text>
                <Text style={styles.infoText}>Status: {selectedUser.status}</Text>
              </View>

              <Text style={styles.roleTitle}>Role Management</Text>
              
              <View style={styles.roleActionRow}>
                <Text style={styles.roleName}>ADMIN</Text>
                <View style={styles.roleBtnGroup}>
                  <TouchableOpacity style={styles.assignBtn} onPress={() => handleAssignRole('role-admin-1234')}>
                    <Text style={styles.assignBtnText}>Assign</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.revokeBtn} onPress={() => handleRevokeRole('role-admin-1234')}>
                    <Text style={styles.revokeBtnText}>Revoke</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.roleActionRow}>
                <Text style={styles.roleName}>LIBRARIAN</Text>
                <View style={styles.roleBtnGroup}>
                  <TouchableOpacity style={styles.assignBtn} onPress={() => handleAssignRole('role-librarian-1234')}>
                    <Text style={styles.assignBtnText}>Assign</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.revokeBtn} onPress={() => handleRevokeRole('role-librarian-1234')}>
                    <Text style={styles.revokeBtnText}>Revoke</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.roleActionRow}>
                <Text style={styles.roleName}>USER</Text>
                <View style={styles.roleBtnGroup}>
                  <TouchableOpacity style={styles.assignBtn} onPress={() => handleAssignRole('role-user-1234')}>
                    <Text style={styles.assignBtnText}>Assign</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.revokeBtn} onPress={() => handleRevokeRole('role-user-1234')}>
                    <Text style={styles.revokeBtnText}>Revoke</Text>
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EB5757',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBar: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 16,
    height: 48,
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    fontSize: 15,
    color: '#333333',
    paddingVertical: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#ffffff',
  },
  activeTab: {
    backgroundColor: '#1E6B3F',
    borderColor: '#1E6B3F',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#ffffff',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: (screenWidth - 32 - 24) / 4,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#8E8E93',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    width: (screenWidth - 64 - 16) / 3,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statIcon: {
    marginBottom: 4,
  },
  statCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#8E8E93',
  },
  cardFooterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeBadge: {
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  timeText: {
    fontSize: 11,
    color: '#AEAEB2',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F4F4F',
    marginLeft: 6,
  },
  verticalDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E5EA',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  pageBtnDisabled: {
    opacity: 0.5,
    backgroundColor: '#F8F9FA',
  },
  paginationInfo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F4F4F',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeBtn: {
    padding: 8,
  },
  userInfoSection: {
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  roleActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  roleName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  roleBtnGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  assignBtn: {
    backgroundColor: '#EAFBF1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  assignBtnText: {
    color: '#27AE60',
    fontWeight: '600',
    fontSize: 13,
  },
  revokeBtn: {
    backgroundColor: '#FEE8E7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  revokeBtnText: {
    color: '#EB5757',
    fontWeight: '600',
    fontSize: 13,
  },
});