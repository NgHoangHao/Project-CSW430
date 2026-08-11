import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  Leaf,
  Book,
  BookOpen,
  AlertTriangle,
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from 'lucide-react-native';
import Svg, {
  Path,
  Circle,
  Line,
  Text as SvgText,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - 48) / 2;

// Mock data for top books
const topBooks = [
  { rank: 1, title: 'Dune', author: 'Frank Herbert', count: 89, change: '+12%', isPositive: true },
  { rank: 2, title: 'Atomic Habits', author: 'James Clear', count: 76, change: '+8%', isPositive: true },
  { rank: 3, title: 'Sapiens', author: 'Y.N. Harari', count: 71, change: '-3%', isPositive: false },
  { rank: 4, title: '1984', author: 'George Orwell', count: 65, change: '+5%', isPositive: true },
];

// Mock data for recent activities
const recentActivities = [
  { id: '1', user: 'A', action: 'borrowed', book: 'Dune', time: '5 mins ago', status: 'Approved', statusColor: '#27AE60', statusBg: '#EAFBF1' },
  { id: '2', user: 'B', action: 'returned', book: 'Sapiens', time: '12 mins ago', status: 'Returned', statusColor: '#2F80ED', statusBg: '#EAF2FF' },
  { id: '3', user: 'C', action: 'overdue', book: 'The Alchemist', time: '1 hour ago', status: 'Overdue', statusColor: '#EB5757', statusBg: '#FEE8E7' },
  { id: '4', user: 'D', action: 'borrowed', book: 'Atomic Habits', time: '2 hours ago', status: 'Approved', statusColor: '#27AE60', statusBg: '#EAFBF1' },
  { id: '5', user: 'E', action: 'renewed', book: '1984', time: '3 hours ago', status: 'Renewed', statusColor: '#F2994A', statusBg: '#FFF5E6' },
];

