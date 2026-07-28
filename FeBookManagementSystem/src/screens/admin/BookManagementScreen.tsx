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
  Image,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Leaf,
  Bell,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react-native';
import { bookService } from '../../services/book.service';
import { Book } from '../../types/Book';
import { BACKEND_URL } from '@env';
import { launchImageLibrary } from 'react-native-image-picker';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function BookManagementScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [pageSize] = useState(10);


  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);


  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formPublisher, setFormPublisher] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formPage, setFormPage] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formImage, setFormImage] = useState<any>(null);
  const [formImageUrl, setFormImageUrl] = useState('');

  const fetchBooks = useCallback(async (page: number, search: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await bookService.getBookByPage(page, pageSize, search || undefined);
      if (response.data && response.data.success) {
        const data = response.data.data;
        if (Array.isArray(data)) {
          setBooks(data);
          setTotalPages(1);
          setTotalBooks(data.length);
        } else {
          setBooks(data.content ?? data.data ?? []);
          setTotalPages(data.totalPages ?? 1);
          setTotalBooks(data.totalElements ?? 0);
        }
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchBooks(1, searchText);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText, fetchBooks]);

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchBooks(1, searchText, true);
  };

  const handleDelete = (bookId: string, title: string) => {
    Alert.alert(
      'Delete book',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await bookService.deleteBook(bookId);
              if (res.data?.success) {
                Alert.alert('Thành công', 'Đã xóa sách.');
                fetchBooks(currentPage, searchText);
              } else {
                Alert.alert('Lỗi', res.data?.message || 'Không thể xóa.');
              }
            } catch (err: any) {
              Alert.alert('Lỗi', 'Lỗi hệ thống khi xóa sách.');
            }
          },
        },
      ]
    );
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditingBookId(null);
    setFormTitle('');
    setFormAuthor('');
    setFormPublisher('');
    setFormYear('');
    setFormPage('');
    setFormCategory('');
    setFormImage(null);
    setFormImageUrl('');
    setModalVisible(true);
  };

  const openEditModal = (book: Book) => {
    setIsEditing(true);
    if (book.bookId) setEditingBookId(book.bookId);
    setFormTitle(book.title || '');
    setFormAuthor(book.author || '');
    setFormPublisher(book.publisher || '');
    setFormYear(book.publishYear ? String(book.publishYear) : '');
    setFormPage(book.page ? String(book.page) : '');
    setFormCategory(book.category || '');
    setFormImage(null);
    setFormImageUrl(book.url && (book.url.startsWith('http') || !book.url.startsWith('/')) ? book.url : '');
    setModalVisible(true);
  };

  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });
      if (result.assets && result.assets.length > 0) {
        setFormImage(result.assets[0]);
        setFormImageUrl('');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const handleSubmit = async () => {
    if (!formTitle || !formAuthor) {
      Alert.alert('Lỗi', 'Vui lòng nhập Tên sách và Tác giả.');
      return;
    }

    if (!isEditing && !formImage?.uri && !formImageUrl.trim()) {
      Alert.alert('Lỗi', 'Vui lòng chọn ảnh bìa hoặc nhập link ảnh.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', formTitle);
      formData.append('author', formAuthor);
      formData.append('publisher', formPublisher);
      formData.append('publishYear', formYear);
      formData.append('page', formPage);
      formData.append('category', formCategory);

      if (formImage && formImage.uri && !formImage.uri.startsWith('http')) {
        formData.append('image', {
          uri: formImage.uri,
          type: formImage.type || 'image/jpeg',
          name: formImage.fileName || 'book_cover.jpg',
        } as any);
      } else if (formImageUrl.trim()) {
        formData.append('url', formImageUrl.trim());
      }

      if (isEditing && editingBookId) {
        const res = await bookService.updateBook(editingBookId, formData);
        if (res.data?.success) {
          Alert.alert('Thành công', 'Đã cập nhật thông tin sách.');
          setModalVisible(false);
          fetchBooks(currentPage, searchText);
        } else {
          Alert.alert('Lỗi', res.data?.message || 'Không thể cập nhật sách.');
        }
      } else {
        const res = await bookService.createBook(formData);
        if (res.status === 201 || res.data?.success) {
          Alert.alert('Thành công', 'Đã thêm sách mới.');
          setModalVisible(false);
          fetchBooks(1, searchText);
        } else {
          Alert.alert('Lỗi', res.data?.message || 'Không thể thêm sách mới.');
        }
      }
    } catch (err: any) {
      console.log(err.response?.data || err);
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể lưu sách. Vui lòng thử lại.');
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = (BACKEND_URL || 'http://10.0.2.2:3000').replace('/api', '');
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  };

  const renderBookItem = ({ item }: { item: Book }) => {
    const imageUrl = getImageUrl(item.url);
    const availableCopies = item.totalAvailableCopy || 0;

    return (
      <View style={styles.bookCard}>
        <View style={styles.bookContent}>
          <View style={styles.coverWrapper}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.bookCover} resizeMode="cover" />
            ) : (
              <View style={styles.coverPlaceholder}>
                <BookOpen size={24} color="#27AE60" />
              </View>
            )}
          </View>

          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>

            <View style={styles.bookMeta}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category || 'Khác'}</Text>
              </View>
              <Text style={styles.metaText}>{item.publishYear}</Text>
            </View>

            <View style={styles.stockInfo}>
              <Text style={styles.stockLabel}>Còn lại:</Text>
              <Text style={[styles.stockValue, { color: availableCopies > 0 ? '#27AE60' : '#EB5757' }]}>
                {availableCopies} bản
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
            <Edit2 size={16} color="#4F4F4F" />
            <Text style={styles.actionText}>Sửa</Text>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.bookId!, item.title)}>
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
          onPress={() => { setCurrentPage(prev => prev - 1); fetchBooks(currentPage - 1, searchText); }}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={18} color={currentPage === 1 ? '#C4C4C4' : '#27AE60'} />
        </TouchableOpacity>

        <Text style={styles.paginationInfo}>{currentPage} / {totalPages}</Text>

        <TouchableOpacity
          style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
          onPress={() => { setCurrentPage(prev => prev + 1); fetchBooks(currentPage + 1, searchText); }}
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
            <BookOpen size={16} color="#ffffff" />
          </View>
          <Text style={styles.headerTitle}>Quản lý Sách</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn}>
          <Bell size={20} color="#333" />
          <View style={styles.bellBadge} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>

        <View style={styles.topActions}>
          <View style={styles.searchBar}>
            <Search size={18} color="#8E8E93" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm sách..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.totalText}>Tổng cộng: {totalBooks} quyển sách</Text>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#27AE60" />
          </View>
        ) : (
          <FlatList
            data={books}
            renderItem={renderBookItem}
            keyExtractor={(item, index) => item.bookId || index.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#27AE60']} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <BookOpen size={48} color="#C8D6C8" />
                <Text style={styles.emptyText}>Chưa có sách nào.</Text>
              </View>
            }
            ListFooterComponent={renderPagination}
          />
        )}
      </View>


      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Sửa Sách' : 'Thêm Sách Mới'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {formImage && formImage.uri ? (
                  <Image source={{ uri: formImage.uri }} style={styles.previewImage} />
                ) : formImageUrl ? (
                  <Image source={{ uri: formImageUrl }} style={styles.previewImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <ImageIcon size={32} color="#8E8E93" />
                    <Text style={styles.imagePlaceholderText}>Chọn ảnh từ máy</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Hoặc nhập Link ảnh bìa trực tiếp</Text>
              <TextInput style={styles.input} value={formImageUrl} onChangeText={(text) => { setFormImageUrl(text); setFormImage(null); }} placeholder="VD: https://example.com/image.jpg" />

              <Text style={styles.inputLabel}>Tên sách *</Text>
              <TextInput style={styles.input} value={formTitle} onChangeText={setFormTitle} placeholder="Nhập tên sách" />

              <Text style={styles.inputLabel}>Tác giả *</Text>
              <TextInput style={styles.input} value={formAuthor} onChangeText={setFormAuthor} placeholder="Nhập tên tác giả" />

              <Text style={styles.inputLabel}>Nhà xuất bản</Text>
              <TextInput style={styles.input} value={formPublisher} onChangeText={setFormPublisher} placeholder="Nhập nhà xuất bản" />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Năm xuất bản</Text>
                  <TextInput style={styles.input} value={formYear} onChangeText={setFormYear} keyboardType="numeric" placeholder="VD: 2023" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.inputLabel}>Số trang</Text>
                  <TextInput style={styles.input} value={formPage} onChangeText={setFormPage} keyboardType="numeric" placeholder="VD: 300" />
                </View>
              </View>

              <Text style={styles.inputLabel}>Thể loại</Text>
              <TextInput style={styles.input} value={formCategory} onChangeText={setFormCategory} placeholder="VD: Tiểu thuyết" />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
                <Text style={styles.saveBtnText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerIconWrapper: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#27AE60',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#333333' },
  bellBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8F9FA',
    justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  bellBadge: {
    position: 'absolute', top: 8, right: 8, width: 6, height: 6,
    borderRadius: 3, backgroundColor: '#EB5757',
  },
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingHorizontal: 16, paddingTop: 16 },
  topActions: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff',
    borderRadius: 24, borderWidth: 1, borderColor: '#E5E5EA', paddingHorizontal: 16, height: 48,
    marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },
  addBtn: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#27AE60',
    justifyContent: 'center', alignItems: 'center', shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  totalText: { fontSize: 13, color: '#8E8E93', fontWeight: '500', marginBottom: 12, marginLeft: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 24 },
  bookCard: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  bookContent: { flexDirection: 'row', marginBottom: 12 },
  coverWrapper: {
    width: 64, height: 90, borderRadius: 8, backgroundColor: '#EAFBF1',
    overflow: 'hidden', marginRight: 12,
  },
  bookCover: { width: '100%', height: '100%' },
  coverPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  bookInfo: { flex: 1 },
  bookTitle: { fontSize: 15, fontWeight: '700', color: '#0D1B2A', marginBottom: 4 },
  bookAuthor: { fontSize: 13, color: '#8E8E93', marginBottom: 8 },
  bookMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  categoryBadge: { backgroundColor: '#EAFBF1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 11, color: '#27AE60', fontWeight: '600' },
  metaText: { fontSize: 12, color: '#AEAEB2' },
  stockInfo: { flexDirection: 'row', alignItems: 'center' },
  stockLabel: { fontSize: 12, color: '#8E8E93', marginRight: 4 },
  stockValue: { fontSize: 12, fontWeight: '700' },
  actionRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 6 },
  actionText: { fontSize: 13, fontWeight: '600', color: '#4F4F4F', marginLeft: 6 },
  actionDivider: { width: 1, backgroundColor: '#F0F0F0' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 12, fontSize: 14, color: '#8E8E93' },
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16 },
  pageBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', marginHorizontal: 16, borderWidth: 1, borderColor: '#E5E5EA' },
  pageBtnDisabled: { opacity: 0.5 },
  paginationInfo: { fontSize: 14, fontWeight: '600', color: '#4F4F4F' },


  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: screenHeight * 0.9 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0D1B2A' },
  closeBtn: { padding: 4 },
  formContainer: { paddingBottom: 20 },
  imagePicker: { width: 100, height: 140, borderRadius: 12, backgroundColor: '#F4F4F6', alignSelf: 'center', marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E5EA', borderStyle: 'dashed' },
  previewImage: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imagePlaceholderText: { fontSize: 11, color: '#8E8E93', marginTop: 8 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#4F4F4F', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E5E5EA', borderRadius: 12, paddingHorizontal: 14, height: 44, fontSize: 14, color: '#333' },
  rowInputs: { flexDirection: 'row' },
  modalFooter: { flexDirection: 'row', gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  cancelBtn: { flex: 1, height: 48, borderRadius: 12, backgroundColor: '#F4F4F6', justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#4F4F4F' },
  saveBtn: { flex: 1, height: 48, borderRadius: 12, backgroundColor: '#27AE60', justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
