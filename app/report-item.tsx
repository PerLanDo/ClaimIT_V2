import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { ArrowLeft, Camera, ChevronDown } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function ReportItemScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [dateLostFound, setDateLostFound] = useState('');
  const [itemType, setItemType] = useState<'lost' | 'found'>('lost');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  const categories = [
    'Electronics',
    'Apparel',
    'Books',
    'Accessories',
    'Documents',
    'Keys',
    'Bags',
    'Other'
  ];

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !category || !location || !dateLostFound) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!profile) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setLoading(true);

    try {
      // For now, we'll store the item without image upload
      // In production, you'd upload the image to your storage service first
      const { data, error } = await supabase
        .from('items')
        .insert({
          title,
          description,
          category,
          location,
          date_lost_found: dateLostFound,
          item_type: itemType,
          posted_by: profile.id,
          image_url: imageUri, // In production, this would be the uploaded image URL
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      Alert.alert(
        'Success', 
        `Item reported successfully!`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error reporting item:', error);
      Alert.alert('Error', 'Failed to report item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Item</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              itemType === 'lost' && styles.typeButtonActive,
            ]}
            onPress={() => setItemType('lost')}
          >
            <Text
              style={[
                styles.typeButtonText,
                itemType === 'lost' && styles.typeButtonTextActive,
              ]}
            >
              Lost Item
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              itemType === 'found' && styles.typeButtonActive,
            ]}
            onPress={() => setItemType('found')}
          >
            <Text
              style={[
                styles.typeButtonText,
                itemType === 'found' && styles.typeButtonTextActive,
              ]}
            >
              Found Item
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Brief title of the item"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detailed description of the item"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity style={styles.dropdown}>
            <TextInput
              style={styles.dropdownInput}
              placeholder="Select category"
              value={category}
              onChangeText={setCategory}
            />
            <ChevronDown color="#6B7280" size={20} />
          </TouchableOpacity>

          <View style={styles.categoryHint}>
            <Text style={styles.hintText}>e.g, Electronics, Apparel, Books</Text>
          </View>

          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="Where was it lost/found?"
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>Date *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={dateLostFound}
            onChangeText={setDateLostFound}
          />

          <Text style={styles.label}>Upload Image</Text>
          <TouchableOpacity style={styles.imageUpload} onPress={handleImagePicker}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
            ) : (
              <>
                <Camera color="#6B7280" size={32} />
                <Text style={styles.uploadText}>Tap to upload image</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
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
  content: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  typeButtonActive: {
    backgroundColor: '#A85751',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  dropdownInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
  },
  categoryHint: {
    marginBottom: 16,
  },
  hintText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  imageUpload: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
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
});