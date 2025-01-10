// BottomSheetForm.tsx
import React from 'react';
import {
  Modal,
  StyleSheet,
  Animated,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface BottomSheetFormProps {
  visible: boolean;
  children: React.ReactNode;
  onClose: () => void;
}

const BottomSheetForm: React.FC<BottomSheetFormProps> = ({
  visible,
  children,
  onClose,
}) => {
  const slideAnim = new Animated.Value(300); // Start with the sheet off-screen

  // Slide animation for showing and hiding the bottom sheet
  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : 300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* KeyboardAvoidingView for moving form up when keyboard appears */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Animated.View
          style={[styles.content, { transform: [{ translateY: slideAnim }] }]}
        >
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 50,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: -2 }, // iOS shadow
    shadowOpacity: 0.2, // iOS shadow
    shadowRadius: 4, // iOS shadow
  },
});

export default BottomSheetForm;
