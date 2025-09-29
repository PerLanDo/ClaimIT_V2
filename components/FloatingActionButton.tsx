import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';

interface FloatingActionButtonProps {
  onPress: () => void;
}

export function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Plus color="#FFFFFF" size={24} strokeWidth={2} />
      <Text style={styles.fabText}>Report Item</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#A85751',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});