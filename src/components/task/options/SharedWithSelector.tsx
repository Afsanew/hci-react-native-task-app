import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import users from '../../../context/UserContext';
import colors from '../../../styles/colors';

interface SharedWithSelectorProps {
  sharedWith: string[];
  onSharedWithChange: (users: string[]) => void;
  type: 'category' | 'task'; // Type of sharedWith selector (category or task)
}

const SharedWithSelector: React.FC<SharedWithSelectorProps> = ({
  sharedWith,
  onSharedWithChange,
  type,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>(sharedWith);

  const toggleUser = (thisname: string) => {
    const updatedUsers = selectedUsers.includes(thisname)
      ? selectedUsers.filter(name => name !== thisname) // Remove user
      : [...selectedUsers, thisname]; // Add user

    setSelectedUsers(updatedUsers);
    onSharedWithChange(updatedUsers);
  };

  const renderUserItem = ({
    item,
  }: {
    item: { name: string; avatar: any }; // Adjusted type for `avatar`
  }) => (
    <TouchableOpacity
      onPress={() => toggleUser(item.name)}
      style={[
        styles.userItem,
        selectedUsers.includes(item.name) && styles.selectedUserItem,
      ]}
    >
      <Image source={item.avatar} style={styles.avatar} />
      <Text
        style={[
          styles.userName,
          selectedUsers.includes(item.name) && styles.selectedUserName,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {type === 'category' ? 'Share Category With' : 'Share Task With'}
      </Text>
      <FlatList
        data={users}
        keyExtractor={item => item.name}
        renderItem={renderUserItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.userList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 8,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 2,
  },
  label: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  userList: {
    flexDirection: 'row',
  },
  userItem: {
    alignItems: 'center',
    marginRight: 10,
    padding: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.lightGrey,
    marginBottom: 5,
  },
  selectedUserItem: {
    borderColor: colors.primaryGreen,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: colors.lightGreen,
  },
  userName: {
    fontSize: 15,
    color: colors.text,
  },
  selectedUserName: {
    fontWeight: 'bold',
  },
});

export default SharedWithSelector;
