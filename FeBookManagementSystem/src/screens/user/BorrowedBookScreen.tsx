import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  User,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  RefreshCw,
  Layers,
} from 'lucide-react-native';
import { loanService } from '../../services/loan.service';
import { LoanDetailResponse, LoanResponse } from '../../types/loan';
import { BACKEND_URL } from '@env';

// ─── Types ─────────────────────────────────────────────────────────────────────
type TabKey = 'ALL' | 'BORROWING' | 'PENDING' | 'RETURNED' | 'OVERDUE';

interface Tab {
  key: TabKey;
  label: string;
  apiStatus: string | null; // null = tất cả (không truyền status)
}

const TABS: Tab[] = [
  { key: 'ALL', label: 'ALL', apiStatus: null },
  { key: 'BORROWING', label: 'BORROWING', apiStatus: 'BORROWING' },
  { key: 'PENDING', label: 'PENDING', apiStatus: 'PENDING' },
  { key: 'RETURNED', label: 'RETURNED', apiStatus: 'RETURNED' },
  { key: 'OVERDUE', label: 'OVERDUE', apiStatus: 'OVERDUE' },
];

interface TabCounts {
  ALL: number;
  BORROWING: number;
  PENDING: number;
  RETURNED: number;
  OVERDUE: number;
}

const PAGE_SIZE = 10;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getImageUrl = (url: string) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = (BACKEND_URL || 'http://10.0.2.2:3000').replace('/api', '');
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
};

