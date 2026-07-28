import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Search, X, ChevronLeft, ChevronRight, Star, Plus, Minus } from 'lucide-react-native';
import { bookService } from '../../services/book.service';
import { loanService } from '../../services/loan.service';
import { Book } from '../../types/Book';
import { BACKEND_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserStackParamList } from '../../navigation/types';

const PAGE_SIZE = 10;

export default function BookSearch() {
  const navigation = useNavigation<NativeStackNavigationProp<UserStackParamList>>();

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedCopies, setSelectedCopies] = useState<Record<string, string[]>>({});
  const [borrowing, setBorrowing] = useState(false);
  const borrowBarAnim = useRef(new Animated.Value(100)).current;

  const totalSelected = Object.values(selectedCopies).flat().length;

  useEffect(() => {
    Animated.spring(borrowBarAnim, {
      toValue: totalSelected > 0 ? 0 : 100,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [totalSelected]);

  const handleIncrement = (book: Book) => {
    if (!book.bookId) return;
    const availableCopies = book.availableBooks || [];
    const copiesList = availableCopies.map(cb => cb.copyBookId).filter(Boolean) as string[];

    if (copiesList.length === 0) return;

    setSelectedCopies(prev => {
      const list = prev[book.bookId!] || [];
      if (list.length < copiesList.length) {
        const nextId = copiesList.find(id => !list.includes(id));
        if (nextId) {
          return { ...prev, [book.bookId!]: [...list, nextId] };
        }
      }
      return prev;
    });
  };

  const handleDecrement = (bookId: string) => {
    setSelectedCopies(prev => {
      const list = prev[bookId] || [];
      if (list.length <= 1) {
        const next = { ...prev };
        delete next[bookId];
        return next;
      }
      return { ...prev, [bookId]: list.slice(0, list.length - 1) };
    });
  };

  const handleBorrow = async () => {
    const allSelectedCopyIds = Object.values(selectedCopies).flat();
    if (allSelectedCopyIds.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất 1 cuốn sách để mượn.');
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    setBorrowing(true);
    try {
      await loanService.createLoan({
        bookIds: allSelectedCopyIds,
        dueDate: dueDate.toISOString(),
      });

      Alert.alert('Thành công 🎉', 'Yêu cầu mượn sách đã được gửi thành công và đang chờ phê duyệt.');
      setSelectedCopies({});
      fetchBooks(currentPage, debouncedSearch);
    } catch (error: any) {
      console.log('Lỗi khi mượn sách:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi thực hiện mượn sách.';
      Alert.alert('Thất bại', errorMsg);
    } finally {
      setBorrowing(false);
    }
  };

  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  const fetchBooks = useCallback(
    async (page: number, title: string) => {
      setLoading(true);
      setHasSearched(true);
      try {
        const res = await bookService.getBookByPage(page, PAGE_SIZE, title || undefined);
        if (res.data && res.data.success) {
          const data = res.data.data;
          // Handle both array and paginated response
          if (Array.isArray(data)) {
            setBooks(data);
            setTotalPages(1);
            setTotalElements(data.length);
          } else {
            setBooks(data.content ?? data.data ?? []);
            setTotalPages(data.totalPages ?? 1);
            setTotalElements(data.totalElements ?? 0);
          }

          // Animate results in
          fadeAnim.setValue(0);
          slideAnim.setValue(20);
          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]).start();
        }
      } catch (err) {
        console.log('Error fetching books:', err);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    },
    [fadeAnim, slideAnim]
  );

  useEffect(() => {
    fetchBooks(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const getImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = (BACKEND_URL || 'http://10.0.2.2:3000').replace('/api', '');
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  };

  const handleClear = () => {
    setSearchText('');
    setDebouncedSearch('');
    setCurrentPage(1);
    inputRef.current?.focus();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const renderBook = ({ item, index }: { item: Book; index: number }) => {
    const imageUrl = getImageUrl(item.url);
    const availableCopies = item.availableBooks || [];
    const availableCount = availableCopies.length;
    const isAvailable = availableCount > 0;
    const selectedList = item.bookId ? (selectedCopies[item.bookId] || []) : [];
    const selectedQty = selectedList.length;

    return (
      <Animated.View
        style={[
          styles.bookCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.bookCardInner}
          onPress={() => item.bookId && navigation.navigate('BookDetail', { bookId: item.bookId })}
        >
          {/* Book Cover */}
          <View style={styles.bookCoverWrapper}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.bookCover} resizeMode="cover" />
            ) : (
              <View style={styles.bookCoverPlaceholder}>
                <BookOpen size={28} color="#27AE60" />
              </View>
            )}
          </View>

          {/* Book Info */}
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>
              {item.author}
            </Text>

            <View style={styles.bookMeta}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText} numberOfLines={1}>
                  {item.category || 'Khác'}
                </Text>
              </View>
              <Text style={styles.publishYear}>{item.publishYear}</Text>
            </View>

            {/* Rating and Action Row */}
            <View style={styles.ratingAndActionRow}>
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={11}
                    color="#FFB000"
                    fill={s <= Math.round(((item.title.charCodeAt(0) % 5) * 0.1 + 4.5)) ? '#FFB000' : 'none'}
                  />
                ))}
                <Text style={styles.ratingNum}>
                  {((item.title.charCodeAt(0) % 5) * 0.1 + 4.5).toFixed(1)}
                </Text>
              </View>

              {/* Quantity selector/Button */}
              {isAvailable ? (
                selectedQty === 0 ? (
                  <View style={styles.actionColumn}>
                    <Text style={styles.availableCountText}> Available: {availableCount} books</Text>
                    <TouchableOpacity
                      style={styles.selectBtn}
                      onPress={() => handleIncrement(item)}
                      activeOpacity={0.7}
                    >
                      <Plus size={12} color="#27AE60" style={{ marginRight: 2 }} />
                      <Text style={styles.selectBtnText}>Choose</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.actionColumn}>
                    <Text style={styles.availableCountText}> Available: {availableCount} books</Text>
                    <View style={styles.stepperContainer}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => item.bookId && handleDecrement(item.bookId)}
                        activeOpacity={0.7}
                      >
                        <Minus size={12} color="#27AE60" />
                      </TouchableOpacity>
                      <Text style={styles.stepperValue}>{selectedQty}</Text>
                      <TouchableOpacity
                        style={[
                          styles.stepperBtn,
                          selectedQty >= availableCount && styles.stepperBtnDisabled,
                        ]}
                        onPress={() => handleIncrement(item)}
                        activeOpacity={0.7}
                        disabled={selectedQty >= availableCount}
                      >
                        <Plus size={12} color={selectedQty >= availableCount ? '#C7C7CC' : '#27AE60'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              ) : (
                <View style={styles.statusBadgeUnavailable}>
                  <Text style={styles.statusTextUnavailable}>Hết sách</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    if (!hasSearched) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrapper}>
          <BookOpen size={48} color="#C8D6C8" />
        </View>
        <Text style={styles.emptyTitle}>Không tìm thấy sách</Text>
        <Text style={styles.emptySubtitle}>
          {searchText ? `No results for "${searchText}"` : 'No books in the system yet'}
        </Text>
      </View>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1 || books.length === 0) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <View style={styles.paginationContainer}>
        <Text style={styles.paginationInfo}>
          {totalElements} sách • Trang {currentPage}/{totalPages}
        </Text>
        <View style={styles.paginationRow}>
          <TouchableOpacity
            style={[styles.pageArrow, currentPage === 1 && styles.pageArrowDisabled]}
            onPress={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            activeOpacity={0.7}
          >
            <ChevronLeft size={18} color={currentPage === 1 ? '#C7C7CC' : '#27AE60'} />
          </TouchableOpacity>

          {pages.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.pageBtn, p === currentPage && styles.pageBtnActive]}
              onPress={() => handlePageChange(p)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pageBtnText, p === currentPage && styles.pageBtnTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.pageArrow, currentPage === totalPages && styles.pageArrowDisabled]}
            onPress={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            activeOpacity={0.7}
          >
            <ChevronRight size={18} color={currentPage === totalPages ? '#C7C7CC' : '#27AE60'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tìm kiếm sách 📚</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarWrapper}>
          <View style={styles.searchBar}>
            <Search size={18} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Nhập tên sách cần tìm..."
              placeholderTextColor="#AEAEB2"
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
              onSubmitEditing={() => Keyboard.dismiss()}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={handleClear} activeOpacity={0.7} style={styles.clearBtn}>
                <X size={16} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results info */}
        {hasSearched && !loading && books.length > 0 && (
          <View style={styles.resultInfo}>
            <Text style={styles.resultInfoText}>
              {searchText ? `Kết quả cho "${searchText}"` : 'Tất cả sách'}
            </Text>
            <Text style={styles.resultCount}>{totalElements} sách</Text>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#27AE60" />
            <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
          </View>
        )}

        {/* Book List */}
        {!loading && (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <FlatList
              data={books}
              keyExtractor={(item, index) => item.bookId ?? index.toString()}
              renderItem={renderBook}
              ListEmptyComponent={renderEmpty}
              ListFooterComponent={renderPagination}
              contentContainerStyle={[
                styles.listContent,
                books.length === 0 && styles.listContentEmpty,
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          </TouchableWithoutFeedback>
        )}

        {/* Floating Borrow Bar */}
        <Animated.View style={[
          styles.borrowBar,
          {
            transform: [{ translateY: borrowBarAnim }],
            opacity: borrowBarAnim.interpolate({
              inputRange: [0, 100],
              outputRange: [1, 0]
            })
          }
        ]}>
          <View style={styles.borrowBarInner}>
            <View style={styles.borrowInfo}>
              <View style={styles.selectedCountBadge}>
                <Text style={styles.selectedCountBadgeText}>{totalSelected}</Text>
              </View>
              <Text style={styles.selectedCountLabel}>sách đã chọn</Text>
            </View>
            <TouchableOpacity
              style={[styles.borrowBtn, borrowing && styles.borrowBtnDisabled]}
              onPress={handleBorrow}
              activeOpacity={0.8}
              disabled={borrowing}
            >
              {borrowing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.borrowBtnText}>Mượn ngay 📚</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0D1B2A',
  },

  // Search Bar
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F6',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0D1B2A',
    fontWeight: '500',
    paddingVertical: 0,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // Result info
  resultInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultInfoText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
    flex: 1,
  },
  resultCount: {
    fontSize: 13,
    color: '#27AE60',
    fontWeight: '700',
  },

  // Loading
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

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
  },
  listContentEmpty: {
    flex: 1,
  },

  // Book Card
  bookCard: {
    marginBottom: 12,
  },
  bookCardInner: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  bookCoverWrapper: {
    width: 72,
    height: 102,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#EAFBF1',
    marginRight: 12,
    flexShrink: 0,
  },
  bookCover: {
    width: '100%',
    height: '100%',
  },
  bookCoverPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAFBF1',
  },
  bookInfo: {
    flex: 1,
    paddingRight: 8,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D1B2A',
    lineHeight: 20,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: '#EAFBF1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    maxWidth: 120,
  },
  categoryText: {
    fontSize: 11,
    color: '#27AE60',
    fontWeight: '600',
  },
  publishYear: {
    fontSize: 11,
    color: '#AEAEB2',
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    marginLeft: 4,
  },

  // Status Badge
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  statusAvailable: {
    backgroundColor: '#EAFBF1',
  },
  statusUnavailable: {
    backgroundColor: '#FFF3F0',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextAvailable: {
    color: '#27AE60',
  },
  statusTextUnavailable: {
    color: '#FF6B6B',
  },

  // Empty
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
    backgroundColor: '#F4FAF4',
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

  // Pagination
  paginationContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 10,
  },
  paginationInfo: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F4F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageArrowDisabled: {
    opacity: 0.4,
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F4F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageBtnActive: {
    backgroundColor: '#27AE60',
  },
  pageBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  pageBtnTextActive: {
    color: '#fff',
  },
  ratingAndActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 8,
  },
  actionColumn: {
    alignItems: 'flex-end',
    minWidth: 90,
  },
  availableCountText: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 4,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#27AE60',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  selectBtnText: {
    color: '#27AE60',
    fontSize: 12,
    fontWeight: '700',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#E5E5EA',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#F4F4F6',
    padding: 2,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  stepperBtnDisabled: {
    opacity: 0.5,
    backgroundColor: '#F4F4F6',
  },
  stepperValue: {
    marginHorizontal: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#0D1B2A',
    minWidth: 16,
    textAlign: 'center',
  },
  statusBadgeUnavailable: {
    backgroundColor: '#FFF3F0',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  borrowBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#EAFBF1',
    padding: 16,
  },
  borrowBarInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  borrowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedCountBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCountBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  selectedCountLabel: {
    fontSize: 14,
    color: '#0D1B2A',
    fontWeight: '700',
  },
  borrowBtn: {
    backgroundColor: '#27AE60',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  borrowBtnDisabled: {
    opacity: 0.5,
  },
  borrowBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
