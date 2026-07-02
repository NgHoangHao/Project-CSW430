import { Avatar } from '@rneui/themed';
import { Bell, Book, ClipboardCheck } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
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
        <ScrollView style={styles.main}>
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
                  <View>
                    <Book size={30} color="#000" />
                  </View>
                  <View style={styles.statsItemInfo}>
                    <Text style={styles.statsItemLabel}>Read Books</Text>
                    <Text style={styles.statsItemValue}>28</Text>
                  </View>
                </View>
                <View style={styles.statsItem}>
                  <View>
                    <ClipboardCheck size={30} color="#000" />
                  </View>
                  <View style={styles.statsItemInfo}>
                    <Text style={styles.statsItemLabel}>Borrowed Books</Text>
                    <Text style={styles.statsItemValue}>14</Text>
                  </View>
                </View>
                <View style={styles.statsItem}>
                  <View>
                    <ClipboardCheck size={30} color="#000" />
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
              </View>
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
    marginTop: 20,
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
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  statsItemInfo: {
    flexDirection: 'column',
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
  },
  listBookCard: {
    marginVertical: 12,
  },
  bookContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#fff',
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
});
