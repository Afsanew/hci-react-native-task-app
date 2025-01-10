// BottomSheetPicker.tsx
import React, { useRef, useEffect, Children } from 'react';
import colors from '../../styles/colors';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
} from 'react-native';
import { Option } from '../../Types';

interface BottomSheetPickerProps {
  visible: boolean;
  options: Option[];
  onSelect: (value: Option) => void;
  onClose: () => void;
  children: React.ReactNode;
}

const BottomSheetPicker: React.FC<BottomSheetPickerProps> = ({
  visible,
  options,
  onSelect,
  onClose,
  children,
}) => {
  const slideAnim = useRef(new Animated.Value(100)).current; // Off-screen initially

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : 100,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none">
      {/* Overlay to close */}
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      />

      {/* Bottom Sheet with Slide Animation */}
      <Animated.View
        style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
      >
        {children}
        {options.map((option, index) =>
          option.value === 'addCategory' ? (
            <TouchableOpacity
              key={option.value}
              onPress={() => onSelect(option)}
              style={[
                styles.categoryPicker,
                {
                  borderColor: option.color,
                  backgroundColor: colors.buttonBackgroundGrey,
                }, // Remove top padding for the first option
              ]}
            >
              {option.color && (
                <View
                  style={[
                    styles.colorCircle,
                    { backgroundColor: option.color },
                  ]}
                />
              )}
              <Text style={styles.categoryText}>{option.label}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              key={option.value}
              onPress={() => onSelect(option)}
              style={[
                styles.categoryPicker,
                { borderColor: option.color }, // Remove top padding for the first option
              ]}
            >
              {option.color && (
                <View
                  style={[
                    styles.colorCircle,
                    { backgroundColor: option.color },
                  ]}
                />
              )}
              <Text style={styles.categoryText}>{option.label}</Text>
            </TouchableOpacity>
          ),
        )}
      </Animated.View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  categoryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    verticalAlign: 'middle',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // Android shadow
    elevation: 2,
    backgroundColor: colors.white,
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 18,
    color: colors.text,
    paddingRight: 30,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: 50,
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: -2 }, // iOS shadow
    shadowOpacity: 0.5, // iOS shadow
    shadowRadius: 50, // iOS shadow
    elevation: 5, // Android shadow
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
});

export default BottomSheetPicker;
