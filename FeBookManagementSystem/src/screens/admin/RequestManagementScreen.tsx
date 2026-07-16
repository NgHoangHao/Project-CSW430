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
  Image,
  Modal,
  ScrollView,
  Dimensions,
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
  X,
  Inbox,
  ShieldCheck,
  XCircle,
  ClipboardList,
  ScanBarcode,
  SendHorizonal,
  ArrowDownToLine,
} from 'lucide-react-native';
import { loanService } from '../../services/loan.service';
import { LoanDetailDTO, LoanDetails } from '../../types/loan';

const { width: screenWidth } = Dimensions.get('window');

type TabType = 'ALL' | 'PENDING' | 'REJECTED';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  // BORROWING: 'Đang mượn',
  // RETURNED: 'Đã trả',
  REJECTED: 'Đã từ chối',
  // OVERDUE: 'Quá hạn',
};

// --------------------------------------------------------------------------
// Sub-components
// --------------------------------------------------------------------------

const StatusBadge = ({ status }: { status: string }) => {
  let bg = '#FEF3C7';
  let color = '#B45309';
  let IconComp: any = Clock;

  switch (status) {
    case 'PENDING':
      bg = '#FEF3C7'; color = '#B45309'; IconComp = Clock;
      break;
    // case 'BORROWING':
    //   bg = '#DBEAFE'; color = '#1D4ED8'; IconComp = BookOpen;
    //   break;
    // case 'RETURNED':
    //   bg = '#D1FAE5'; color = '#065F46'; IconComp = CheckCircle2;
    //   break;
    // case 'OVERDUE':
    //   bg = '#FEE2E2'; color = '#991B1B'; IconComp = AlertTriangle;
    //   break;
    case 'REJECTED':
      bg = '#F3F4F6'; color = '#e62323ff'; IconComp = XCircle;
      break;
    default:
      bg = '#F3F4F6'; color = '#6B7280'; IconComp = Clock;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <IconComp size={11} color={color} />
      <Text style={[styles.badgeText, { color }]}>{STATUS_LABEL[status] ?? status}</Text>
    </View>
  );
};

interface BookItemRowProps {
  item: LoanDetails;
}
const BookItemRow = ({ item }: BookItemRowProps) => (
  <View style={styles.bookRow}>
    {item.url ? (
      <Image source={{ uri: item.url }} style={styles.bookThumb} resizeMode="cover" />
    ) : (
      <View style={[styles.bookThumb, styles.bookThumbPlaceholder]}>
        <Book size={16} color="#9CA3AF" />
      </View>
    )}
    <View style={styles.bookRowInfo}>
      <Text style={styles.bookRowTitle} numberOfLines={2}>{item.bookName}</Text>
      <View style={styles.bookRowMeta}>
        <Barcode size={11} color="#9CA3AF" />
        <Text style={styles.bookRowMetaText}>{item.barcode}</Text>
      </View>
    </View>
    <StatusBadge status={item.status} />
  </View>
);

// --------------------------------------------------------------------------
// Main Screen
// --------------------------------------------------------------------------

