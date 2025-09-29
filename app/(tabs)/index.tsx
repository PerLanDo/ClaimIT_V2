import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Menu } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database';
import { ItemCard } from '../../components/ItemCard';
import { FloatingActionButton } from '../../components/FloatingActionButton';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { MSUIITLogo } from '../../components/MSUIITLogo';
import { ThemeSwitch } from '../../components/ThemeSwitch';

type Item = Database['public']['Tables']['items']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type ItemWithUser = Item & { users: User };

type TabType = 'lost' | 'found' | 'all';

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('lost');
  const [items, setItems] = useState<ItemWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile, signOut } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    loadItems();
  }, [activeTab]);

  const loadItems = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('items')
        .select(
          `
          *,
          users!items_posted_by_fkey (*)
        `
        )
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('item_type', activeTab);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setItems(data || []);
    } catch (error) {
      console.error('Error loading items:', error);
      Alert.alert('Error', 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: Item) => {
    router.push({
      pathname: '/item-detail',
      params: { itemId: item.id },
    });
  };

  const handleReportItem = () => {
    router.push('/report-item');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const renderItem = ({ item }: { item: ItemWithUser }) => (
    <ItemCard item={item} onPress={handleItemPress} />
  );

  const tabs = [
    { key: 'lost' as TabType, label: 'Lost' },
    { key: 'found' as TabType, label: 'Found' },
    { key: 'all' as TabType, label: 'All' },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity onPress={handleSignOut}>
          <Menu color={theme.colors.textOnPrimary} size={24} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <MSUIITLogo size="small" showText={false} />
          <Text
            style={[styles.headerTitle, { color: theme.colors.textOnPrimary }]}
          >
            CLAIMIT
          </Text>
        </View>

        <ThemeSwitch size={20} />
      </View>

      {/* MSU-IIT Branding Section */}
      <View
        style={[
          styles.brandingSection,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <MSUIITLogo size="medium" />
        <View style={styles.brandingText}>
          <Text style={[styles.universityName, { color: theme.colors.text }]}>
            Mindanao State University - Iligan Institute of Technology
          </Text>
          <Text
            style={[
              styles.appDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            Official Lost and Found Tracker for MSU-IIT Community
          </Text>
        </View>
      </View>

      <View
        style={[styles.tabContainer, { backgroundColor: theme.colors.surface }]}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              { backgroundColor: theme.colors.background },
              activeTab === tab.key && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                { color: theme.colors.text },
                activeTab === tab.key && { color: theme.colors.textOnPrimary },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                No items found
              </Text>
              <Text
                style={[
                  styles.emptySubtext,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Be the first to report a{' '}
                {activeTab === 'all' ? 'lost or found' : activeTab} item!
              </Text>
            </View>
          )}
        />
      )}

      <FloatingActionButton onPress={handleReportItem} />
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  brandingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    gap: 12,
  },
  brandingText: {
    flex: 1,
  },
  universityName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  appDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingVertical: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
