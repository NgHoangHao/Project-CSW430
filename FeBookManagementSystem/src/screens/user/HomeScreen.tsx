import { Avatar } from '@rneui/themed';
import { Bell, Book, ClipboardCheck } from 'lucide-react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RECOMMEND_BOOK_DATA } from '../../data/data';
import { USER_ROUTES } from '../../constants/routes';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserStackParamList } from '../../navigation/types';

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<UserStackParamList>>();
  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            <Image
              source={require('../../../assets/auth/logo.png')}
              style={styles.logo}
            />
            <View>
              <Text style={styles.title}>Book Store</Text>
            </View>
          </View>
          <Bell size={25} color="#000" />
        </View>
        <ScrollView
          style={styles.main}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <View>
            <View style={styles.contentProfile}>
              <View>
                <Text style={styles.textWelcome}>Welcome 👋</Text>
                <Text style={styles.textName}>Cristiano Ronaldo</Text>
              </View>
              <Avatar
                size={40}
                rounded
                title="CR7"
                containerStyle={{ backgroundColor: 'green' }}
              />
            </View>
            {/* Book Overview */}
            <View style={styles.stats}>
              <View style={styles.statsRow}>
                <View style={styles.statsItem}>
                  <View
                    style={[styles.statsIcon, { backgroundColor: '#b9fdd3' }]}
                  >
                    <Book size={30} color="#32ee03ff" />
                  </View>
                  <View style={styles.statsItemInfo}>
                    <Text style={styles.statsItemLabel}>Read Books</Text>
                    <Text style={styles.statsItemValue}>28</Text>
                  </View>
                </View>
                <View style={styles.statsItem}>
                  <View
                    style={[styles.statsIcon, { backgroundColor: '#fffeddff' }]}
                  >
                    <ClipboardCheck size={30} color="#e2e600ff" />
                  </View>
                  <View style={styles.statsItemInfo}>
                    <Text style={styles.statsItemLabel}>Borrowed Books</Text>
                    <Text style={styles.statsItemValue}>14</Text>
                  </View>
                </View>
                <View style={styles.statsItem}>
                  <View
                    style={[{ backgroundColor: '#c8ccffff' }, styles.statsIcon]}
                  >
                    <ClipboardCheck size={30} color="#0011ffff" />
                  </View>
                  <View style={styles.statsItemInfo}>
                    <Text style={styles.statsItemLabel}>Return Books</Text>
                    <Text style={styles.statsItemValue}>14</Text>
                  </View>
                </View>
              </View>
            </View>
            {/* List Reading Books */}
            <View>
              <Text style={styles.textReadingBooks}>Reading Books</Text>
              <View style={styles.listBookCard}>
                <View style={styles.bookContainer}>
                  <View style={styles.bookImageContainer}>
                    <Image
                      source={{
                        uri: 'https://skyhorse-us.imgix.net/covers/9781949846386.jpg?auto=format&w=298',
                      }}
                      style={styles.bookImage}
                    />
                  </View>
                  <View style={styles.bookInfoContainer}>
                    <Text style={styles.bookTitle}>The Great Gatsby</Text>
                    <Text style={styles.bookAuthor}>F. Scott Fitzgerald</Text>
                    <Text style={styles.bookProgress}>60% read</Text>
                    <View style={styles.bookProgressContainer}>
                      <View style={styles.bookProgressBar}></View>
                    </View>
                  </View>
                </View>
                <View style={styles.bookContainer}>
                  <View style={styles.bookImageContainer}>
                    <Image
                      source={{
                        uri: 'https://skyhorse-us.imgix.net/covers/9781949846386.jpg?auto=format&w=298',
                      }}
                      style={styles.bookImage}
                    />
                  </View>
                  <View style={styles.bookInfoContainer}>
                    <Text style={styles.bookTitle}>The Great Gatsby</Text>
                    <Text style={styles.bookAuthor}>F. Scott Fitzgerald</Text>
                    <Text style={styles.bookProgress}>60% read</Text>
                    <View style={styles.bookProgressContainer}>
                      <View style={styles.bookProgressBar}></View>
                    </View>
                  </View>
                </View>
                <View style={styles.bookContainer}>
                  <View style={styles.bookImageContainer}>
                    <Image
                      source={{
                        uri: 'https://skyhorse-us.imgix.net/covers/9781949846386.jpg?auto=format&w=298',
                      }}
                      style={styles.bookImage}
                    />
                  </View>
                  <View style={styles.bookInfoContainer}>
                    <Text style={styles.bookTitle}>The Great Gatsby</Text>
                    <Text style={styles.bookAuthor}>F. Scott Fitzgerald</Text>
                    <Text style={styles.bookProgress}>60% read</Text>
                    <View style={styles.bookProgressContainer}>
                      <View style={styles.bookProgressBar}></View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            {/* Recommended Books */}
            <View>
              <View style={styles.recommendedBookContainer}>
                <Text style={styles.textReadingBooks}>Recommended Books</Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('Books');
                  }}
                >
                  <Text>See all</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listRecommendBooksContent}
              >
                {RECOMMEND_BOOK_DATA.map(book => (
                  <View style={styles.recommendBookContainer} key={book.id}>
                    <Image
                      source={{
                        uri: 'https://skyhorse-us.imgix.net/covers/9781949846386.jpg?auto=format&w=298',
                      }}
                      style={styles.recommendBookImage}
                    />
                    <Text style={styles.recommendBookTitle}>{book.title}</Text>
                    <Text style={styles.recommendBookAuthor}>
                      {book.author}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 70,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingHorizontal: 20,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 20,
    fontFamily: 'OpenSansCondensedExtraBold',
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    paddingHorizontal: 20,
  },
  contentProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  textWelcome: {
    fontSize: 17,
    color: '#666',
  },
  textName: {
    fontWeight: 'bold',
    fontSize: 25,
  },
  stats: {
    flexDirection: 'column',
    marginVertical: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: -6,
    gap: 10,
  },
  statsItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: '#afafaf',
    borderRadius: 12,
  },
  statsItemInfo: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsItemLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8e8e93',
    marginBottom: 2,
  },
  statsItemValue: {
    fontSize: 22,
    fontWeight: '600',
    color: '#081730',
  },
  textReadingBooks: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  listBookCard: {
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'column',
    gap: 10,
  },
  bookContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#e6f7e3ff',
    borderRadius: 8,
  },
  bookImageContainer: {
    width: 60,
    height: 90,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  bookImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bookInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  bookProgress: {
    fontSize: 12,
    color: '#081730',
    fontWeight: '600',
  },
  bookProgressContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  bookProgressBar: {
    width: '60%',
    height: '100%',
    backgroundColor: '#081730',
    borderRadius: 3,
  },
  recommendedBookContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listRecommendBooksContent: {
    flexDirection: 'row',
    gap: 20, // Gap hoạt động chuẩn 100% khi nằm ở đây
    paddingBottom: 20,
    paddingHorizontal: 2, // Tạo chút khoảng trống ở 2 đầu nếu cần
  },
  recommendBookContainer: {
    minWidth: 120,
    maxHeight: 230,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendBookImage: {
    width: 100,
    height: 150,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  recommendBookTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  recommendBookAuthor: {
    fontSize: 12,
    color: '#666',
  },
});
