import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '../styles/colors'; // Import your color scheme

import * as RootNavigation from '../navigation/RootNavigation';

const CongratulationsModal = ({ visible, onClose, goal, resetStreak }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          {/* Trophy Animation */}
          <LottieView
            source={require('../../assets/trophy_animation.json')}
            autoPlay
            loop
            style={styles.trophyAnimation}
          />

          {/* Congratulatory Text */}
          <Text style={styles.congratsText}>CONGRATS!</Text>

          {/* Dynamic Message */}
          <Text style={styles.message}>
            You've reached your streak goal of {goal} days! {'\n'} Keep going
            and set high scores! You have the following options to procede:
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => {
                onClose();
                //resetStreak();
              }}
              style={[styles.button, styles.primaryButton]}
            >
              <Text style={styles.buttonText}>GO BACK TO THE HOMEPAGE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                RootNavigation.navigate('Visuals');
                onClose();
                //resetStreak();
              }}
              style={[styles.button, styles.secondaryButton]}
            >
              <Text style={styles.buttonText}>SEE PROGRESS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onClose();
                //resetStreak();
                RootNavigation.navigate('Settings'); // Navigate directly to the Settings page
              }}
              style={[styles.button, styles.tertiaryButton]}
            >
              <Text style={styles.buttonText}>ADJUST GOAL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  trophyAnimation: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryGreen,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.darkGrey,
    textAlign: 'center',
    marginVertical: 15,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primaryGreen,
  },
  secondaryButton: {
    backgroundColor: colors.secondaryBlue,
  },
  tertiaryButton: {
    backgroundColor: colors.pastelYellow,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CongratulationsModal;
