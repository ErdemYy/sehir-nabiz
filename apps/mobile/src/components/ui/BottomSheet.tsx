import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  Animated,
  PanResponder,
  Pressable,
  Dimensions,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[]; // [0.35, 0.75] gibi ekran oranı veya piksel
  initialSnapIndex?: number;
  showBackdrop?: boolean;
  style?: ViewStyle;
}

export function BottomSheet({
  visible,
  onClose,
  children,
  snapPoints = [SCREEN_HEIGHT * 0.45, SCREEN_HEIGHT * 0.82],
  initialSnapIndex = 0,
  showBackdrop = true,
  style,
}: BottomSheetProps): React.ReactElement | null {
  const { theme, radii, spacing, shadows } = useAppTheme();
  const insets = useSafeAreaInsets();

  const activeHeight = snapPoints[initialSnapIndex] ?? snapPoints[0] ?? SCREEN_HEIGHT * 0.45;

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 3,
          speed: 14,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          // Aşağı çekilme
          translateY.setValue(gesture.dy);
        } else {
          // Yukarı çekilme (hafif direnç)
          translateY.setValue(gesture.dy * 0.4);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 120 || gesture.vy > 0.8) {
          // Kapatma eşiği aşıldı
          onClose();
        } else {
          // Eski konumuna geri yaylan
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
            speed: 16,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFill}>
        {/* Backdrop (Dokunarak kapatma alanı) */}
        {showBackdrop ? (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: theme.overlay,
                opacity: backdropOpacity,
              },
            ]}
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={onClose}
              accessibilityLabel="Paneli kapat"
              accessibilityRole="button"
            />
          </Animated.View>
        ) : null}

        {/* Panel Gövdesi */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: activeHeight + insets.bottom,
              backgroundColor: theme.surfaceElevated,
              borderTopLeftRadius: radii.sheet, // 24px
              borderTopRightRadius: radii.sheet,
              borderTopWidth: 1,
              borderColor: theme.border,
              paddingBottom: insets.bottom,
              transform: [{ translateY }],
              ...shadows.floating,
            },
            style,
          ]}
        >
          {/* Drag Handle (Kaydırma Tutamacı) */}
          <View
            {...panResponder.panHandlers}
            accessibilityLabel="Kaydırma tutamacı"
            accessibilityRole="adjustable"
            style={{
              width: '100%',
              alignItems: 'center',
              paddingVertical: spacing.sm,
            }}
          >
            <View
              style={{
                width: 36,
                height: 5,
                borderRadius: radii.pill,
                backgroundColor: theme.border,
              }}
            />
          </View>

          {/* İçerik */}
          <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}
