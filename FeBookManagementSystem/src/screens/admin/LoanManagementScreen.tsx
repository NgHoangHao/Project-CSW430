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
  Barcode,
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
import { BACKEND_URL } from '@env';
import { useAuth } from '../../store/authProvider';

const { width: screenWidth } = Dimensions.get('window');

type TabType =
  | 'ALL'
  | 'PENDING'
  | 'BORROWING'
  | 'OVERDUE'
  | 'RETURNED'
  | 'REJECTED';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending',
  BORROWING: 'Borrowing',
  RETURNED: 'Returned',
  REJECTED: 'Rejected',
  OVERDUE: 'Overdue',
};

// --------------------------------------------------------------------------
// Sub-components
// --------------------------------------------------------------------------
const getImageUrl = (url: string) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = (BACKEND_URL || 'http://10.0.2.2:3000').replace('/api', '');
  return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
};

const StatusBadge = ({ status }: { status: string }) => {
  let bg = '#FEF3C7';
  let color = '#B45309';
  let IconComp: any = Clock;

  switch (status) {
    case 'PENDING':
      bg = '#FEF3C7';
      color = '#B45309';
      IconComp = Clock;
      break;
    case 'BORROWING':
      bg = '#DBEAFE';
      color = '#1D4ED8';
      IconComp = BookOpen;
      break;
    case 'RETURNED':
      bg = '#D1FAE5';
      color = '#065F46';
      IconComp = CheckCircle2;
      break;
    case 'OVERDUE':
      bg = '#FEE2E2';
      color = '#991B1B';
      IconComp = AlertTriangle;
      break;
    case 'REJECTED':
      bg = '#F3F4F6';
      color = '#e62323ff';
      IconComp = XCircle;
      break;
    default:
      bg = '#F3F4F6';
      color = '#6B7280';
      IconComp = Clock;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <IconComp size={11} color={color} />
      <Text style={[styles.badgeText, { color }]}>
        {STATUS_LABEL[status] ?? status}
      </Text>
    </View>
  );
};

interface BookItemRowProps {
  item: LoanDetails;
}

// --------------------------------------------------------------------------
// Main Screen
// --------------------------------------------------------------------------

