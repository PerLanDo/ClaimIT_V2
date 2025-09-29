import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { User, Mail, Phone, MapPin, Award, LogOut } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student': return '#A85751';
      case 'staff': return '#2563EB';
      case 'teacher': return '#059669';
      case 'admin': return '#DC2626';
      default: return '#6B7280';
    }
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <LogOut color="#FFFFFF" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User color="#A85751" size={40} />
          </View>
          <Text style={styles.fullName}>{profile.full_name}</Text>
          <View 
            style={[
              styles.roleBadge, 
              { backgroundColor: getRoleBadgeColor(profile.role) }
            ]}
          >
            <Text style={styles.roleText}>
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.infoItem}>
            <Mail color="#6B7280" size={20} />
            <Text style={styles.infoText}>{profile.email}</Text>
          </View>
          
          {profile.mobile_number && (
            <View style={styles.infoItem}>
              <Phone color="#6B7280" size={20} />
              <Text style={styles.infoText}>{profile.mobile_number}</Text>
            </View>
          )}
          
          {profile.address && (
            <View style={styles.infoItem}>
              <MapPin color="#6B7280" size={20} />
              <Text style={styles.infoText}>{profile.address}</Text>
            </View>
          )}
        </View>

        {/* Academic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Information</Text>
          
          {profile.school_id_number && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>ID Number:</Text>
              <Text style={styles.infoText}>{profile.school_id_number}</Text>
            </View>
          )}
          
          {profile.department && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Department:</Text>
              <Text style={styles.infoText}>{profile.department}</Text>
            </View>
          )}
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Award color="#A85751" size={24} />
              <Text style={styles.statNumber}>{profile.points}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Items Found</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Items Lost</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>My Claims</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>My Reports</Text>
          </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  signOutButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    minWidth: 100,
  },
  infoText: {
    fontSize: 14,
    color: '#111827',
    marginLeft: 12,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A85751',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  actionButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#A85751',
    fontWeight: '500',
  },
});