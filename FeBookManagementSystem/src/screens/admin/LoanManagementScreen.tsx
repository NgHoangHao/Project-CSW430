import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Leaf,
  Bell,
  Search,
  BookOpen,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  User,
  Barcode,
  RotateCcw,
  Book,
} from 'lucide-react-native';
import { loanService } from '../../services/loan.service';
import { LoanDetailsByPage } from '../../types/loan';

const { width: screenWidth } = Dimensions.get('window');

type TabType = 'ALL' | 'BORROWING' | 'OVERDUE' | 'RETURNED';

export default function LoanManagementScreen() {
  const [loans, setLoans] = useState<LoanDetailsByPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    borrowing: 0,
    overdue: 0,
    returned: 0,
  });

  const fetchLoans = useCallback(async (targetPage: number, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await loanService.getLoanDetailsByPage(targetPage, pageSize);
      if (response && response.data) {
        setLoans(response.data);
        const meta = response.meta || {};
        setTotalPages(meta.totalPages || 1);
        
        // Calculate statistics based on fetched batch & counts
        const total = meta.total || response.data.length;
        const borrowingCount = response.data.filter(l => l.status === 'BORROWING').length;
        const overdueCount = response.data.filter(l => l.status === 'OVERDUE').length;
        const returnedCount = response.data.filter(l => l.status === 'RETURNED').length;

        setStats({
          total,
          borrowing: borrowingCount,
          overdue: overdueCount,
          returned: returnedCount,
        });
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
      Alert.alert('Error', 'Unable to load loan details list.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchLoans(page);
  }, [page, fetchLoans]);

  const handleRefresh = () => {
    setPage(1);
    fetchLoans(1, true);
  };

  const handleReturnBook = (barcode: string, bookName: string) => {
    Alert.alert(
      'Confirm Return',
      `Are you sure you want to mark the book "${bookName}" (Barcode: ${barcode}) as returned?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Return Book',
          style: 'default',
          onPress: async () => {
            try {
              setLoading(true);
              await loanService.returnBookByBarcode([barcode]);
              Alert.alert('Success', 'Book has been returned successfully!');
              fetchLoans(page);
            } catch (error: any) {
              console.error('Error returning book:', error);
              Alert.alert('Error', error.response?.data?.message || 'Could not return book. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Filtered Loans based on search query and status tabs
  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      // Status Filter
      if (activeTab !== 'ALL' && loan.status !== activeTab) {
        return false;
      }
      
      // Search Filter (Book name, userName, barcode)
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        loan.bookName?.toLowerCase().includes(q) ||
        loan.userName?.toLowerCase().includes(q) ||
        loan.barcode?.toLowerCase().includes(q)
      );
    });
  }, [loans, activeTab, searchQuery]);

  const renderStatusBadge = (status: string) => {
    let badgeStyle = styles.borrowingBadge;
    let badgeText = styles.borrowingText;
    let Icon = Clock;
    let label = 'Borrowing';

    if (status === 'RETURNED') {
      badgeStyle = styles.returnedBadge;
      badgeText = styles.returnedText;
      Icon = CheckCircle2;
      label = 'Returned';
    } else if (status === 'OVERDUE') {
      badgeStyle = styles.overdueBadge;
      badgeText = styles.overdueText;
      Icon = AlertTriangle;
      label = 'Overdue';
    }

    return (
      <View style={[styles.badge, badgeStyle]}>
        <Icon size={12} color={badgeText.color} style={styles.badgeIcon} />
        <Text style={[styles.badgeTextBase, badgeText]}>{label}</Text>
      </View>
    );
  };

  const renderLoanItem = ({ item }: { item: LoanDetailsByPage }) => {
    const isBorrowing = item.status === 'BORROWING' || item.status === 'OVERDUE';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.bookInfoContainer}>
            {item.url ? (
              <Image source={{ uri: item.url }} style={styles.bookImage} resizeMode="cover" />
            ) : (
              <View style={styles.bookImagePlaceholder}>
                <Book size={20} color="#828282" />
              </View>
            )}
            <View style={styles.bookTextContainer}>
              <Text style={styles.bookTitle} numberOfLines={2}>{item.bookName}</Text>
              <View style={styles.barcodeRow}>
                <Barcode size={12} color="#8E8E93" />
                <Text style={styles.barcodeText}>{item.barcode}</Text>
              </View>
            </View>
          </View>
          {renderStatusBadge(item.status)}
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <User size={14} color="#8E8E93" style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Borrower:</Text>
            <Text style={styles.infoValue}>{item.userName || 'Anonymous User'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={14} color="#8E8E93" style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Borrowed On:</Text>
            <Text style={styles.infoValue}>{item.borrowDate}</Text>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={14} color={item.status === 'OVERDUE' ? '#EB5757' : '#8E8E93'} style={styles.infoIcon} />
            <Text style={[styles.infoLabel, item.status === 'OVERDUE' && styles.alertText]}>Due Date:</Text>
            <Text style={[styles.infoValue, item.status === 'OVERDUE' && styles.alertTextBold]}>{item.dueDate}</Text>
          </View>

          {item.status === 'RETURNED' && item.returnDate && (
            <View style={styles.infoRow}>
              <CheckCircle2 size={14} color="#27AE60" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Returned On:</Text>
              <Text style={[styles.infoValue, styles.successTextBold]}>{item.returnDate}</Text>
            </View>
          )}
        </View>

        {isBorrowing && (
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.returnButton} 
              onPress={() => handleReturnBook(item.barcode, item.bookName)}
            >
              <RotateCcw size={14} color="#ffffff" style={styles.actionIcon} />
              <Text style={styles.returnButtonText}>Mark as Returned</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Leaf size={16} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.logoTitle}>BookConnect</Text>
            <Text style={styles.logoSubtitle}>ADMIN PANEL</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Bell size={20} color="#333333" />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AD</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredLoans}
        renderItem={renderLoanItem}
        keyExtractor={(item) => item.loanDetailId}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#27AE60']} />
        }
        ListHeaderComponent={
          <>
            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>Loan & Borrows Management</Text>
              <Text style={styles.subtitleText}>Track, search, and manage book loans.</Text>
            </View>

            {/* Statistics */}
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { borderLeftColor: '#2F80ED', borderLeftWidth: 4 }]}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total Page</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#F2994A', borderLeftWidth: 4 }]}>
                <Text style={styles.statNumber}>{stats.borrowing}</Text>
                <Text style={styles.statLabel}>Borrowing</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#EB5757', borderLeftWidth: 4 }]}>
                <Text style={styles.statNumber}>{stats.overdue}</Text>
                <Text style={styles.statLabel}>Overdue</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#27AE60', borderLeftWidth: 4 }]}>
                <Text style={styles.statNumber}>{stats.returned}</Text>
                <Text style={styles.statLabel}>Returned</Text>
              </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Search size={18} color="#8E8E93" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by Title, Borrower, or Barcode..."
                placeholderTextColor="#AEAEB2"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              {(['ALL', 'BORROWING', 'OVERDUE', 'RETURNED'] as TabType[]).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tabButton, isActive && styles.activeTabButton]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
                      {tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#27AE60" style={styles.spinner} />
          ) : (
            <View style={styles.emptyContainer}>
              <BookOpen size={48} color="#C7C7CC" />
              <Text style={styles.emptyText}>No loan records found.</Text>
              <Text style={styles.emptySubText}>Try adjusting your search or filters.</Text>
            </View>
          )
        }
        ListFooterComponent={
          filteredLoans.length > 0 ? (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={20} color={page === 1 ? '#AEAEB2' : '#4F4F4F'} />
              </TouchableOpacity>
              <Text style={styles.paginationInfo}>
                Page {page} of {totalPages}
              </Text>
              <TouchableOpacity
                style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
                onPress={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
              >
                <ChevronRight size={20} color={page === totalPages ? '#AEAEB2' : '#4F4F4F'} />
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },
  logoSubtitle: {
    fontSize: 9,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 6,
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#27AE60',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  titleContainer: {
    marginBottom: 16,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
  },
  subtitleText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: (screenWidth - 32 - 24) / 4,
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  statLabel: {
    fontSize: 9,
    color: '#8E8E93',
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  activeTabButton: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F4F4F',
  },
  activeTabButtonText: {
    color: '#ffffff',
  },
  spinner: {
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F4F4F',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookInfoContainer: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 8,
  },
  bookImage: {
    width: 46,
    height: 64,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
  },
  bookImagePlaceholder: {
    width: 46,
    height: 64,
    borderRadius: 6,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookTextContainer: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    lineHeight: 18,
    marginBottom: 4,
  },
  barcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barcodeText: {
    fontSize: 11,
    color: '#8E8E93',
    marginLeft: 4,
    fontWeight: '500',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeTextBase: {
    fontSize: 11,
    fontWeight: '600',
  },
  borrowingBadge: {
    backgroundColor: '#FFF5E6',
  },
  borrowingText: {
    color: '#F2994A',
  },
  returnedBadge: {
    backgroundColor: '#EAFBF1',
  },
  returnedText: {
    color: '#27AE60',
  },
  overdueBadge: {
    backgroundColor: '#FEE8E7',
  },
  overdueText: {
    color: '#EB5757',
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginVertical: 10,
  },
  cardBody: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    marginRight: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8E8E93',
    width: 90,
  },
  infoValue: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
    flex: 1,
  },
  alertText: {
    color: '#EB5757',
  },
  alertTextBold: {
    color: '#EB5757',
    fontWeight: '700',
  },
  successTextBold: {
    color: '#27AE60',
    fontWeight: '700',
  },
  cardActions: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 12,
  },
  returnButton: {
    backgroundColor: '#27AE60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionIcon: {
    marginRight: 6,
  },
  returnButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 10,
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pageBtnDisabled: {
    opacity: 0.5,
    backgroundColor: '#F8F9FA',
  },
  paginationInfo: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F4F4F',
  },
});