export default function LoanManagementScreen() {
  const [loans, setLoans] = useState<LoanDetailDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const { userRole } = useAuth();
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;

  // Detail modal
  const [selectedLoan, setSelectedLoan] = useState<LoanDetailDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    borrowing: 0,
    rejected: 0,
    returned: 0,
    overdue: 0,
  });

  // -----------------------------------------------------------------------
  // Data fetching
  // -----------------------------------------------------------------------

  const fetchStats = useCallback(async () => {
    try {
      const [pendingRes, borrowingRes, rejectedRes, returnedRes, overdueRes] =
        await Promise.allSettled([
          loanService.getLoanByStatus('PENDING'),
          loanService.getLoanByStatus('BORROWING'),
          loanService.getLoanByStatus('REJECTED'),
          loanService.getLoanByStatus('RETURNED'),
          loanService.getLoanByStatus('OVERDUE'),
        ]);
      setStats({
        pending:
          pendingRes.status === 'fulfilled'
            ? pendingRes.value?.data?.length ?? 0
            : 0,
        borrowing:
          borrowingRes.status === 'fulfilled'
            ? borrowingRes.value?.data?.length ?? 0
            : 0,
        rejected:
          rejectedRes.status === 'fulfilled'
            ? rejectedRes.value?.data?.length ?? 0
            : 0,
        returned:
          returnedRes.status === 'fulfilled'
            ? returnedRes.value?.data?.length ?? 0
            : 0,
        overdue:
          overdueRes.status === 'fulfilled'
            ? overdueRes.value?.data?.length ?? 0
            : 0,
      });
    } catch (_) {}
  }, []);

  const refreshSelectedLoan = async () => {
    if (!selectedLoan?.loanId) return;

    try {
      setDetailLoading(true);

      const res = await loanService.getLoanDetail(selectedLoan.loanId);

      if (res?.data) {
        setSelectedLoan(res.data);
      }
    } catch (error) {
      console.error('Error refreshing loan detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchLoans = useCallback(
    async (targetPage: number, isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        if (activeTab === 'ALL') {
          const response = await loanService.getLoanDetails();
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
                userId: row.userId || '',
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
          const response = await loanService.getLoanByStatus(activeTab);
          const data: LoanDetailDTO[] = response?.data ?? [];
          setLoans(data);
        }
      } catch (error) {
        console.error('Error fetching loan requests:', error);
        Alert.alert('Error', 'Unable to load loan requests.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab],
  );

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
      } catch (_) {
      } finally {
        setDetailLoading(false);
      }
    }
  };

  const handleConfirmAction = (
    loanId: string,
    status: 'BORROWING' | 'REJECTED',
  ) => {
    const isApprove = status === 'BORROWING';
    Alert.alert(
      isApprove ? 'Approve Request' : 'Reject Request',
      isApprove
        ? 'Are you sure you want to approve this loan request?'
        : 'Are you sure you want to reject this loan request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isApprove ? 'Approve' : 'Reject',
          style: isApprove ? 'default' : 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await loanService.confirmLoan({ loanId, status });
              Alert.alert(
                'Success',
                isApprove
                  ? 'Request approved successfully.'
                  : 'Request rejected.',
              );
              setSelectedLoan(null);
              fetchLoans(page);
              fetchStats();
            } catch (err: any) {
              Alert.alert(
                'Error',
                err?.response?.data?.message ||
                  'An error occurred. Please try again.',
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleReturnLoan = (userId: string, loanId: string) => {
    Alert.alert(
      'Confirm Return',
      'Are you sure you want to confirm the return of all books in this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Return Book',
          style: 'default',
          onPress: async () => {
            if (!selectedLoan) return;
            const barcodes = selectedLoan.loanDetails
              ?.filter(d => d.status === 'BORROWING' || d.status === 'OVERDUE')
              .map(d => d.barcode)
              .filter(Boolean);
            if (!barcodes || barcodes.length === 0) {
              Alert.alert(
                'Info',
                'No books are currently borrowed in this request.',
              );
              return;
            }
            setActionLoading(true);
            try {
              await loanService.returnBookByBarcode(userId, barcodes);
              Alert.alert('Success', 'Book return confirmed successfully.');
              setSelectedLoan(null);
              fetchLoans(page);
              fetchStats();
            } catch (err: any) {
              Alert.alert(
                'Error',
                err?.response?.data?.message ||
                  'Unable to process book return.',
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleReturnBookByBarCode = async (
    userId: string,
    barcodeId?: string,
  ) => {
    // Fall back to the currently selected loan's userId if the passed value is empty
    const resolvedUserId = userId?.trim() || selectedLoan?.userId || '';
    if (!resolvedUserId) {
      Alert.alert(
        'Error',
        'Unable to identify the borrower. Please try again.',
      );
      return;
    }
    Alert.alert('Confirm return book', 'Are you sure to return book ?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Return book',
        style: 'default',
        onPress: async () => {
          const barcodes: string[] = barcodeId ? [barcodeId] : [];
          if (!barcodes || barcodes.length === 0) {
            Alert.alert(
              'Info',
              'No books are currently borrowed in this request.',
            );
            return;
          }
          setActionLoading(true);
          try {
            await loanService.returnBookByBarcode(resolvedUserId, barcodes);
            Alert.alert('Success', 'Book return confirmed successfully.');
            fetchLoans(page);
            fetchStats();
            await refreshSelectedLoan();
          } catch (err: any) {
            Alert.alert(
              'Error',
              err?.response?.data?.message || 'Unable to process book return.',
            );
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleBarcodeReturn = async () => {
    const trimmed = barcodeInput.trim();
    if (!trimmed) {
      Alert.alert('Info', 'Please enter or scan the barcode.');
      return;
    }
    if (selectedLoan == null) {
      Alert.alert('Error', 'No loan selected.');
      return;
    }
    setActionLoading(true);
    try {
      await loanService.returnBookByBarcode(selectedLoan.userId, [trimmed]);
      Alert.alert('Success', `Processed book return for barcode: ${trimmed}`);
      setBarcodeInput('');
      fetchLoans(page);
      fetchStats();
      await refreshSelectedLoan();
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Unable to process book return.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  // -----------------------------------------------------------------------
  // Filtering & Pagination
  // -----------------------------------------------------------------------

  const filteredLoans = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return loans;
    return loans.filter(
      l =>
        l.userName?.toLowerCase().includes(q) ||
        l.userId?.toLowerCase().includes(q) ||
        l.loanDetails?.some(
          d =>
            d.bookName?.toLowerCase().includes(q) ||
            d.barcode?.toLowerCase().includes(q),
        ),
    );
  }, [loans, searchQuery]);

  // Handle totalPages and page reset when filters change
  useEffect(() => {
    const newTotalPages = Math.ceil(filteredLoans.length / PAGE_SIZE) || 1;
    setTotalPages(newTotalPages);
    if (page > newTotalPages) {
      setPage(1);
    }
  }, [filteredLoans, PAGE_SIZE, page]);

  // Slice data for current page
  const paginatedLoans = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredLoans.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredLoans, page, PAGE_SIZE]);

  const BookItemRow = ({ item }: BookItemRowProps) => (
    <View style={styles.bookRow}>
      {item.url ? (
        <Image
          source={{ uri: getImageUrl(item.url) || '' }}
          style={styles.bookThumb}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.bookThumb, styles.bookThumbPlaceholder]}>
          <Book size={16} color="#9CA3AF" />
        </View>
      )}
      <View style={styles.bookRowInfo}>
        <Text style={styles.bookRowTitle} numberOfLines={2}>
          {item.bookName}
        </Text>
        <View style={styles.bookRowMeta}>
          <Barcode size={11} color="#9CA3AF" />
          <Text style={styles.bookRowMetaText}>{item.barcode}</Text>
        </View>
      </View>
      <View>
        <StatusBadge status={item.status} />
        {/* {(item.status == 'BORROWING' || item.status == 'OVERDUE') && (
          <TouchableOpacity
            style={styles.buttonReturn}
            onPress={() => handleReturnBookByBarCode(selectedLoan?.userId ?? '', item.barcode)}
          >
            <Text style={{ color: '#fff', fontWeight: '500' }}>Return</Text>
          </TouchableOpacity>
        )} */}
      </View>
    </View>
  );

  const BookItemRowDetails = ({ item }: BookItemRowProps) => (
    <View style={styles.bookRow}>
      {item.url ? (
        <Image
          source={{ uri: getImageUrl(item.url) || '' }}
          style={styles.bookThumb}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.bookThumb, styles.bookThumbPlaceholder]}>
          <Book size={16} color="#9CA3AF" />
        </View>
      )}
      <View style={styles.bookRowInfo}>
        <Text style={styles.bookRowTitle} numberOfLines={2}>
          {item.bookName}
        </Text>
        <View style={styles.bookRowMeta}>
          <Barcode size={11} color="#9CA3AF" />
          <Text style={styles.bookRowMetaText}>{item.barcode}</Text>
        </View>
      </View>
      <View>
        <StatusBadge status={item.status} />
        {(item.status == 'BORROWING' || item.status == 'OVERDUE') && (
          <TouchableOpacity
            style={styles.buttonReturn}
            onPress={() =>
              handleReturnBookByBarCode(
                selectedLoan?.userId ?? '',
                item.barcode,
              )
            }
          >
            <Text style={{ color: '#fff', fontWeight: '500' }}>Return</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------

  const TABS: { key: TabType; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'BORROWING', label: 'Borrowing' },
    { key: 'OVERDUE', label: 'Overdue' },
    { key: 'RETURNED', label: 'Returned' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  const renderLoanCard = ({ item }: { item: LoanDetailDTO }) => {
    const isPending = item.status === 'PENDING';
    const initials = item.userName
      ? item.userName
          .split(' ')
          .map(w => w[0])
          .slice(-2)
          .join('')
          .toUpperCase()
      : '?';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleOpenDetail(item)}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.cardBorrowerName} numberOfLines={1}>
              {item.userName || 'Unknown User'}
            </Text>
            <Text style={styles.cardLoanId}>
              #{item.loanId?.slice(0, 8).toUpperCase()}
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        <View style={styles.cardDates}>
          <View style={styles.dateChip}>
            <Calendar size={12} color="#6B7280" />
            <Text style={styles.dateChipText}>Borrow: {item.borrowDate}</Text>
          </View>
          <View style={styles.dateChip}>
            <Calendar
              size={12}
              color={item.status === 'OVERDUE' ? '#EF4444' : '#6B7280'}
            />
            <Text
              style={[
                styles.dateChipText,
                item.status === 'OVERDUE' && { color: '#EF4444' },
              ]}
            >
              Due: {item.dueDate}
            </Text>
          </View>
        </View>

        {item.loanDetails && item.loanDetails.length > 0 && (
          <View style={styles.bookListPreview}>
            <Text style={styles.bookListLabel}>
              Registered Books ({item.loanDetails.length} items)
            </Text>
            {item.loanDetails.slice(0, 2).map(detail => (
              <BookItemRow key={detail.loanDetailId} item={detail} />
            ))}
            {item.loanDetails.length > 2 && (
              <Text style={styles.moreBooks}>
                +{item.loanDetails.length - 2} more items...
              </Text>
            )}
          </View>
        )}

        {isPending && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => handleConfirmAction(item.loanId, 'REJECTED')}
              disabled={actionLoading}
            >
              <XCircle size={14} color="#EF4444" />
              <Text style={styles.rejectBtnText}>Reject</Text>
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
                  <Text style={styles.approveBtnText}>Approve</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* {(item.status === 'BORROWING' || item.status === 'OVERDUE') && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.returnBtn}
              onPress={() => handleOpenDetail(item)}
              disabled={actionLoading}
            >
              <ArrowDownToLine size={14} color="#ffffff" />
              <Text style={styles.returnBtnText}>Confirm Return</Text>
            </TouchableOpacity>
          </View>
        )} */}
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
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Loan Details</Text>
              <Text style={styles.modalSubtitle}>
                #{selectedLoan.loanId?.slice(0, 8).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedLoan(null)}
              style={styles.closeBtn}
            >
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalSection}>
              <View style={styles.modalBorrowerRow}>
                <View style={[styles.avatarCircle, styles.avatarCircleLg]}>
                  <Text
                    style={[styles.avatarInitials, styles.avatarInitialsLg]}
                  >
                    {(selectedLoan.userName ?? '?')
                      .split(' ')
                      .map(w => w[0])
                      .slice(-2)
                      .join('')
                      .toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.modalBorrowerName}>
                    {selectedLoan.userName || 'Unknown'}
                  </Text>
                  <Text style={styles.modalBorrowerId}>
                    ID: {selectedLoan.userId?.slice(0, 12) || '—'}
                  </Text>
                </View>
                <StatusBadge status={selectedLoan.status} />
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.sectionLabel}>Time Information</Text>
              <View style={styles.infoRow}>
                <Calendar size={14} color="#6B7280" />
                <Text style={styles.infoKey}>Borrow Date</Text>
                <Text style={styles.infoValue}>{selectedLoan.borrowDate}</Text>
              </View>
              <View style={styles.infoRow}>
                <Calendar
                  size={14}
                  color={
                    selectedLoan.status === 'OVERDUE' ? '#EF4444' : '#6B7280'
                  }
                />
                <Text
                  style={[
                    styles.infoKey,
                    selectedLoan.status === 'OVERDUE' && { color: '#EF4444' },
                  ]}
                >
                  Due Date
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    selectedLoan.status === 'OVERDUE' && {
                      color: '#EF4444',
                      fontWeight: '700',
                    },
                  ]}
                >
                  {selectedLoan.dueDate}
                </Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.sectionLabel}>
                Registered Books ({selectedLoan.loanDetails?.length ?? 0} items)
              </Text>
              {detailLoading ? (
                <ActivityIndicator color="#10B981" style={{ marginTop: 12 }} />
              ) : selectedLoan.loanDetails?.length > 0 ? (
                selectedLoan.loanDetails.map(detail => (
                  <BookItemRowDetails key={detail.loanDetailId} item={detail} />
                ))
              ) : (
                <Text style={styles.emptySubText}>No books available.</Text>
              )}
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.sectionLabel}>
                Scan / Enter barcode for quick return
              </Text>
              <View style={styles.barcodeInputRow}>
                <ScanBarcode
                  size={18}
                  color="#6B7280"
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  style={styles.barcodeInput}
                  placeholder="Enter or scan barcode..."
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

          {isPending && (
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalRejectBtn}
                onPress={() =>
                  handleConfirmAction(selectedLoan.loanId, 'REJECTED')
                }
                disabled={actionLoading}
              >
                <XCircle size={16} color="#EF4444" />
                <Text style={styles.modalRejectBtnText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalApproveBtn}
                onPress={() =>
                  handleConfirmAction(selectedLoan.loanId, 'BORROWING')
                }
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <ShieldCheck size={16} color="#fff" />
                    <Text style={styles.modalApproveBtnText}>Approve</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {(selectedLoan.status === 'BORROWING' ||
            selectedLoan.status === 'OVERDUE') && (
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalReturnBtn}
                onPress={() =>
                  handleReturnLoan(selectedLoan.userId, selectedLoan.loanId)
                }
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <ArrowDownToLine size={16} color="#fff" />
                    <Text style={styles.modalReturnBtnText}>
                      Confirm Return
                    </Text>
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
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userRole.includes('ADMIN') ? 'AD' : 'LB'}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={paginatedLoans}
        renderItem={renderLoanCard}
        keyExtractor={item => item.loanId}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#10B981']}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <ClipboardList
                  size={22}
                  color="#10B981"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.titleText}>Loan Management</Text>
              </View>
              <Text style={styles.subtitleText}>
                Track and manage book borrowing/returning.
              </Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
                <Clock size={16} color="#F59E0B" />
                <Text style={[styles.statNum, { color: '#B45309' }]}>
                  {stats.pending}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#3B82F6' }]}>
                <BookOpen size={16} color="#3B82F6" />
                <Text style={[styles.statNum, { color: '#1D4ED8' }]}>
                  {stats.borrowing}
                </Text>
                <Text style={styles.statLabel}>Borrowing</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
                <CheckCircle2 size={16} color="#10B981" />
                <Text style={[styles.statNum, { color: '#065F46' }]}>
                  {stats.returned}
                </Text>
                <Text style={styles.statLabel}>Returned</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#EF4444' }]}>
                <AlertTriangle size={16} color="#EF4444" />
                <Text style={[styles.statNum, { color: '#991B1B' }]}>
                  {stats.overdue}
                </Text>
                <Text style={styles.statLabel}>Overdue</Text>
              </View>
              <View
                style={[
                  styles.statCard,
                  { borderLeftColor: '#8B5CF6', width: '98%' },
                ]}
              >
                <XCircle size={16} color="#8B5CF6" />
                <Text style={[styles.statNum, { color: '#6D28D9' }]}>
                  {stats.rejected}
                </Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <Search size={17} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search book, borrower, barcode..."
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

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabsScroll}
            >
              <View style={styles.tabsContainer}>
                {TABS.map(tab => {
                  const isActive = activeTab === tab.key;
                  let badgeCount = 0;
                  if (tab.key === 'PENDING') badgeCount = stats.pending;
                  if (tab.key === 'BORROWING') badgeCount = stats.borrowing;
                  if (tab.key === 'OVERDUE') badgeCount = stats.overdue;

                  return (
                    <TouchableOpacity
                      key={tab.key}
                      style={[
                        styles.tabButton,
                        isActive && styles.tabButtonActive,
                      ]}
                      onPress={() => setActiveTab(tab.key)}
                    >
                      <Text
                        style={[
                          styles.tabButtonText,
                          isActive && styles.tabButtonTextActive,
                        ]}
                      >
                        {tab.label}
                        {badgeCount > 0 && ` (${badgeCount})`}
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
            <ActivityIndicator
              size="large"
              color="#10B981"
              style={styles.spinner}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Inbox size={52} color="#D1D5DB" />
              <Text style={styles.emptyText}>No data available.</Text>
              <Text style={styles.emptySubText}>
                Try changing filters or refreshing.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          filteredLoans.length > 0 ? (
            <View style={styles.paginationContainer}>
              <TouchableOpacity
                style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                onPress={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft
                  size={20}
                  color={page === 1 ? '#D1D5DB' : '#374151'}
                />
              </TouchableOpacity>
              <Text style={styles.paginationInfo}>
                Page {page} / {totalPages}
              </Text>
              <TouchableOpacity
                style={[
                  styles.pageBtn,
                  page === totalPages && styles.pageBtnDisabled,
                ]}
                onPress={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                <ChevronRight
                  size={20}
                  color={page === totalPages ? '#D1D5DB' : '#374151'}
                />
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
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
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
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  logoTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  logoSubtitle: {
    fontSize: 9,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.6,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIconButton: { padding: 6 },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: { fontSize: 12, fontWeight: '700', color: '#065F46' },
  avatarCircleLg: { width: 48, height: 48, borderRadius: 24 },
  avatarInitialsLg: { fontSize: 16 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 36 },
  titleContainer: { marginBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  titleText: { fontSize: 20, fontWeight: '800', color: '#111827' },
  subtitleText: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8, paddingRight: 16 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 4,
  },
  statNum: { fontSize: 17, fontWeight: '800' },
  statLabel: {
    fontSize: 9,
    color: '#6B7280',
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  tabsScroll: { marginBottom: 16 },
  tabsContainer: { flexDirection: 'row', gap: 8, paddingRight: 4 },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabButtonActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  tabButtonText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  tabButtonTextActive: { color: '#ffffff' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardHeaderInfo: { flex: 1, marginLeft: 10 },
  cardBorrowerName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  cardLoanId: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  cardDates: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateChipText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  bookListPreview: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
    marginBottom: 4,
  },
  bookListLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moreBooks: {
    fontSize: 11,
    color: '#10B981',
    marginTop: 6,
    fontWeight: '600',
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  bookThumb: {
    width: 40,
    height: 54,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
  },
  bookThumbPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  bookRowInfo: { flex: 1, marginRight: 8 },
  bookRowTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 17,
  },
  buttonReturn: {
    backgroundColor: '#2ad471',
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 5,
  },
  bookRowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  bookRowMetaText: { fontSize: 11, color: '#9CA3AF' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 3,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  rejectBtnText: { fontSize: 13, fontWeight: '700', color: '#EF4444' },
  approveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#10B981',
  },
  approveBtnText: { fontSize: 13, fontWeight: '700', color: '#ffffff' },
  spinner: { marginTop: 48 },
  emptyContainer: { alignItems: 'center', paddingVertical: 64 },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 14,
  },
  emptySubText: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 10,
  },
  pageBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pageBtnDisabled: { opacity: 0.4, backgroundColor: '#F9FAFB' },
  paginationInfo: { fontSize: 13, fontWeight: '600', color: '#374151' },
  modalSafe: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  modalSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  modalSection: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  modalBorrowerRow: { flexDirection: 'row', alignItems: 'center' },
  modalBorrowerName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  modalBorrowerId: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoKey: { width: 80, fontSize: 13, color: '#6B7280' },
  infoValue: { flex: 1, fontSize: 13, color: '#111827', fontWeight: '600' },
  barcodeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 46,
  },
  barcodeInput: { flex: 1, fontSize: 14, color: '#111827' },
  barcodeSendBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalRejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  modalRejectBtnText: { fontSize: 14, fontWeight: '700', color: '#EF4444' },
  modalApproveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#10B981',
  },
  modalApproveBtnText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  returnBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
  },
  returnBtnText: { fontSize: 13, fontWeight: '700', color: '#ffffff' },
  modalReturnBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
  },
  modalReturnBtnText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
});
