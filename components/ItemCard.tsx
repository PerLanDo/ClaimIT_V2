import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Database } from '../types/database';

type Item = Database['public']['Tables']['items']['Row'];
type User = Database['public']['Tables']['users']['Row'];

interface ItemCardProps {
  item: Item & { users: User };
  onPress: (item: Item) => void;
}

export function ItemCard({ item, onPress }: ItemCardProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student': return '#A85751';
      case 'staff': return '#2563EB';
      case 'teacher': return '#059669';
      case 'admin': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.itemImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDate}>Posted: {formatDate(item.created_at)}</Text>
          <Text style={styles.itemLocation}>{item.location}</Text>
        </View>
        
        <View style={styles.badgeContainer}>
          <View 
            style={[
              styles.roleBadge, 
              { backgroundColor: getRoleBadgeColor(item.users.role) }
            ]}
          >
            <Text style={styles.roleText}>
              {item.users.role.charAt(0).toUpperCase() + item.users.role.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 16,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  itemLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  badgeContainer: {
    alignItems: 'flex-end',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});