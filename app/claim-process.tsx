import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { useAuth } from '../contexts/AuthContext';

type Item = Database['public']['Tables']['items']['Row'];

export default function ClaimProcessScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [reason, setReason] = useState('');
  const [proofImageUri, setProofImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState(true);
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
        .select('*')
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
      setLoadingItem(false);
    }
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload proof.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setProofImageUri(result.assets[0].uri);
    }
  };

  const handleSubmitClaim = async () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for claiming this item');
      return;
    }

    if (!profile || !item) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('claims')
        .insert({
          item_id: item.id,
          claimant_id: profile.id,
          reason,
          proof_image_url: proofImageUri,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      Alert.alert(
        'Claim Submitted',
        'Your claim has been submitted successfully. SID will review your request and contact you soon.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error submitting claim:', error);
      Alert.alert('Error', 'Failed to submit claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingItem) {
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
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Claim Process</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={profile?.full_name || ''}
            editable={false}
          />

          <Text style={styles.label}>Student/Staff ID</Text>
          <TextInput
            style={styles.input}
            value={profile?.school_id_number || 'Not provided'}
            editable={false}
          />

          <Text style={styles.label}>Role</Text>
          <TextInput
            style={styles.input}
            value={profile?.role.charAt(0).toUpperCase() + profile?.role.slice(1) || ''}
            editable={false}
          />

          <Text style={styles.label}>Reason for Claiming *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Please describe why you believe this item belongs to you. Include any identifying details or circumstances."
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Upload Photo for Proof</Text>
          <TouchableOpacity style={styles.imageUpload} onPress={handleImagePicker}>
            {proofImageUri ? (
              <Image source={{ uri: proofImageUri }} style={styles.uploadedImage} />
            ) : (
              <>
                <Camera color="#6B7280" size={32} />
                <Text style={styles.uploadText}>Tap to upload proof image</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmitClaim}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Claim</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Claim Status Section */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Claim Status Updates</Text>
          
          <View style={styles.statusItem}>
            <View style={styles.statusIndicatorActive} />
            <Text style={styles.statusText}>Pending</Text>
          </View>
          
          <View style={styles.statusItem}>
            <View style={styles.statusIndicatorInactive} />
            <Text style={styles.statusTextInactive}>Approved</Text>
          </View>
          
          <View style={styles.statusItem}>
            <View style={styles.statusIndicatorInactive} />
            <Text style={styles.statusTextInactive}>Rejected</Text>
          </View>

          <Text style={styles.statusNote}>
            Once you submit your claim, SID will review the information and proof provided. 
            You will be notified of the decision and next steps.
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    color: '#6B7280',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  imageUpload: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  uploadText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#A85751',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicatorActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
    marginRight: 12,
  },
  statusIndicatorInactive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  statusTextInactive: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  statusNote: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 16,
    lineHeight: 20,
  },
});