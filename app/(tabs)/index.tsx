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

type Item = Database['public']['Tables']['items']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type ItemWithUser = Item & { users: User };

type TabType = 'lost' | 'found' | 'all';

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('lost');
  const [items, setItems] = useState<ItemWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile, signOut } = useAuth();

  useEffect(() => {
    loadItems();
  }, [activeTab]);

  const loadItems = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('items')
        .select(`
          *,
          users!items_posted_by_fkey (*)
        `)
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
      params: { itemId: item.id }
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSignOut}>
          <Menu color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CLAIMIT</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A85751" />
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
              <Text style={styles.emptyText}>No items found</Text>
              <Text style={styles.emptySubtext}>
                Be the first to report a {activeTab === 'all' ? 'lost or found' : activeTab} item!
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#A85751',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#A85751',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#A85751',
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
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});