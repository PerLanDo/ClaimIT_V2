import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeSwitchProps {
  size?: number;
  style?: any;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({
  size = 24,
  style,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          justifyContent: 'center',
          alignItems: isDark ? 'flex-end' : 'flex-start',
        },
        style,
      ]}
      onPress={toggleTheme}
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      accessibilityRole="button"
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        {isDark ? (
          <Moon color={theme.colors.text} size={size} />
        ) : (
          <Sun color={theme.colors.msuPrimary} size={size} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
  },
  iconContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});

export default ThemeSwitch;