export default function DashBoard() {
  // Chart geometry parameters
  const chartWidth = screenWidth - 72; // Padding in the chart container card
  const chartHeight = 150;
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 25;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  const mapX = (index: number) => {
    return paddingLeft + (index * graphWidth) / 6;
  };

  const mapY = (val: number) => {
    // scale from [0, 120] to [graphHeight, 0] within the padding context
    const relativeY = graphHeight - (val / 120) * graphHeight;
    return paddingTop + relativeY;
  };

  // Line data points
  // Adjusted slightly to match the 7 days (index 0 to 6)
  const muonPoints = [40, 58, 35, 65, 85, 110, 95];
  const traPoints = [35, 48, 50, 40, 55, 75, 88];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Helper to generate smooth cubic Bezier lines
  const getCurvePath = (points: number[]) => {
    let path = '';
    for (let i = 0; i < points.length; i++) {
      const x = mapX(i);
      const y = mapY(points[i]);
      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        const prevX = mapX(i - 1);
        const prevY = mapY(points[i - 1]);
        const cp1x = prevX + (x - prevX) / 2;
        const cp1y = prevY;
        const cp2x = x - (x - prevX) / 2;
        const cp2y = y;
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
      }
    }
    return path;
  };

  // Donut chart parameters
  const donutRadius = 35;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutData = [
    { key: 'available', percentage: 80, color: '#27AE60', label: 'Available', count: '11,890' },
    { key: 'borrowed', percentage: 11, color: '#2F80ED', label: 'Borrowing', count: '342' },
    { key: 'overdue', percentage: 3, color: '#EB5757', label: 'Overdue', count: '47' },
    { key: 'maintenance', percentage: 6, color: '#828282', label: 'Maintenance', count: '264' },
  ];

  let accumulatedPercentage = 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Leaf size={16} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.logoTitle}>BookConnect</Text>
            <Text style={styles.logoSubtitle}>ADMIN</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Bell size={20} color="#333333" />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AD</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Key Metrics Grid ── */}
        <View style={styles.metricsGrid}>
          {/* Card 1 */}
          <View style={styles.metricCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: '#EAFBF1' }]}>
                <Book size={18} color="#27AE60" />
              </View>
              <View style={[styles.badge, { backgroundColor: '#EAFBF1' }]}>
                <ArrowUpRight size={10} color="#27AE60" />
                <Text style={[styles.badgeText, { color: '#27AE60' }]}>+89</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>12,543</Text>
            <Text style={styles.metricLabel}>Total number of titles</Text>
          </View>

          {/* Card 2 */}
          <View style={styles.metricCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: '#EAF2FF' }]}>
                <BookOpen size={18} color="#2F80ED" />
              </View>
              <View style={[styles.badge, { backgroundColor: '#EAFBF1' }]}>
                <ArrowUpRight size={10} color="#27AE60" />
                <Text style={[styles.badgeText, { color: '#27AE60' }]}>+23</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>342</Text>
            <Text style={styles.metricLabel}>Borrowing</Text>
          </View>

          {/* Card 3 */}
          <View style={styles.metricCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: '#FEE8E7' }]}>
                <AlertTriangle size={18} color="#EB5757" />
              </View>
              <View style={[styles.badge, { backgroundColor: '#FEE8E7' }]}>
                <ArrowDownRight size={10} color="#EB5757" />
                <Text style={[styles.badgeText, { color: '#EB5757' }]}>-8</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>47</Text>
            <Text style={styles.metricLabel}>Overdue books</Text>
          </View>

          {/* Card 4 */}
          <View style={styles.metricCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: '#F5EBFD' }]}>
                <Users size={18} color="#9B51E0" />
              </View>
              <View style={[styles.badge, { backgroundColor: '#EAFBF1' }]}>
                <ArrowUpRight size={10} color="#27AE60" />
                <Text style={[styles.badgeText, { color: '#27AE60' }]}>+128</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>5,234</Text>
            <Text style={styles.metricLabel}>Total users</Text>
          </View>

          {/* Card 5 */}
          <View style={styles.metricCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: '#FFF5E6' }]}>
                <TrendingUp size={18} color="#F2994A" />
              </View>
              <View style={[styles.badge, { backgroundColor: '#EAFBF1' }]}>
                <ArrowUpRight size={10} color="#27AE60" />
                <Text style={[styles.badgeText, { color: '#27AE60' }]}>+12%</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>1,847</Text>
            <Text style={styles.metricLabel}>Loans per month</Text>
          </View>

          {/* Card 6 */}
          <View style={styles.metricCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: '#E5F9FF' }]}>
                <Clock size={18} color="#00C2FF" />
              </View>
              <View style={[styles.badge, { backgroundColor: '#FEE8E7' }]}>
                <ArrowDownRight size={10} color="#EB5757" />
                <Text style={[styles.badgeText, { color: '#EB5757' }]}>-0.8</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>9.2</Text>
            <Text style={styles.metricLabel}>Average borrowing duration (days)</Text>
          </View>
        </View>

        {/* ── Line Chart: Xu hướng mượn trả ── */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Tendency to borrow and repay</Text>
              <Text style={styles.chartSubtitle}>Last 7 days</Text>
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { backgroundColor: '#27AE60' }]} />
                <Text style={styles.legendLabel}>Borrow</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendIndicator, { backgroundColor: '#2F80ED' }]} />
                <Text style={styles.legendLabel}>Return</Text>
              </View>
            </View>
          </View>

          <View style={styles.svgContainer}>
            <Svg width={chartWidth} height={chartHeight}>
              <Defs>
                <LinearGradient id="gradientMuon" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#27AE60" stopOpacity="0.2" />
                  <Stop offset="100%" stopColor="#27AE60" stopOpacity="0" />
                </LinearGradient>
                <LinearGradient id="gradientTra" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#2F80ED" stopOpacity="0.2" />
                  <Stop offset="100%" stopColor="#2F80ED" stopOpacity="0" />
                </LinearGradient>
              </Defs>

              {/* Horizontal Grid lines */}
              {[0, 30, 60, 90, 120].map((gridVal) => {
                const y = mapY(gridVal);
                return (
                  <G key={`grid-${gridVal}`}>
                    <Line
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="#F2F2F2"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                    <SvgText
                      x={paddingLeft - 8}
                      y={y + 4}
                      fontSize="9"
                      fill="#AEAEB2"
                      textAnchor="end"
                      fontWeight="500"
                    >
                      {gridVal}
                    </SvgText>
                  </G>
                );
              })}

              {/* Area Under Mượn Path */}
              <Path
                d={`${getCurvePath(muonPoints)} L ${mapX(muonPoints.length - 1)} ${mapY(0)} L ${mapX(0)} ${mapY(0)} Z`}
                fill="url(#gradientMuon)"
              />

              {/* Area Under Trả Path */}
              <Path
                d={`${getCurvePath(traPoints)} L ${mapX(traPoints.length - 1)} ${mapY(0)} L ${mapX(0)} ${mapY(0)} Z`}
                fill="url(#gradientTra)"
              />

              {/* Lines */}
              <Path d={getCurvePath(muonPoints)} fill="none" stroke="#27AE60" strokeWidth={2} />
              <Path d={getCurvePath(traPoints)} fill="none" stroke="#2F80ED" strokeWidth={2} />

              {/* X Axis Labels */}
              {days.map((day, idx) => (
                <SvgText
                  key={`day-${idx}`}
                  x={mapX(idx)}
                  y={chartHeight - 5}
                  fontSize="9"
                  fill="#AEAEB2"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {day}
                </SvgText>
              ))}
            </Svg>
          </View>
        </View>

        {/* ── Donut Chart: Book Inventory Status ── */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Book Inventory Status</Text>
          <Text style={styles.chartSubtitle}>Total: 12,543 books</Text>

          <View style={styles.donutContainer}>
            {/* Donut Chart SVG */}
            <View style={styles.donutSvgWrapper}>
              <Svg width={120} height={120} viewBox="0 0 100 100">
                {donutData.map((item) => {
                  const strokeLength =
                    donutCircumference * (item.percentage / 100) - 2; // subtract 2 for minor spacing gap
                  const strokeGap = donutCircumference - strokeLength;
                  const rotationAngle =
                    -90 + (accumulatedPercentage / 100) * 360;
                  accumulatedPercentage += item.percentage;

                  return (
                    <G key={item.key} rotation={rotationAngle} origin="50, 50">
                      <Circle
                        cx={50}
                        cy={50}
                        r={donutRadius}
                        stroke={item.color}
                        strokeWidth={10}
                        fill="transparent"
                        strokeDasharray={`${strokeLength} ${strokeGap}`}
                        strokeLinecap="round"
                      />
                    </G>
                  );
                })}
              </Svg>
            </View>

            {/* Donut Chart Legend */}
            <View style={styles.donutLegendContainer}>
              {donutData.map((item) => (
                <View key={item.key} style={styles.donutLegendItem}>
                  <View style={styles.donutLegendInfo}>
                    <View
                      style={[
                        styles.donutLegendColorDot,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text style={styles.donutLegendText}>{item.label}</Text>
                  </View>
                  <Text style={styles.donutLegendValue}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Top Borrowed Books ── */}
        <View style={styles.chartCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.chartTitle}>Top Borrowed Books</Text>
            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={14} color="#27AE60" />
            </TouchableOpacity>
          </View>

          <View style={styles.topBooksContainer}>
            {topBooks.map((bookItem) => (
              <View key={bookItem.rank} style={styles.topBookItem}>
                <View style={styles.topBookLeft}>
                  <View
                    style={[
                      styles.rankCircle,
                      bookItem.rank === 1
                        ? styles.rankFirstBg
                        : styles.rankOtherBg,
                    ]}
                  >
                    <Text
                      style={[
                        styles.rankText,
                        bookItem.rank === 1
                          ? styles.rankTextFirst
                          : styles.rankTextOther,
                      ]}
                    >
                      {bookItem.rank}
                    </Text>
                  </View>

                  <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle} numberOfLines={1}>
                      {bookItem.title}
                    </Text>
                    <Text style={styles.bookAuthor} numberOfLines={1}>
                      {bookItem.author}
                    </Text>
                  </View>
                </View>

                <View style={styles.topBookRight}>
                  <Text style={styles.borrowCount}>
                    {bookItem.count}
                  </Text>
                  <Text
                    style={[
                      styles.bookChange,
                      {
                        color: bookItem.isPositive
                          ? "#27AE60"
                          : "#EB5757",
                      },
                    ]}
                  >
                    {bookItem.change}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Recent Activities ── */}
        <View style={[styles.chartCard, { marginBottom: 30 }]}>
          <Text style={styles.chartTitle}>Recent Activities</Text>

          <View style={styles.activityContainer}>
            {recentActivities.map((act) => (
              <View key={act.id} style={styles.activityItem}>
                <View style={styles.activityLeft}>
                  <View style={styles.activityAvatar}>
                    <Text style={styles.activityAvatarText}>
                      {act.user}
                    </Text>
                  </View>

                  <View style={styles.activityDetails}>
                    <Text style={styles.activityDesc}>
                      <Text style={styles.boldText}>{act.user}</Text>{" "}
                      <Text style={styles.actionText}>{act.action}</Text>{" "}
                      <Text style={styles.boldText}>
                        "{act.book}"
                      </Text>
                    </Text>

                    <Text style={styles.activityTime}>
                      {act.time}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: act.statusBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: act.statusColor },
                    ]}
                  >
                    {act.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0D1B2A',
  },
  logoSubtitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#AEAEB2',
    letterSpacing: 0.5,
    marginTop: -2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F7FA',
    justifyContent: 'center',
    alignItems: 'center',
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

  /* Metrics Grid */
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  metricCard: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0D1B2A',
  },
  metricLabel: {
    fontSize: 11,
    color: '#828282',
    fontWeight: '600',
    marginTop: 2,
  },

  /* Chart Cards general styling */
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: 16,
    marginTop: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0D1B2A',
  },
  chartSubtitle: {
    fontSize: 11,
    color: '#828282',
    fontWeight: '600',
    marginTop: 2,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendIndicator: {
    width: 8,
    height: 2,
    borderRadius: 1,
  },
  legendLabel: {
    fontSize: 10,
    color: '#828282',
    fontWeight: '600',
  },
  svgContainer: {
    alignItems: 'center',
    marginTop: 4,
  },

  /* Donut Chart styles */
  donutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 20,
  },
  donutSvgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutLegendContainer: {
    flex: 1,
    gap: 8,
  },
  donutLegendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  donutLegendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  donutLegendColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  donutLegendText: {
    fontSize: 12,
    color: '#4F4F4F',
    fontWeight: '600',
  },
  donutLegendValue: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '700',
  },

  /* Top Books and General Headers */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#27AE60',
  },
  topBooksContainer: {
    gap: 14,
  },
  topBookItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBookLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rankCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankFirstBg: {
    backgroundColor: '#FFF5E6',
  },
  rankOtherBg: {
    backgroundColor: '#F4F7FA',
  },
  rankText: {
    fontSize: 11,
    fontWeight: '800',
  },
  rankTextFirst: {
    color: '#F2994A',
  },
  rankTextOther: {
    color: '#828282',
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0D1B2A',
  },
  bookAuthor: {
    fontSize: 11,
    color: '#828282',
    fontWeight: '600',
    marginTop: 1,
  },
  topBookRight: {
    alignItems: 'flex-end',
  },
  borrowCount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0D1B2A',
  },
  bookChange: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },

  /* Activity styles */
  activityContainer: {
    gap: 16,
    marginTop: 12,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  activityAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  activityDetails: {
    flex: 1,
  },
  activityDesc: {
    fontSize: 12,
    color: '#4F4F4F',
    fontWeight: '600',
    lineHeight: 16,
  },
  boldText: {
    fontWeight: '800',
    color: '#0D1B2A',
  },
  actionText: {
    color: '#828282',
  },
  activityTime: {
    fontSize: 10,
    color: '#BDBDBD',
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