const formatDate = (raw: Date | string | null | undefined): string => {
  if (!raw) return '—';
  const d = new Date(raw as string);
  if (isNaN(d.getTime())) return '—';
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${d.getFullYear()}`;
};

// ─── Badge component ───────────────────────────────────────────────────────────
function StatusBadge({
  remain,
  status,
  returnDate,
}: {
  remain: number;
  status: string;
  returnDate?: Date | string;
}) {
  if (status === 'RETURNED') {
    return (
      <View style={[styles.badge, styles.badgeGreen]}>
        <CheckCircle size={12} color="#27AE60" style={{ marginRight: 4 }} />
        <Text style={[styles.badgeText, { color: '#27AE60' }]}>
          Returned {returnDate ? formatDate(returnDate) : ''}
        </Text>
      </View>
    );
  }
  if (status === 'PENDING' || status === 'PENDING') {
    return (
      <View style={[styles.badge, styles.badgeBlue]}>
        <Clock size={12} color="#3B82F6" style={{ marginRight: 4 }} />
        <Text style={[styles.badgeText, { color: '#3B82F6' }]}>Pending</Text>
      </View>
    );
  }
  if (status === 'OVERDUE' || remain < 0) {
    return (
      <View style={[styles.badge, styles.badgeRed]}>
        <AlertCircle size={12} color="#E53935" style={{ marginRight: 4 }} />
        <Text style={[styles.badgeText, { color: '#E53935' }]}>
          Overdue {Math.abs(remain)} DAYS
        </Text>
      </View>
    );
  }
  if (remain === 0) {
    return (
      <View style={[styles.badge, styles.badgeYellow]}>
        <Text style={[styles.badgeText, { color: '#F59E0B' }]}>Overdue Today</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, styles.badgeGreen]}>
      <Text style={[styles.badgeText, { color: '#27AE60' }]}>Remain {remain} days</Text>
    </View>
  );
}

// ─── Book Card ─────────────────────────────────────────────────────────────────
function BookCard({ item }: { item: LoanDetailResponse }) {
  const isBorrowing = item.status === 'BORROWING';
  const isOverdue = item.status === 'OVERDUE' || (isBorrowing && item.borrowedRemain < 0);
  const isDueToday = isBorrowing && item.borrowedRemain === 0;

  const borderColor = isOverdue ? '#FDECEA' : isDueToday ? '#FFF3E0' : '#F0F0F0';
  const imgUrl = getImageUrl(item.url);
  const showRenewBtn = isBorrowing || isOverdue;

  return (
    <View style={[styles.card, { borderColor }]}>
      {/* Book cover */}
      <View style={styles.cardImageWrap}>
        {imgUrl ? (
          <Image source={{ uri: imgUrl }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <BookOpen size={26} color="#C0C0C0" />
          </View>
        )}
      </View>

      {/* Info column */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item?.title}
        </Text>
        <Text style={styles.cardAuthor} numberOfLines={1}>
          {item.author || ''}
        </Text>

        <View style={styles.cardDateRow}>
          <Calendar size={12} color="#8E8E93" />
          <Text style={styles.cardDateText}>Borrowed: {formatDate(item.borrowDate)}</Text>
        </View>
        <View style={styles.cardDateRow}>
          <Clock size={12} color="#8E8E93" />
          <Text style={styles.cardDateText}>Due Date: {formatDate(item.dueDate)}</Text>
        </View>

        <StatusBadge
          remain={item.borrowedRemain}
          status={item.status}
          returnDate={(item as any).returnDate}
        />
      </View>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function BorrowedBookScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [books, setBooks] = useState<LoanDetailResponse[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Counts từ 4 API song song
  const [counts, setCounts] = useState<TabCounts>({
    ALL: 0,
    BORROWING: 0,
    PENDING: 0,
    RETURNED: 0,
    OVERDUE: 0,
  });

  const currentTab = TABS.find(t => t.key === activeTab)!;

  // ── Fetch counts bằng 4 API song song ─────────────────────────────────────
  const fetchCounts = useCallback(async () => {
    try {
      const [resBorrowing, resPending, resReturned, resOverdue] = await Promise.allSettled([
        loanService.getLoanByUser(1, 9999, 'BORROWING'),
        loanService.getLoanByUser(1, 9999, 'PENDING'),
        loanService.getLoanByUser(1, 9999, 'RETURNED'),
        loanService.getLoanByUser(1, 9999, 'OVERDUE'),
      ]);

      const safeCount = (result: PromiseSettledResult<any>): number => {
        if (result.status === 'fulfilled') {
          const data: LoanResponse = result.value?.data?.data;
          return data?.list?.length ?? 0;
        }
        return 0;
      };

      const borrowing = safeCount(resBorrowing);
      const pending = safeCount(resPending);
      const returned = safeCount(resReturned);
      const overdue = safeCount(resOverdue);

     
      let allTotal = borrowing + pending + returned + overdue;
      try {
        const resAll = await loanService.getLoanByUser(1, 1);
        const dataAll: LoanResponse = resAll?.data?.data;
        if (dataAll?.total != null) allTotal = dataAll.total;
      } catch {
       
      }

      setCounts({ ALL: allTotal, BORROWING: borrowing, PENDING: pending, RETURNED: returned, OVERDUE: overdue });
    } catch (e) {
      console.error('fetchCounts error:', e);
    }
  }, []);


  const fetchLoans = useCallback(
    async (p: number, reset: boolean) => {
      try {
        if (reset) setLoading(true);
        else setLoadingMore(true);

        const status = currentTab.apiStatus ?? undefined;
        const res = await loanService.getLoanByUser(p, PAGE_SIZE, status);

        if (res?.data?.success && res.data.data) {
          const data: LoanResponse = res.data.data;
          if (reset) {
            setBooks(data.list ?? []);
          } else {
            setBooks(prev => [...prev, ...(data.list ?? [])]);
          }
       
          if (activeTab === 'ALL') {
            setCounts(prev => ({ ...prev, ALL: data.total ?? prev.ALL }));
          }
          setHasMore(p < (data.totalPages ?? 1));
        }
      } catch (e) {
        console.error('fetchLoans error:', e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [activeTab, currentTab.apiStatus],
  );

  
  useEffect(() => {
    fetchCounts();
  }, []);


  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchLoans(1, true);
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await Promise.all([fetchCounts(), fetchLoans(1, true)]);
  };

  const onLoadMore = () => {
    if (!loadingMore && hasMore) {
      const next = page + 1;
      setPage(next);
      fetchLoans(next, false);
    }
  };

 
  const tabIcon = (key: TabKey, active: boolean) => {
    const color = active ? '#fff' : '#6B7280';
    const size = 15;
    switch (key) {
      case 'ALL': return <Layers size={size} color={color} />;
      case 'BORROWING': return <BookOpen size={size} color={color} />;
      case 'PENDING': return <Clock size={size} color={color} />;
      case 'RETURNED': return <CheckCircle size={size} color={color} />;
      case 'OVERDUE': return <AlertCircle size={size} color={color} />;
    }
  };

  const tabActiveColor = (key: TabKey) => (key === 'OVERDUE' ? '#E53935' : '#27AE60');

  // ─── List header ──────────────────────────────────────────────────────────
  const ListHeader = () => (
    <Text style={styles.sectionTitle}>
      {currentTab.label}{' '}
      <Text style={styles.sectionCount}>({counts[activeTab]})</Text>
    </Text>
  );

  const ListEmpty = () =>
    loading ? null : (
      <View style={styles.emptyWrap}>
        <BookOpen size={52} color="#C8D6C8" />
        <Text style={styles.emptyText}>Không có sách nào</Text>
      </View>
    );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header green banner */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>LIBRARY</Text>
          <Text style={styles.headerTitle}>My Books</Text>
        </View>
        <View style={styles.headerIcons}>
          <View style={styles.bellWrap}>
            <Bell size={21} color="#fff" />
            <View style={styles.bellDot}>
              <Text style={styles.bellDotText}>1</Text>
            </View>
          </View>
          <View style={styles.avatarCircle}>
            <User size={19} color="#27AE60" />
          </View>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {TABS.map(tab => {
            const active = tab.key === activeTab;
            const count = counts[tab.key];
            const bgColor = active ? tabActiveColor(tab.key) : 'transparent';
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  active && { backgroundColor: bgColor, shadowColor: bgColor },
                  active && styles.tabActiveShadow,
                ]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.tabCountBadge,
                  ]}
                >
                  <Text style={[styles.tabCountText, active && { color: '#fff' }]}>
                    {tab.label} ({count})
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

  
      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#27AE60" />
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => <BookCard item={item} />}
          ListHeaderComponent={<ListHeader />}
          ListEmptyComponent={<ListEmpty />}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color="#27AE60" style={{ marginVertical: 14 }} />
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#27AE60']}
              tintColor="#27AE60"
            />
          }
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
        />
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  
  header: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellWrap: {
    position: 'relative',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#27AE60',
  },
  bellDotText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#fff',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },


  tabBar: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 4,
    
  },
  tabScroll: {
    paddingHorizontal: 2,
    gap: 4,
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 15,
    gap: 3,
    minWidth: 62,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  tabActiveShadow: {
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabLabelActive: {
    color: '#fff',
  },
  tabCountBadge: {
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },

  
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    marginTop: 4,
    marginBottom: 10,
  },
  sectionCount: {
    fontWeight: '500',
    color: '#6B7280',
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImageWrap: {
    width: 70,
    height: 96,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#EEF0F3',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF0F3',
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
    lineHeight: 19,
  },
  cardAuthor: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  cardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardDateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  badge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    marginTop: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeGreen: { backgroundColor: '#E8F5E9' },
  badgeRed: { backgroundColor: '#FDECEA' },
  badgeYellow: { backgroundColor: '#FFF9C4' },
  badgeBlue: { backgroundColor: '#EFF6FF' },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  renewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#27AE60',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  renewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#27AE60',
  },

  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 52,
    gap: 10,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
