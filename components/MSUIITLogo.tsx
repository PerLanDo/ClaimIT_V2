import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ImageStyle,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface MSUIITLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  textStyle?: TextStyle;
}

export const MSUIITLogo: React.FC<MSUIITLogoProps> = ({
  size = 'medium',
  showText = true,
  style,
  imageStyle,
  textStyle,
}) => {
  const { theme } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { height: 40, width: 40 },
          image: { height: 40, width: 40 },
          text: { fontSize: 10, marginTop: 2 },
        };
      case 'large':
        return {
          container: { height: 100, width: 100 },
          image: { height: 100, width: 100 },
          text: { fontSize: 16, marginTop: 8 },
        };
      default: // medium
        return {
          container: { height: 60, width: 60 },
          image: { height: 60, width: 60 },
          text: { fontSize: 12, marginTop: 4 },
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, sizeStyles.container, style]}>
      {/* 
        Note: Replace this placeholder with your actual MSU-IIT logo
        The logo should be placed at: assets/images/msu-iit-logo.png
      */}
      <View
        style={[
          styles.logoPlaceholder,
          sizeStyles.image,
          { backgroundColor: theme.colors.msuPrimary },
          imageStyle,
        ]}
      >
        <Text
          style={[
            styles.placeholderText,
            { color: theme.colors.textOnPrimary },
          ]}
        >
          MSU-IIT
        </Text>
      </View>

      {/* 
        Uncomment this when you have placed your logo file:
        <Image
          source={require('../assets/images/msu-iit-logo.png')}
          style={[styles.logo, sizeStyles.image, imageStyle]}
          resizeMode="contain"
        />
      */}

      {showText && (
        <Text
          style={[
            styles.text,
            sizeStyles.text,
            { color: theme.colors.text },
            textStyle,
          ]}
        >
          MSU-IIT
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // Style for the actual logo image
  },
  logoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  placeholderText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default MSUIITLogo;
