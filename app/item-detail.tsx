import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ChevronDown, Check } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { useAuth } from '../contexts/AuthContext';

type Item = Database['public']['Tables']['items']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type ItemWithUser = Item & { users: User };

export default function ItemDetailScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const [item, setItem] = useState<ItemWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    if (itemId) {
      loadItem();
    }
  }, [itemId]);

  const loadItem = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          users!items_posted_by_fkey (*)
        `)
        .eq('id', itemId)
        .single();

      if (error) {
        throw error;
      }

      setItem(data);
    } catch (error) {
      console.error('Error loading item:', error);
      Alert.alert('Error', 'Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimItem = () => {
    if (!item) return;
    
    router.push({
      pathname: '/claim-process',
      params: { itemId: item.id }
    });
  };

  const handleMessagePoster = () => {
    Alert.alert('Message Poster', 'This feature will be implemented soon!');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A85751" />
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Item not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOwnItem = profile?.id === item.posted_by;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Item Detail Page</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Item Image and Basic Info */}
        <View style={styles.itemHeader}>
          <View style={styles.imageContainer}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.itemImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
          </View>
          
          <View style={styles.itemBasicInfo}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDescription}>
              Description: Found in the {item.location.toLowerCase()}.{' '}
              {item.description}
            </Text>
          </View>
        </View>

        {/* Expandable Details */}
        <View style={styles.detailsSection}>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setExpanded(!expanded)}
          >
            <Text style={styles.expandButtonText}>
              {expanded ? 'Hide Details' : 'Show Details'}
            </Text>
            <ChevronDown
              color="#A85751"
              size={20}
              style={[
                styles.chevron,
                expanded && { transform: [{ rotate: '180deg' }] }
              ]}
            />
          </TouchableOpacity>
          
          {expanded && (
            <View style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category:</Text>
                <Text style={styles.detailValue}>{item.category}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue}>{item.location}</Text>
                <Check color="#10B981" size={16} />
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(item.date_lost_found)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Poster Details */}
        <View style={styles.posterSection}>
          <Text style={styles.sectionTitle}>Poster Details</Text>
          <Text style={styles.posterInfo}>
            Posted by: {item.users.full_name} (
            {item.users.role.charAt(0).toUpperCase() + item.users.role.slice(1)})
          </Text>
          {item.users.department && (
            <Text style={styles.posterInfo}>
              Department: {item.users.department}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        {!isOwnItem && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.claimButton}
              onPress={handleClaimItem}
            >
              <Text style={styles.claimButtonText}>CLAIM ITEM</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.messageButton}
              onPress={handleMessagePoster}
            >
              <Text style={styles.messageButtonText}>MESSAGE POSTER</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* QR Code */}
        <View style={styles.qrSection}>
          <QRCode
            value={`claimit://item/${item.id}`}
            size={120}
          />
          <Text style={styles.qrText}>Scan to verify ownership</Text>
        </View>
      </ScrollView>
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#A85751',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  itemHeader: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  itemImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 14,
  },
  itemBasicInfo: {
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  detailsSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  expandButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  expandButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A85751',
  },
  chevron: {
    marginLeft: 8,
  },
  detailsContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  posterSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  posterInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  claimButton: {
    flex: 1,
    backgroundColor: '#A85751',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#A85751',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageButtonText: {
    color: '#A85751',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 32,
  },
  qrText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});