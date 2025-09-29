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
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Camera, ChevronDown, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import DatePicker from 'react-native-date-picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function ReportItemScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [dateLostFound, setDateLostFound] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [itemType, setItemType] = useState<'lost' | 'found'>('lost');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);
  const { profile } = useAuth();

  const categories = [
    'Electronics',
    'Apparel',
    'Books',
    'Accessories',
    'Documents',
    'Keys',
    'Bags',
    'Other',
  ];

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please grant camera roll permissions to upload images.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      allowsMultipleSelection: true,
      selectionLimit: 5, // Allow up to 5 images
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const newImageUris = result.assets.map((asset) => asset.uri);
      setImageUris((prev) => [...prev, ...newImageUris]);

      // Keep the legacy imageUri for backward compatibility
      if (result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    }
  };

  const handleCameraCapture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please grant camera permissions to take photos.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const newImageUri = result.assets[0].uri;
      setImageUris((prev) => [...prev, newImageUri]);
      setImageUri(newImageUri);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUris((prev) => prev.filter((_, i) => i !== index));
    if (index === 0 && imageUris.length > 1) {
      setImageUri(imageUris[1]);
    } else if (imageUris.length === 1) {
      setImageUri(null);
    }
  };

  const selectCategory = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setCategoryModalVisible(false);
  };

  const formatDateTime = (date: Date): string => {
    return date.toISOString().slice(0, 16).replace('T', ' ');
  };

  const handleDateSelect = () => {
    setDatePickerOpen(true);
  };

  const onDateConfirm = (date: Date) => {
    setSelectedDate(date);
    setDateLostFound(formatDateTime(date));
    setDatePickerOpen(false);
  };

  const onDateCancel = () => {
    setDatePickerOpen(false);
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
      const itemData = {
        title,
        description,
        category,
        location,
        date_lost_found: dateLostFound,
        item_type: itemType,
        posted_by: profile.id,
        image_url: imageUris.length > 0 ? imageUris[0] : null, // Use first image for now
        status: 'active' as const,
      };

      const { data, error } = await supabase
        .from('items')
        .insert(itemData as any) // Type assertion to handle type issue
        .select()
        .single();

      if (error) {
        throw error;
      }

      Alert.alert('Success', `Item reported successfully!`, [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
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
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setCategoryModalVisible(true)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !category && styles.placeholderText,
                ]}
              >
                {category || 'Select category'}
              </Text>
              <ChevronDown color="#6B7280" size={20} />
            </TouchableOpacity>

            <View style={styles.categoryHint}>
              <Text style={styles.hintText}>
                e.g, Electronics, Apparel, Books
              </Text>
            </View>

            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="Where was it lost/found?"
              value={location}
              onChangeText={setLocation}
            />

            <Text style={styles.label}>Date & Time *</Text>
            <TouchableOpacity style={styles.input} onPress={handleDateSelect}>
              <Text
                style={[
                  styles.dateText,
                  !dateLostFound && styles.placeholderText,
                ]}
              >
                {dateLostFound || 'Select date and time'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Upload Images</Text>
            <View style={styles.imageUploadContainer}>
              <TouchableOpacity
                style={styles.imageUploadButton}
                onPress={handleImagePicker}
              >
                <Camera color="#6B7280" size={24} />
                <Text style={styles.uploadButtonText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.imageUploadButton}
                onPress={handleCameraCapture}
              >
                <Camera color="#6B7280" size={24} />
                <Text style={styles.uploadButtonText}>Camera</Text>
              </TouchableOpacity>
            </View>

            {imageUris.length > 0 && (
              <ScrollView horizontal style={styles.imagePreviewContainer}>
                {imageUris.map((uri, index) => (
                  <View key={index} style={styles.imagePreviewWrapper}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Text style={styles.removeImageText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
                buttonPressed && styles.submitButtonPressed,
              ]}
              onPress={handleSubmit}
              onPressIn={() => setButtonPressed(true)}
              onPressOut={() => setButtonPressed(false)}
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
      </KeyboardAvoidingView>

      {/* Category Selection Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Text style={styles.modalCloseButton}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => selectCategory(item)}
                >
                  <Text style={styles.categoryItemText}>{item}</Text>
                  {category === item && <Check color="#A85751" size={20} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Date & Time Picker */}
      <DatePicker
        modal
        open={datePickerOpen}
        date={selectedDate}
        mode="datetime"
        title="Select Date & Time"
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={onDateConfirm}
        onCancel={onDateCancel}
        theme="light"
        locale="en"
        maximumDate={new Date()}
      />
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  placeholderText: {
    color: '#6B7280',
  },
  dateText: {
    fontSize: 16,
    color: '#111827',
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
  imageUploadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageUploadButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  imagePreviewContainer: {
    marginBottom: 16,
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  submitButtonPressed: {
    backgroundColor: '#22C55E', // Green color when pressed (simulating hover)
  },
  submitButtonHover: {
    backgroundColor: '#22C55E', // Green hover color
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#111827',
  },
});
