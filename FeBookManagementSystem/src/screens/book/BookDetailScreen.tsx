import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  ChevronLeft,
  Bookmark,
  Star,
  BookOpen,
  Globe,
  Calendar,
  Building2,
  Hash,
  FileText,
  Package,
  MapPin,
  Barcode,
  AlignLeft,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { bookService } from '../../services/book.service';
import { Book, CopyBook } from '../../types/Book';
import { BACKEND_URL } from '@env';
import { UserStackParamList } from '../../navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type BookDetailRouteProp = RouteProp<UserStackParamList, 'BookDetail'>;

interface BookDetail extends Book {
  isbn?: string;
  language?: string;
  description?: string;
}

export default function BookDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<BookDetailRouteProp>();
  const { bookId } = route.params;

  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const bookmarkScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchBookDetail();
  }, [bookId]);

  const fetchBookDetail = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await bookService.getBookDetail(bookId);
      if (res.data && res.data.success) {
        setBook(res.data.data);
        // Animate in
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(headerOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
      } else {
        setError(true);
      }
    } catch (err) {
      console.log('Error fetching book detail:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseUrl = (BACKEND_URL || 'http://10.0.2.2:3000').replace('/api', '');
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  };

  const handleBookmark = () => {
    Animated.sequence([
      Animated.timing(bookmarkScale, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.timing(bookmarkScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(bookmarkScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    setBookmarked((prev) => !prev);
  };

  const isAvailable =
    book?.status === 'AVAILABLE' || (book?.totalAvailableCopy !== undefined && book.totalAvailableCopy > 0);

  const renderStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={14}
        color="#FFB000"
        fill={s <= Math.round(rating) ? '#FFB000' : 'none'}
        style={{ marginRight: 2 }}
      />
    ));
  };

  const mockRating = book
    ? parseFloat(((book.title.charCodeAt(0) % 5) * 0.1 + 4.5).toFixed(1))
    : 4.5;
  const mockReviews = book ? (book.title.charCodeAt(0) % 200) + 50 : 128;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27AE60" />
        <Text style={styles.loadingText}>Loading book informaton...</Text>
      </SafeAreaView>
    );
  }

  if (error || !book) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <BookOpen size={56} color="#C8D6C8" />
        <Text style={styles.errorTitle}>Unable to download the book.</Text>
        <Text style={styles.errorSubtitle}>Please try again later.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchBookDetail}>
          <Text style={styles.retryBtnText}>Try again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtnError} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnErrorText}>Return</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const imageUrl = getImageUrl(book.url);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ChevronLeft size={22} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Detail</Text>
        <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
          <TouchableOpacity style={styles.bookmarkBtn} onPress={handleBookmark} activeOpacity={0.7}>
            <Bookmark
              size={20}
              color={bookmarked ? '#27AE60' : '#0D1B2A'}
              fill={bookmarked ? '#27AE60' : 'none'}
            />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <View style={styles.heroBg} />
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.heroImage} resizeMode="contain" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <BookOpen size={60} color="#27AE60" />
            </View>
          )}
        </View>

        <Animated.View style={[styles.contentCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Title & Author */}
          <View style={styles.titleSection}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookAuthor}>{book.author}</Text>

            {/* Rating */}
            <View style={styles.ratingRow}>
              {renderStars(mockRating)}
              <Text style={styles.ratingValue}>{mockRating}</Text>
              <Text style={styles.ratingCount}>  ({mockReviews} Evaluate)</Text>
            </View>

            {/* Status Badge */}
            <View style={[styles.statusBadge, isAvailable ? styles.statusAvail : styles.statusUnavail]}>
              {isAvailable ? (
                <CheckCircle size={14} color="#27AE60" style={{ marginRight: 6 }} />
              ) : (
                <XCircle size={14} color="#FF6B6B" style={{ marginRight: 6 }} />
              )}
              <Text style={[styles.statusText, isAvailable ? styles.statusTextAvail : styles.statusTextUnavail]}>
                {isAvailable ? 'Available' : 'Borrowed'}
              </Text>
            </View>
          </View>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <InfoTile icon={<FileText size={16} color="#27AE60" />} label="CATEGORY" value={book.category || '—'} />
            <InfoTile icon={<Package size={16} color="#27AE60" />} label="PAGES" value={book.page ? `${book.page} pages` : '—'} />
            <InfoTile icon={<Calendar size={16} color="#27AE60" />} label="PUBLISH YEAR" value={book.publishYear ? String(book.publishYear) : '—'} />
            <InfoTile icon={<Building2 size={16} color="#27AE60" />} label="PUBLISHER" value={book.publisher || '—'} />
          </View>


          {/* Copy Books - Barcode & Location */}
          {book.availableBooks && book.availableBooks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Barcode size={18} color="#0D1B2A" />
                <Text style={styles.sectionTitle}>Copy information</Text>
                <View style={styles.copyCountBadge}>
                  <Text style={styles.copyCountText}>{book.availableBooks.length}</Text>
                </View>
              </View>

              {book.availableBooks.map((copy: CopyBook, index: number) => (
                <CopyBookItem key={copy.barcode ?? index} copy={copy} index={index} isAvailable={isAvailable} />
              ))}
            </View>
          )}

          {book.availableBooks && book.availableBooks.length === 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Barcode size={18} color="#0D1B2A" />
                <Text style={styles.sectionTitle}>Copy information</Text>
              </View>
              <View style={styles.emptyCopyBooks}>
                <Package size={36} color="#C8D6C8" />
                <Text style={styles.emptyCopyBooksText}>No copies yet.</Text>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-component: InfoTile
function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoTile}>
      <View style={styles.infoTileIcon}>{icon}</View>
      <Text style={styles.infoTileLabel}>{label}</Text>
      <Text style={styles.infoTileValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

// Sub-component: CopyBookItem
function CopyBookItem({
  copy,
  index,
  isAvailable,
}: {
  copy: CopyBook;
  index: number;
  isAvailable: boolean;
}) {
  return (
    <View style={styles.copyBookItem}>
      <View style={styles.copyBookIndex}>
        <Text style={styles.copyBookIndexText}>{index + 1}</Text>
      </View>
      <View style={styles.copyBookContent}>
        <View style={styles.copyBookRow}>
          <Barcode size={14} color="#27AE60" style={{ marginRight: 6 }} />
          <Text style={styles.copyBookFieldLabel}>Barcode</Text>
          <Text style={styles.copyBookFieldValue}>{copy.barcode}</Text>
        </View>
        <View style={styles.copyBookDivider} />
        <View style={styles.copyBookRow}>
          <MapPin size={14} color="#2F80ED" style={{ marginRight: 6 }} />
          <Text style={styles.copyBookFieldLabel}>Location</Text>
          <Text style={styles.copyBookFieldValue}>{copy.location}</Text>
        </View>
      </View>
      <View style={[styles.copyStatusDot, isAvailable ? styles.copyStatusDotAvail : styles.copyStatusDotUnavail]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBF8',
  },

  // Loading / Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FBF8',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FBF8',
    gap: 12,
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D1B2A',
    marginTop: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: '#27AE60',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  backBtnError: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  backBtnErrorText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0D1B2A',
  },
  bookmarkBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: {
    paddingBottom: 40,
  },

  // Hero
  heroContainer: {
    width: SCREEN_WIDTH,
    height: 220,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    backgroundColor: '#E8F5E9',
  },
heroBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#C8E6C9',
    opacity: 0.5,
  },
  heroImage: {
    width: 130,
    height: 190,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  heroPlaceholder: {
    width: 130,
    height: 190,
    borderRadius: 10,
    backgroundColor: '#EAFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  // Content Card
  contentCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },

  // Title Section
  titleSection: {
    marginBottom: 20,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0D1B2A',
    marginBottom: 4,
    lineHeight: 30,
  },
  bookAuthor: {
    fontSize: 15,
    color: '#27AE60',
    fontWeight: '600',
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D1B2A',
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '400',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statusAvail: {
    backgroundColor: '#EAFBF1',
  },
  statusUnavail: {
    backgroundColor: '#FFF3F0',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusTextAvail: {
    color: '#27AE60',
  },
  statusTextUnavail: {
    color: '#FF6B6B',
  },

  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  infoTile: {
    width: (SCREEN_WIDTH - 40 - 10) / 2,
    backgroundColor: '#F8FBF8',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EBF5EB',
  },
  infoTileIcon: {
    marginBottom: 6,
  },
  infoTileLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#27AE60',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoTileValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D1B2A',
    lineHeight: 18,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0D1B2A',
    flex: 1,
  },
  copyCountBadge: {
    backgroundColor: '#27AE60',
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  copyCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },

  // Description
  descriptionText: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 22,
    fontWeight: '400',
  },

  // CopyBook List
  copyBookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FBF8',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EBF5EB',
  },
  copyBookIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  copyBookIndexText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  copyBookContent: {
    flex: 1,
  },
  copyBookRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyBookFieldLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    width: 52,
  },
  copyBookFieldValue: {
    fontSize: 13,
    color: '#0D1B2A',
    fontWeight: '600',
    flex: 1,
  },
  copyBookDivider: {
    height: 1,
    backgroundColor: '#EBF5EB',
    marginVertical: 8,
  },
  copyStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 10,
    flexShrink: 0,
  },
  copyStatusDotAvail: {
    backgroundColor: '#27AE60',
  },
  copyStatusDotUnavail: {
    backgroundColor: '#FF6B6B',
  },

  // Empty copy books
  emptyCopyBooks: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyCopyBooksText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
});
