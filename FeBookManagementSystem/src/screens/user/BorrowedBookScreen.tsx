import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Hourglass,
  RefreshCw,
} from 'lucide-react-native';
import { loanService } from '../../services/loan.service';
import { LoanUser } from '../../types/loan';

export default function BorrowedBookScreen() {
  const [loans, setLoans] = useState<LoanUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyLoans = async () => {
    try {
      const res = await loanService.getMyLoans();
      if (res && res.data) {
        setLoans(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.log('Error fetching my loans:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyLoans();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyLoans();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Pending',
          color: '#E67E22',
          bgColor: '#FDF2E9',
          icon: <Hourglass size={14} color="#E67E22" />,
        };
      case 'BORROWING':
        return {
          label: 'Borrowing',
          color: '#27AE60',
          bgColor: '#EAFBF1',
          icon: <BookOpen size={14} color="#27AE60" />,
        };
      case 'RETURNED':
        return {
          label: 'Returned',
          color: '#2F80ED',
          bgColor: '#EBF3FE',
          icon: <CheckCircle2 size={14} color="#2F80ED" />,
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          color: '#EB5757',
          bgColor: '#FDF2F2',
          icon: <XCircle size={14} color="#EB5757" />,
        };
      case 'OVERDUE':
        return {
          label: 'Overdue',
          color: '#D9381E',
          bgColor: '#FDF0ED',
          icon: <AlertCircle size={14} color="#D9381E" />,
        };
      default:
        return {
          label: status,
          color: '#8E8E93',
          bgColor: '#F2F2F7',
          icon: <Clock size={14} color="#8E8E93" />,
        };
    }
  };

  const renderLoanItem = ({ item }: { item: LoanUser }) => {
    const badge = getStatusBadge(item.status);
    const borrowDateFormatted = item.borrowDate
      ? new Date(item.borrowDate).toLocaleDateString('en-US')
      : '—';
    const dueDateFormatted = item.dueDate
      ? new Date(item.dueDate).toLocaleDateString('en-US')
      : '—';

    return (
      <View style={styles.loanCard}>
        <View style={styles.cardHeader}>
          <View style={styles.loanIdGroup}>
            <BookOpen size={18} color="#27AE60" />
            <Text style={styles.loanIdText} numberOfLines={1}>
              Loan ID: #{item.loanId.slice(0, 8)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badge.bgColor }]}>
            {badge.icon}
            <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.dateRowContainer}>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>Borrow Date</Text>
            <View style={styles.dateValueGroup}>
              <Calendar size={14} color="#8E8E93" style={{ marginRight: 4 }} />
              <Text style={styles.dateValue}>{borrowDateFormatted}</Text>
            </View>
          </View>
          <View style={styles.dateCol}>
            <Text style={styles.dateLabel}>Due Date</Text>
            <View style={styles.dateValueGroup}>
              <Clock size={14} color="#27AE60" style={{ marginRight: 4 }} />
              <Text style={[styles.dateValue, { color: '#27AE60', fontWeight: '700' }]}>
                {dueDateFormatted}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrapper}>
          <BookOpen size={48} color="#C8D6C8" />
        </View>
        <Text style={styles.emptyTitle}>No borrowing history</Text>
        <Text style={styles.emptySubtitle}>
          You haven't borrowed any books yet. Explore and request a loan today!
        </Text>
      </View>
    );
  };

  const overdueCount = loans.filter((l) => l.status === 'OVERDUE').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Books 📖</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh} activeOpacity={0.7}>
          <RefreshCw size={18} color="#27AE60" />
        </TouchableOpacity>
      </View>

      {/* Loading state */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#27AE60" />
          <Text style={styles.loadingText}>Loading borrowed books list...</Text>
        </View>
      ) : (
        <FlatList
          data={loans}
          keyExtractor={(item) => item.loanId}
          renderItem={renderLoanItem}
          ListHeaderComponent={
            overdueCount > 0 ? (
              <View style={styles.overdueBanner}>
                <AlertCircle size={22} color="#DC2626" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.overdueBannerTitle}>⚠️ OVERDUE BOOK NOTICE</Text>
                  <Text style={styles.overdueBannerSubtitle}>
                    You have {overdueCount} overdue book(s). Please return them to the library immediately!
                  </Text>
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            loans.length === 0 && styles.listContentEmpty,
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#27AE60']} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBF8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0D1B2A',
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  listContentEmpty: {
    flex: 1,
  },
  loanCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loanIdGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  loanIdText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D1B2A',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F4F4F6',
    marginVertical: 12,
  },
  dateRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateCol: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
    marginBottom: 4,
  },
  dateValueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateValue: {
    fontSize: 13,
    color: '#0D1B2A',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EAFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D1B2A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  overdueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  overdueBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
    marginBottom: 2,
  },
  overdueBannerSubtitle: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 16,
  },
});
