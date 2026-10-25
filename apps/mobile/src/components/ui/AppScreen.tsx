import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  type ViewStyle,
  type RefreshControlProps,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme';

export interface AppScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  edges?: Edge[];
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  keyboardAvoiding?: boolean;
}

export function AppScreen({
  children,
  scrollable = false,
  edges = ['top', 'left', 'right'],
  style,
  contentContainerStyle,
  refreshControl,
  keyboardAvoiding = false,
}: AppScreenProps): React.ReactElement {
  const { theme, spacing } = useAppTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.background,
  };

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[
        { flexGrow: 1, paddingBottom: spacing['4xl'] },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, contentContainerStyle]}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} style={[containerStyle, style]}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
