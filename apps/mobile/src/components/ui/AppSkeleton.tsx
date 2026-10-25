import React, { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';
import { useAppTheme } from '../../theme';

export interface AppSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function AppSkeleton({
  width = '100%',
  height = 20,
  borderRadius,
  style,
}: AppSkeletonProps): React.ReactElement {
  const { theme, radii } = useAppTheme();
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: borderRadius ?? radii.medium,
          backgroundColor: theme.border,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}
