import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  BookOpen,
  Flame,
  BarChart2,
  Calendar,
  Bookmark,
  Star,
  ArrowRight,
  ChevronRight,
  Box,
  BoxIcon,
  ArchiveIcon,
  BookOpenIcon,
} from 'lucide-react-native';
import { UserStackParamList } from '../../navigation/types';
import { bookService } from '../../services/book.service';
import { BACKEND_URL } from '@env';
import { useAuth } from '../../store/authProvider';


export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  const { user } = useAuth();
  const [books, setBooks] = useState<any[]>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // FAB animation
  const fabScale = useRef(new Animated.Value(1)).current;

  const handleFabPress = () => {
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.88, duration: 100, useNativeDriver: true }),
      Animated.timing(fabScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    navigation.navigate('BookSearch');
  };

  const fetchBooks = async () => {
    try {
      const res = await bookService.getBookByPage(1, 10);
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        if (res.data.data.length > 0) {
          setBooks(res.data.data);
        }
      }
    } catch (error) {
      console.log('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchBooks();
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBooks();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isBookmarked = (id: string) => bookmarkedIds.includes(id);

  const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const baseUrl = (BACKEND_URL || 'http://10.0.2.2:3000').replace('/api', '');
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  };

  const displayName = user?.userName || 'Nguyễn Văn A';
  const displayAvatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#27AE60']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>WELCOME 👋</Text>
            <Text style={styles.nameText}>{displayName}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{displayAvatarLetter}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <View style={[styles.iconWrapper, { backgroundColor: '#EAFBF1' }]}>
              <BookOpen size={20} color="#27AE60" />
            </View>
            <Text style={styles.statsValue}>28</Text>
            <Text style={styles.statsLabel}>Read</Text>
          </View>

          <View style={styles.statsCard}>
            <View style={[styles.iconWrapper, { backgroundColor: '#FFF3EB' }]}>
              <Flame size={20} color="#FF6B00" />
            </View>
            <Text style={styles.statsValue}>12</Text>
            <Text style={styles.statsLabel}>Consecutive days</Text>
          </View>

          <View style={styles.statsCard}>
            <View style={[styles.iconWrapper, { backgroundColor: '#EBF3FE' }]}>
              <BarChart2 size={20} color="#2F80ED" />
            </View>
            <Text style={styles.statsValue}>3</Text>
            <Text style={styles.statsLabel}>Borrowing</Text>
          </View>
        </View>

        {/* Reading Section */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Reading</Text>
        </View>

        <View style={styles.readingCard}>
          <Image
            source={{
              uri: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1602193746i/52578297.jpg',
            }}
            style={styles.readingBookImage}
          />
          <View style={styles.readingBookInfo}>
            <View>
              <Text style={styles.readingBookTitle} numberOfLines={1}>
                The Midnight Library
              </Text>
              <Text style={styles.readingBookAuthor}>Matt Haig</Text>
            </View>

            <View style={styles.readingBookDueDateRow}>
              <View style={styles.dueDateWrapper}>
                <Calendar size={14} color="#8E8E93" style={{ marginRight: 4 }} />
                <Text style={styles.dueDateText}>Hạn trả: 15/07/2026</Text>
              </View>
              <View style={styles.daysLeftBadge}>
                <Text style={styles.daysLeftText}>5 days</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressTextRow}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressValue}>65%</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: '65%' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Recommended Books */}
        <View style={styles.sectionHeaderContainerWithAction}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('Books')}
          >
            <Text style={styles.seeAllText}>View all</Text>
            <ChevronRight size={16} color="#27AE60" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#27AE60" style={styles.loader} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendedList}
          >
            {books ? books.map((book) => (
              <TouchableOpacity
                key={book.bookId}
                style={styles.recommendedCard}
                activeOpacity={0.8}
                onPress={() => book.bookId && navigation.navigate('BookDetail', { bookId: book.bookId })}
              >
                <View style={styles.bookImageWrapper}>
                  <Image source={{ uri: getImageUrl(book.url) }} style={styles.recommendedBookImage} />
                  <TouchableOpacity
                    style={styles.bookmarkButton}
                    onPress={() => toggleBookmark(book.bookId)}
                    activeOpacity={0.7}
                  >
                    <Bookmark
                      size={16}
                      color={isBookmarked(book.bookId) ? '#27AE60' : '#4F5E74'}
                      fill={isBookmarked(book.bookId) ? '#27AE60' : 'none'}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.recommendedBookTitle} numberOfLines={2}>
                  {book.title}
                </Text>
                <Text style={styles.recommendedBookAuthor} numberOfLines={1}>
                  {book.author}
                </Text>
                <View style={styles.ratingRow}>
                  <Star size={12} color="#FFB000" fill="#FFB000" style={{ marginRight: 4 }} />
                  <Text style={styles.ratingText}>
                    {((book.title.charCodeAt(0) % 5) * 0.1 + 4.5).toFixed(1)}
                  </Text>
                </View>
              </TouchableOpacity>
            )) : (
              <View style={styles.emptyContainer}>
                  <BookOpen size={48} color="#C8D6C8" />
                  <Text style={{fontWeight: 'bold', color: '#717971'}}>No data books</Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* Quick Actions */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
        </View>

        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Books')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: '#27AE60' }]}>
              <BookOpen size={20} color="#fff" />
            </View>
            <Text style={styles.actionTitle}>Browse categories</Text>
            <Text style={styles.actionSubtext}>12,543 đầu sách</Text>
            <ArrowRight size={18} color="#27AE60" style={styles.actionArrow} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Borrow')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: '#EAFBF1' }]}>
              <BarChart2 size={20} color="#27AE60" />
            </View>
            <Text style={styles.actionTitle}>My books</Text>
            <Text style={styles.actionSubtext}>3 borrowings</Text>
            <ArrowRight size={18} color="#27AE60" style={styles.actionArrow} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Search Button
      <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity
          style={styles.fabInner}
          onPress={handleFabPress}
          activeOpacity={0.9}
        >
          <BookOpen size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View> */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0D1B2A',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00B365',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F2F2F2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D1B2A',
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  sectionHeaderContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionHeaderContainerWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0D1B2A',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27AE60',
    marginRight: 4,
  },
  readingCard: {
    flexDirection: 'row',
    backgroundColor: '#EAFBF1',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  readingBookImage: {
    width: 76,
    height: 114,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  readingBookInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  readingBookTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D1B2A',
  },
  readingBookAuthor: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  readingBookDueDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  dueDateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDateText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  daysLeftBadge: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  daysLeftText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  progressContainer: {
    width: '100%',
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#27AE60',
  },
  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#E2F9EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#27AE60',
    borderRadius: 3,
  },
  loader: {
    marginVertical: 24,
  },
  recommendedList: {
    flex:1,
    paddingLeft: 20,
    paddingRight: 4,
    paddingBottom: 24,
  },
  recommendedCard: {
    width: 140,
    marginRight: 16,
  },
  bookImageWrapper: {
    position: 'relative',
    width: 140,
    height: 200,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: '#f9f9f9',
  },
  recommendedBookImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    resizeMode: 'cover',
  },
  bookmarkButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendedBookTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D1B2A',
    marginTop: 10,
    lineHeight: 18,
  },
  recommendedBookAuthor: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 16,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F2F2F2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  actionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0D1B2A',
  },
  actionSubtext: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    fontWeight: '500',
  },
  actionArrow: {
    marginTop: 16,
  },

  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  fabInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  }
});

