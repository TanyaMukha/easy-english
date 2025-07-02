import React from 'react';
import { TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SharedStyles, Colors, Spacing, Shadows, DeviceUtils } from '../../../services/database/styles/SharedStyles';

interface FloatingActionButtonProps {
  icon: string;
  onPress: () => void;
  accessibilityLabel?: string;
  backgroundColor?: string;
  iconColor?: string;
  size?: 'small' | 'medium' | 'large';
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

/**
 * Single Responsibility: Provide floating action button functionality
 * Open/Closed: Can be extended with different FAB styles and positions
 * Interface Segregation: Only requires action-related props
 */
const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  accessibilityLabel,
  backgroundColor = Colors.primary,
  iconColor = Colors.textPrimary,
  size = 'medium',
  position = 'bottom-right',
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: DeviceUtils.getValue(48, 52),
          height: DeviceUtils.getValue(48, 52),
          borderRadius: DeviceUtils.getValue(24, 26),
          iconSize: 20,
        };
      case 'large':
        return {
          width: DeviceUtils.getValue(64, 72),
          height: DeviceUtils.getValue(64, 72),
          borderRadius: DeviceUtils.getValue(32, 36),
          iconSize: 28,
        };
      default: // medium
        return {
          width: DeviceUtils.getValue(56, 64),
          height: DeviceUtils.getValue(56, 64),
          borderRadius: DeviceUtils.getValue(28, 32),
          iconSize: 24,
        };
    }
  };

  const getPositionStyles = () => {
    const bottom = DeviceUtils.getValue(24, 32);
    const horizontal = DeviceUtils.getValue(24, 32);
    const screenWidth = Dimensions.get('window').width;
    const sizeStyles = getSizeStyles();

    switch (position) {
      case 'bottom-left':
        return { bottom, left: horizontal };
      case 'bottom-center':
        return { 
          bottom, 
          left: (screenWidth - sizeStyles.width) / 2,
        };
      default: // bottom-right
        return { bottom, right: horizontal };
    }
  };

  const sizeStyles = getSizeStyles();
  const positionStyles = getPositionStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor,
          width: sizeStyles.width,
          height: sizeStyles.height,
          borderRadius: sizeStyles.borderRadius,
        },
        positionStyles,
        Shadows.lg,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Ionicons 
        name={icon as any} 
        size={sizeStyles.iconSize} 
        color={iconColor} 
      />
    </TouchableOpacity>
  );
};

const styles = {
  container: {
    position: 'absolute' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    zIndex: 1000,
  },
};

export default FloatingActionButton;