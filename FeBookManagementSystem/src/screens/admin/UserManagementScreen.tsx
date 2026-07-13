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

  // Statistics from API
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
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pageSize]);

  // Debounced search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, searchText);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchText, fetchUsers]);

  // Handle pull-to-refresh
  const handleRefresh = () => {
    setCurrentPage(1);
    fetchUsers(1, searchText, true);
  };

  // Handle pagination navigation
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

  // Delete User Action
  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      'Xóa người dùng',
      `Bạn có chắc chắn muốn xóa người dùng "${userName}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await userService.deleteUser(userId);
              if (res.status === 200 || res.data?.success) {
                Alert.alert('Thành công', 'Đã xóa người dùng thành công.');
                // Refresh list
                fetchUsers(currentPage, searchText);
              } else {
                Alert.alert('Lỗi', res.data?.message || 'Không thể xóa người dùng.');
              }
            } catch (err: any) {
              console.error('Error deleting user:', err);
              Alert.alert('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng.');
            }
          },
        },
      ]
    );
  };

  // Mail sending placeholder
  const handleSendMail = (email: string) => {
    Alert.alert('Gửi Mail', `Chức năng gửi mail tới ${email} đang được phát triển.`);
  };

  // Details placeholder
  const handleShowDetails = (user: UserListItem) => {
    Alert.alert('Chi tiết', `Người dùng: ${user.userName}\nEmail: ${user.email}\nSố điện thoại: ${user.phone || 'N/A'}`);
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
    return (parts[parts.length - 2].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
  };

  // Relative time formatter in Vietnamese
  const getRelativeTime = (dateString?: string | Date) => {
    if (!dateString) return 'Vừa xong';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 30) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  // Custom membership ID generator
  const getMembershipId = (user: UserListItem) => {
    const year = user.createdAt ? new Date(user.createdAt).getFullYear() : 2026;
    const prefix = String(user.userId).slice(0, 4).toUpperCase() || '0000';
    return `LIB-${year}-${prefix}`;
  };

  // Filter list based on selected tab
  const filteredUsers = users.filter(user => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return user.status === 'ACTIVE' && user.expiredBooks === 0;
    if (activeTab === 'overdue') return user.expiredBooks > 0;
    if (activeTab === 'blocked') return user.status === 'LOCK';
    return true;
  });

  const renderUserCard = ({ item }: { item: UserListItem }) => {
    // Dynamic styles based on status
    const isBlocked = item.status === 'LOCK';
    const isOverdue = item.expiredBooks > 0;

    let avatarBg = '#27AE60'; // Active / default
    let statusText = 'Hoạt động';
    let statusColor = '#27AE60';
    let statusBg = '#EAFBF1';

    if (isBlocked) {
      avatarBg = '#93A5B8';
      statusText = 'Bị khóa';
      statusColor = '#EB5757';
      statusBg = '#FEE8E7';
    } else if (isOverdue) {
      avatarBg = '#F2994A';
      statusText = 'Quá hạn';
      statusColor = '#F2994A';
      statusBg = '#FFF5E6';
    }

    const initials = getInitials(item.userName);
    const cardCode = getMembershipId(item);
    const timeAgo = getRelativeTime(item.createdAt);

    return (
      <View style={styles.card}>
        {/* Card Header Info */}
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

        {/* Card Stats Grid */}
        <View style={styles.statsContainer}>
          {/* Borrowing stat */}
          <View style={styles.statBox}>
            <BookOpen size={16} color="#2F80ED" style={styles.statIcon} />
            <Text style={styles.statCount}>{item.borrowingBooks}</Text>
            <Text style={styles.statLabel}>Đang mượn</Text>
          </View>
          {/* Overdue stat */}
          <View style={styles.statBox}>
            <AlertTriangle size={16} color="#EB5757" style={styles.statIcon} />
            <Text style={styles.statCount}>{item.expiredBooks}</Text>
            <Text style={styles.statLabel}>Quá hạn</Text>
          </View>
          {/* Total borrowed stat */}
          <View style={styles.statBox}>
            <Clock size={16} color="#4F4F4F" style={styles.statIcon} />
            <Text style={styles.statCount}>{item.totalBorrowedBook}</Text>
            <Text style={styles.statLabel}>Tổng mượn</Text>
          </View>
        </View>

        {/* Card Footer Info */}
        <View style={styles.cardFooterInfo}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{cardCode}</Text>
          </View>
          <Text style={styles.timeText}>{timeAgo}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleShowDetails(item)}>
            <ChevronRight size={16} color="#4F4F4F" />
            <Text style={styles.actionText}>Chi tiết</Text>
          </TouchableOpacity>

          <View style={styles.verticalDivider} />

          <TouchableOpacity style={styles.actionButton} onPress={() => handleSendMail(item.email)}>
            <Mail size={16} color="#4F4F4F" />
            <Text style={styles.actionText}>Gửi mail</Text>
          </TouchableOpacity>

          <View style={styles.verticalDivider} />

          <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteUser(item.userId, item.userName)}>
            <Trash2 size={16} color="#EB5757" />
            <Text style={[styles.actionText, { color: '#EB5757' }]}>Xóa</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrapper}>
            <Leaf size={16} color="#ffffff" />
          </View>
          <Text style={styles.headerTitle}>Người dùng</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
          <Bell size={20} color="#333" />
          <View style={styles.bellBadge} />
        </TouchableOpacity>
      </View>

      {/* Main Container */}
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tên, email, mã thẻ..."
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
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>Tất cả</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Hoạt động</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'overdue' && styles.activeTab]}
            onPress={() => setActiveTab('overdue')}
          >
            <Text style={[styles.tabText, activeTab === 'overdue' && styles.activeTabText]}>Quá hạn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'blocked' && styles.activeTab]}
            onPress={() => setActiveTab('blocked')}
          >
            <Text style={[styles.tabText, activeTab === 'blocked' && styles.activeTabText]}>Bị khóa</Text>
          </TouchableOpacity>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsRow}>
          {/* Total Metric */}
          <View style={[styles.metricCard, { backgroundColor: '#F8F9FA' }]}>
            <Text style={[styles.metricNumber, { color: '#333333' }]}>{stats.total}</Text>
            <Text style={styles.metricLabel}>Tổng</Text>
          </View>
          {/* Active Metric */}
          <View style={[styles.metricCard, { backgroundColor: '#EAFBF1' }]}>
            <Text style={[styles.metricNumber, { color: '#27AE60' }]}>{stats.active}</Text>
            <Text style={styles.metricLabel}>Hoạt động</Text>
          </View>
          {/* Overdue Metric */}
          <View style={[styles.metricCard, { backgroundColor: '#FFF5E6' }]}>
            <Text style={[styles.metricNumber, { color: '#F2994A' }]}>{stats.overdue}</Text>
            <Text style={styles.metricLabel}>Quá hạn</Text>
          </View>
          {/* Blocked Metric */}
          <View style={[styles.metricCard, { backgroundColor: '#FEE8E7' }]}>
            <Text style={[styles.metricNumber, { color: '#EB5757' }]}>{stats.blocked}</Text>
            <Text style={styles.metricLabel}>Bị khóa</Text>
          </View>
        </View>

        {/* Loading Spinner */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#27AE60" />
            <Text style={styles.loadingText}>Đang tải người dùng...</Text>
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
                <Text style={styles.emptyText}>Không tìm thấy người dùng nào.</Text>
              </View>
            }
            ListFooterComponent={renderPagination}
          />
        )}
      </View>
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
});