export default function RequestManagementScreen() {
  const [loans, setLoans] = useState<LoanDetailDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('ALL');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;

  // Detail modal
  const [selectedLoan, setSelectedLoan] = useState<LoanDetailDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');

  // Stats (computed from the full dataset via getLoanByStatus)
  const [stats, setStats] = useState({
    pending: 0
    // , borrowing: 0
    , rejected: 0
    // , returned: 0
    // , overdue: 0 
  });

  // -----------------------------------------------------------------------
  // Data fetching
  // -----------------------------------------------------------------------

  const fetchStats = useCallback(async () => {
    try {
      const [pendingRes
        // , borrowingRes
        , rejectedRes
        // , returnedRes
        // , overdueRes
      ] = await Promise.allSettled([
        loanService.getLoanByStatus('PENDING'),
        // loanService.getLoanByStatus('BORROWING'),
        loanService.getLoanByStatus('REJECTED'),
        // loanService.getLoanByStatus('RETURNED'),
        // loanService.getLoanByStatus('OVERDUE'),
      ]);
      setStats({
        pending: pendingRes.status === 'fulfilled' ? (pendingRes.value?.data?.length ?? 0) : 0,
        // borrowing: borrowingRes.status === 'fulfilled' ? (borrowingRes.value?.data?.length ?? 0) : 0,
        rejected: rejectedRes.status === 'fulfilled' ? (rejectedRes.value?.data?.length ?? 0) : 0,
        // returned: returnedRes.status === 'fulfilled' ? (returnedRes.value?.data?.length ?? 0) : 0,
        // overdue: overdueRes.status === 'fulfilled' ? (overdueRes.value?.data?.length ?? 0) : 0,
      });
    } catch (_) { }
  }, []);

  const fetchLoans = useCallback(async (targetPage: number, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      if (activeTab === 'ALL') {
        // Use the paginated endpoint for "all" view
        const response = await loanService.getLoanDetails();
        // Group the flat LoanDetailsByPageAdmin[] into LoanDetailDTO[]
        // The endpoint returns flat rows (one per book copy), group by loanId
        const flatData = response.data || [];
        const grouped = new Map<string, LoanDetailDTO>();
        for (const row of flatData) {
          if (!grouped.has(row.loanId)) {
            grouped.set(row.loanId, {
              loanId: row.loanId,
              borrowDate: row.borrowDate,
              dueDate: row.dueDate,
              status: row.status as any,
              userName: row.userName,
              userId: row.userId,
              loanDetails: [],
            });
          }
          grouped.get(row.loanId)!.loanDetails.push({
            loanDetailId: row.loanDetailId,
            returnDate: row.returnDate,
            status: row.status as any,
            copyBookId: row.copyBookId,
            url: row.url,
            bookId: row.bookId,
            bookName: row.bookName,
            barcode: row.barcode,
          });
        }
        setLoans(Array.from(grouped.values()));
      } else {
        // Use the status-based endpoint for filtered views
        const response = await loanService.getLoanByStatus(activeTab);
        const data: LoanDetailDTO[] = response?.data ?? [];
        setLoans(data);
        setTotalPages(1); // status endpoint returns all, no pagination
      }
    } catch (error) {
      console.error('Error fetching loan requests:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu cầu mượn.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, PAGE_SIZE]);

  useEffect(() => {
    setPage(1);
    fetchLoans(1);
    fetchStats();
  }, [activeTab]);

  useEffect(() => {
    fetchLoans(page);
  }, [page]);

  const handleRefresh = () => {
    setPage(1);
    fetchLoans(1, true);
    fetchStats();
  };

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------

  const handleOpenDetail = async (loan: LoanDetailDTO) => {
    setSelectedLoan(loan);
    setBarcodeInput('');
    if (!loan.loanDetails || loan.loanDetails.length === 0) {
      setDetailLoading(true);
      try {
        const res = await loanService.getLoanDetail(loan.loanId);
        if (res?.data) setSelectedLoan(res.data);
      } catch (_) { }
      finally { setDetailLoading(false); }
    }
  };

  const handleConfirmAction = (loanId: string, status: 'BORROWING' | 'REJECTED') => {
    const isApprove = status === 'BORROWING';
    Alert.alert(
      isApprove ? 'Duyệt yêu cầu' : 'Từ chối yêu cầu',
      isApprove
        ? 'Bạn có chắc chắn muốn duyệt yêu cầu mượn sách này không?'
        : 'Bạn có chắc chắn muốn từ chối yêu cầu mượn sách này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: isApprove ? 'Duyệt' : 'Từ chối',
          style: isApprove ? 'default' : 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await loanService.confirmLoan({ loanId, status });
              Alert.alert('Thành công', isApprove ? 'Đã duyệt yêu cầu thành công.' : 'Đã từ chối yêu cầu.');
              setSelectedLoan(null);
              fetchLoans(page);
              fetchStats();
            } catch (err: any) {
              Alert.alert('Lỗi', err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReturnLoan = (loanId: string) => {
    Alert.alert(
      'Xác nhận trả sách',
      'Bạn có chắc chắn muốn xác nhận trả tất cả sách của yêu cầu này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Trả sách',
          style: 'default',
          onPress: async () => {
            if (!selectedLoan) return;
            const barcodes = selectedLoan.loanDetails
              ?.filter((d) => d.status === 'BORROWING' || d.status === 'OVERDUE')
              .map((d) => d.barcode)
              .filter(Boolean);
            if (!barcodes || barcodes.length === 0) {
              Alert.alert('Thông báo', 'Không có sách nào đang được mượn trong yêu cầu này.');
              return;
            }
            setActionLoading(true);
            try {
              await loanService.returnBookByBarcode(barcodes);
              Alert.alert('Thành công', 'Đã xác nhận trả sách thành công.');
              setSelectedLoan(null);
              fetchLoans(page);
              fetchStats();
            } catch (err: any) {
              Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể xử lý trả sách.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleBarcodeReturn = async () => {
    const trimmed = barcodeInput.trim();
    if (!trimmed) {
      Alert.alert('Thông báo', 'Vui lòng nhập hoặc quét mã barcode.');
      return;
    }
    setActionLoading(true);
    try {
      await loanService.returnBookByBarcode([trimmed]);
      Alert.alert('Thành công', `Đã xử lý trả sách cho barcode: ${trimmed}`);
      setBarcodeInput('');
      fetchLoans(page);
      fetchStats();
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể xử lý trả sách.');
    } finally {
      setActionLoading(false);
    }
  };

  // -----------------------------------------------------------------------
  // Filtering
  // -----------------------------------------------------------------------

  const filteredLoans = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return loans;
    return loans.filter(
      (l) =>
        l.userName?.toLowerCase().includes(q) ||
        l.userId?.toLowerCase().includes(q) ||
        l.loanDetails?.some(
          (d) =>
            d.bookName?.toLowerCase().includes(q) ||
            d.barcode?.toLowerCase().includes(q)
        )
    );
  }, [loans, searchQuery]);

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------

  const TABS: { key: TabType; label: string }[] = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'PENDING', label: 'Chờ duyệt' },
    // { key: 'BORROWING', label: 'Đang mượn' },
    { key: 'REJECTED', label: 'Đã từ chối' },
  ];

  const renderLoanCard = ({ item }: { item: LoanDetailDTO }) => {
    const isPending = item.status === 'PENDING';
    const initials = item.userName
      ? item.userName.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()
      : '?';

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleOpenDetail(item)} activeOpacity={0.85}>
        {/* Card header: Borrower info + Status */}
        <View style={styles.cardHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.cardBorrowerName} numberOfLines={1}>
              {item.userName || 'Người dùng không rõ'}
            </Text>
            <Text style={styles.cardLoanId}>#{item.loanId?.slice(0, 8).toUpperCase()}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        {/* Dates */}
        <View style={styles.cardDates}>
          <View style={styles.dateChip}>
            <Calendar size={12} color="#6B7280" />
            <Text style={styles.dateChipText}>Mượn: {item.borrowDate}</Text>
          </View>
          <View style={styles.dateChip}>
            <Calendar size={12} color={item.status === 'OVERDUE' ? '#EF4444' : '#6B7280'} />
            <Text style={[styles.dateChipText, item.status === 'OVERDUE' && { color: '#EF4444' }]}>
              Hạn: {item.dueDate}
            </Text>
          </View>
        </View>

        {/* Book list preview (max 2) */}
        {item.loanDetails && item.loanDetails.length > 0 && (
          <View style={styles.bookListPreview}>
            <Text style={styles.bookListLabel}>
              Sách đăng ký ({item.loanDetails.length} cuốn)
            </Text>
            {item.loanDetails.slice(0, 2).map((detail) => (
              <BookItemRow key={detail.loanDetailId} item={detail} />
            ))}
            {item.loanDetails.length > 2 && (
              <Text style={styles.moreBooks}>+{item.loanDetails.length - 2} cuốn khác...</Text>
            )}
          </View>
        )}

        {/* Action buttons (PENDING only) */}
        {isPending && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => handleConfirmAction(item.loanId, 'REJECTED')}
              disabled={actionLoading}
            >
              <XCircle size={14} color="#EF4444" />
              <Text style={styles.rejectBtnText}>Từ chối</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.approveBtn}
              onPress={() => handleConfirmAction(item.loanId, 'BORROWING')}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <ShieldCheck size={14} color="#ffffff" />
                  <Text style={styles.approveBtnText}>Duyệt yêu cầu</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Return button (BORROWING / OVERDUE) */}
        {(item.status === 'BORROWING' || item.status === 'OVERDUE') && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.returnBtn}
              onPress={() => handleOpenDetail(item)}
              disabled={actionLoading}
            >
              <ArrowDownToLine size={14} color="#ffffff" />
              <Text style={styles.returnBtnText}>Xác nhận trả sách</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // -----------------------------------------------------------------------
  // Detail Modal
  // -----------------------------------------------------------------------

  const renderDetailModal = () => {
    if (!selectedLoan) return null;
    const isPending = selectedLoan.status === 'PENDING';

    return (
      <Modal
        visible={!!selectedLoan}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedLoan(null)}
      >
        <SafeAreaView style={styles.modalSafe}>
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Chi tiết yêu cầu</Text>
              <Text style={styles.modalSubtitle}>#{selectedLoan.loanId?.slice(0, 8).toUpperCase()}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedLoan(null)} style={styles.closeBtn}>
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {/* Borrower info card */}
            <View style={styles.modalSection}>
              <View style={styles.modalBorrowerRow}>
                <View style={[styles.avatarCircle, styles.avatarCircleLg]}>
                  <Text style={[styles.avatarInitials, styles.avatarInitialsLg]}>
                    {(selectedLoan.userName ?? '?').split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.modalBorrowerName}>{selectedLoan.userName || 'Không rõ'}</Text>
                  <Text style={styles.modalBorrowerId}>ID: {selectedLoan.userId?.slice(0, 12) || '—'}</Text>
                </View>
                <StatusBadge status={selectedLoan.status} />
              </View>
            </View>

            {/* Dates */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionLabel}>Thông tin thời gian</Text>
              <View style={styles.infoRow}>
                <Calendar size={14} color="#6B7280" />
                <Text style={styles.infoKey}>Ngày mượn</Text>
                <Text style={styles.infoValue}>{selectedLoan.borrowDate}</Text>
              </View>
              <View style={styles.infoRow}>
                <Calendar size={14} color={selectedLoan.status === 'OVERDUE' ? '#EF4444' : '#6B7280'} />
                <Text style={[styles.infoKey, selectedLoan.status === 'OVERDUE' && { color: '#EF4444' }]}>Hạn trả</Text>
                <Text style={[styles.infoValue, selectedLoan.status === 'OVERDUE' && { color: '#EF4444', fontWeight: '700' }]}>
                  {selectedLoan.dueDate}
                </Text>
              </View>
            </View>

            {/* Book list */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionLabel}>
                Sách đăng ký ({selectedLoan.loanDetails?.length ?? 0} cuốn)
              </Text>
              {detailLoading ? (
                <ActivityIndicator color="#10B981" style={{ marginTop: 12 }} />
              ) : selectedLoan.loanDetails?.length > 0 ? (
                selectedLoan.loanDetails.map((detail) => (
                  <BookItemRow key={detail.loanDetailId} item={detail} />
                ))
              ) : (
                <Text style={styles.emptySubText}>Không có sách nào.</Text>
              )}
            </View>

            {/* Barcode quick return */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionLabel}>Quét / Nhập barcode trả sách nhanh</Text>
              <View style={styles.barcodeInputRow}>
                <ScanBarcode size={18} color="#6B7280" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.barcodeInput}
                  placeholder="Nhập hoặc quét barcode..."
                  placeholderTextColor="#9CA3AF"
                  value={barcodeInput}
                  onChangeText={setBarcodeInput}
                  returnKeyType="send"
                  onSubmitEditing={handleBarcodeReturn}
                />
                <TouchableOpacity
                  style={styles.barcodeSendBtn}
                  onPress={handleBarcodeReturn}
                  disabled={actionLoading}
                >
                  <SendHorizonal size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Sticky action footer (PENDING only) */}
          {isPending && (
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalRejectBtn}
                onPress={() => handleConfirmAction(selectedLoan.loanId, 'REJECTED')}
                disabled={actionLoading}
              >
                <XCircle size={16} color="#EF4444" />
                <Text style={styles.modalRejectBtnText}>Từ chối</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalApproveBtn}
                onPress={() => handleConfirmAction(selectedLoan.loanId, 'BORROWING')}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <ShieldCheck size={16} color="#fff" />
                    <Text style={styles.modalApproveBtnText}>Duyệt yêu cầu</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Sticky action footer (BORROWING / OVERDUE) */}
          {(selectedLoan.status === 'BORROWING' || selectedLoan.status === 'OVERDUE') && (
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalReturnBtn}
                onPress={() => handleReturnLoan(selectedLoan.loanId)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <ArrowDownToLine size={16} color="#fff" />
                    <Text style={styles.modalReturnBtnText}>Xác nhận trả sách</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    );
  };

  // -----------------------------------------------------------------------
  // Root render
  // -----------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* App header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Leaf size={15} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.logoTitle}>BookConnect</Text>
            <Text style={styles.logoSubtitle}>ADMIN PANEL</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Bell size={20} color="#374151" />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>AD</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredLoans}
        renderItem={renderLoanCard}
        keyExtractor={(item) => item.loanId}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#10B981']} />
        }
        ListHeaderComponent={
          <>
            {/* Page title */}
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <ClipboardList size={22} color="#10B981" style={{ marginRight: 8 }} />
                <Text style={styles.titleText}>Yêu cầu mượn sách</Text>
              </View>
              <Text style={styles.subtitleText}>Duyệt, từ chối và theo dõi yêu cầu mượn.</Text>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { borderTopColor: '#F59E0B' }]}>
                <Clock size={16} color="#F59E0B" />
                <Text style={[styles.statNum, { color: '#B45309' }]}>{stats.pending}</Text>
                <Text style={styles.statLabel}>Chờ duyệt</Text>
              </View>
              {/* <View style={[styles.statCard, { borderTopColor: '#3B82F6' }]}>
                <BookOpen size={16} color="#3B82F6" />
                <Text style={[styles.statNum, { color: '#1D4ED8' }]}>{stats.borrowing}</Text>
                <Text style={styles.statLabel}>Đang mượn</Text>
              </View>
              <View style={[styles.statCard, { borderTopColor: '#10B981' }]}>
                <CheckCircle2 size={16} color="#10B981" />
                <Text style={[styles.statNum, { color: '#065F46' }]}>{stats.returned}</Text>
                <Text style={styles.statLabel}>Đã trả</Text>
              </View>
              <View style={[styles.statCard, { borderTopColor: '#EF4444' }]}>
                <AlertTriangle size={16} color="#EF4444" />
                <Text style={[styles.statNum, { color: '#991B1B' }]}>{stats.overdue}</Text>
                <Text style={styles.statLabel}>Quá hạn</Text>
              </View> */}
              <View style={[styles.statCard, { borderTopColor: '#EF4444' }]}>
                <XCircle size={16} color="#EF4444" />
                <Text style={[styles.statNum, { color: '#ff0000ff' }]}>{stats.rejected}</Text>
                <Text style={styles.statLabel}>Từ chối</Text>
              </View>
            </View>

            {/* Search bar */}
            <View style={styles.searchContainer}>
              <Search size={17} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm sách, người mượn, barcode..."
                placeholderTextColor="#D1D5DB"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Status tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
              <View style={styles.tabsContainer}>
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      style={[styles.tabButton, isActive && styles.tabButtonActive]}
                      onPress={() => setActiveTab(tab.key)}
                    >
                      <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                        {tab.label}
                        {tab.key === 'PENDING' && stats.pending > 0 && ` (${stats.pending})`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#10B981" style={styles.spinner} />
          ) : (
            <View style={styles.emptyContainer}>
              <Inbox size={52} color="#D1D5DB" />
              <Text style={styles.emptyText}>Không có yêu cầu nào.</Text>
              <Text style={styles.emptySubText}>Thử đổi bộ lọc hoặc làm mới danh sách.</Text>
            </View>
          )
        }
        ListFooterComponent={
          filteredLoans.length > 0 && activeTab === 'ALL' ? (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                onPress={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={20} color={page === 1 ? '#D1D5DB' : '#374151'} />
              </TouchableOpacity>
              <Text style={styles.paginationInfo}>Trang {page} / {totalPages}</Text>
              <TouchableOpacity
                style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
                onPress={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                <ChevronRight size={20} color={page === totalPages ? '#D1D5DB' : '#374151'} />
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {renderDetailModal()}
    </SafeAreaView>
  );
}

// --------------------------------------------------------------------------
// Styles
// --------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // ---- Header ----
  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: {
    width: 28, height: 28, borderRadius: 7,
    backgroundColor: '#10B981',
    justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  logoTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  logoSubtitle: { fontSize: 9, fontWeight: '600', color: '#9CA3AF', letterSpacing: 0.6 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIconButton: { padding: 6 },

  // ---- Avatar ----
  avatarCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { fontSize: 12, fontWeight: '700', color: '#065F46' },
  avatarCircleLg: { width: 48, height: 48, borderRadius: 24 },
  avatarInitialsLg: { fontSize: 16 },

  // ---- List container ----
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
  },

  // ---- Title ----
  titleContainer: { marginBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  titleText: { fontSize: 20, fontWeight: '800', color: '#111827' },
  subtitleText: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  // ---- Stats ----
  statsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 3,
  },
  statNum: { fontSize: 17, fontWeight: '800' },
  statLabel: { fontSize: 9, color: '#6B7280', fontWeight: '500', textAlign: 'center' },

  // ---- Search ----
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10, paddingHorizontal: 12, height: 44,
    borderWidth: 1, borderColor: '#E5E7EB',
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },

  // ---- Tabs ----
  tabsScroll: { marginBottom: 16 },
  tabsContainer: { flexDirection: 'row', gap: 8, paddingRight: 4 },
  tabButton: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB',
  },
  tabButtonActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  tabButtonText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  tabButtonTextActive: { color: '#ffffff' },

  // ---- Loan Card ----
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardHeaderInfo: { flex: 1, marginLeft: 10 },
  cardBorrowerName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  cardLoanId: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },

  cardDates: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  dateChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F9FAFB', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  dateChipText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },

  // ---- Book list (card) ----
  bookListPreview: {
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
    paddingTop: 10, marginBottom: 4,
  },
  bookListLabel: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  moreBooks: { fontSize: 11, color: '#10B981', marginTop: 6, fontWeight: '600' },

  // ---- Book row (shared) ----
  bookRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  bookThumb: {
    width: 40, height: 54, borderRadius: 6, marginRight: 10,
    backgroundColor: '#F0F0F0',
  },
  bookThumbPlaceholder: {
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  bookRowInfo: { flex: 1, marginRight: 8 },
  bookRowTitle: { fontSize: 13, fontWeight: '600', color: '#111827', lineHeight: 17 },
  bookRowMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  bookRowMetaText: { fontSize: 11, color: '#9CA3AF' },

  // ---- Badge ----
  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 20, gap: 3,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },

  // ---- Card actions ----
  cardActions: {
    flexDirection: 'row', gap: 10,
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  rejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 9, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  rejectBtnText: { fontSize: 13, fontWeight: '700', color: '#EF4444' },
  approveBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 9, borderRadius: 10,
    backgroundColor: '#10B981',
  },
  approveBtnText: { fontSize: 13, fontWeight: '700', color: '#ffffff' },

  // ---- Empty/Spinner ----
  spinner: { marginTop: 48 },
  emptyContainer: { alignItems: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#4B5563', marginTop: 14 },
  emptySubText: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },

  // ---- Pagination ----
  paginationContainer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: 16, paddingVertical: 10,
  },
  pageBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center',
    marginHorizontal: 14, borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  pageBtnDisabled: { opacity: 0.4, backgroundColor: '#F9FAFB' },
  paginationInfo: { fontSize: 13, fontWeight: '600', color: '#374151' },

  // ---- Detail Modal ----
  modalSafe: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  modalSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  modalScroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  modalSection: {
    backgroundColor: '#ffffff',
    borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12,
  },
  modalBorrowerRow: { flexDirection: 'row', alignItems: 'center' },
  modalBorrowerName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  modalBorrowerId: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8,
  },
  infoKey: { width: 80, fontSize: 13, color: '#6B7280' },
  infoValue: { flex: 1, fontSize: 13, color: '#111827', fontWeight: '600' },

  // ---- Barcode input ----
  barcodeInputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 12, height: 46,
  },
  barcodeInput: { flex: 1, fontSize: 14, color: '#111827' },
  barcodeSendBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#10B981',
    justifyContent: 'center', alignItems: 'center',
  },

  // ---- Modal footer ----
  modalFooter: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  modalRejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 13, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  modalRejectBtnText: { fontSize: 14, fontWeight: '700', color: '#EF4444' },
  modalApproveBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 13, borderRadius: 12,
    backgroundColor: '#10B981',
  },
  modalApproveBtnText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },

  // ---- Return button (card) ----
  returnBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 9, borderRadius: 10,
    backgroundColor: '#3B82F6',
  },
  returnBtnText: { fontSize: 13, fontWeight: '700', color: '#ffffff' },

  // ---- Return button (modal footer) ----
  modalReturnBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 13, borderRadius: 12,
    backgroundColor: '#3B82F6',
  },
  modalReturnBtnText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
});