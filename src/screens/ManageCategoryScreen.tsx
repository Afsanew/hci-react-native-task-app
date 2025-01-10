import React, { useState, useRef, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Alert,
} from 'react-native';
import { useToDoList } from '../context/ToDoListContext';
import colors from '../styles/colors';
import SharedWithSelector from '../components/task/options/SharedWithSelector';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
const CategoryManagementScreen = () => {
  type RouteParams = {
    params: {
      name: string;
    };
  };

  const route = useRoute<RouteProp<RouteParams>>();
  const { name } = route.params;
  const { toDoList, updateCategory, deleteCategory, updateTask } =
    useToDoList();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(100)).current;
  const modalPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isEditModalVisible ? 0 : 100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isEditModalVisible]);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', e => {
      const keyboardHeight = e.endCoordinates.height;
      Animated.timing(modalPosition, {
        toValue: -keyboardHeight / 2, // Adjust modal position
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', () => {
      Animated.timing(modalPosition, {
        toValue: 0, // Reset to original position
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleEditCategory = (categoryName: string) => {
    const category = toDoList.categories.find(cat => cat.name === categoryName);
    if (category) {
      setEditingCategory(categoryName);
      setNewName(category.name);
      setSharedWith([...category.sharedWith]);
      setSelectedColor(category.color);
      setEditModalVisible(true);
    }
  };

  const handleSaveCategory = () => {
    var shared = false;
    if (sharedWith) {
      console.log(editingCategory);
      shared = true;
    }
    if (editingCategory) {
      updateCategory(
        editingCategory,
        newName,
        shared,
        sharedWith,
        selectedColor,
      );

      toDoList.categories.forEach(category => {
        if (category.name === editingCategory) {
          category.tasks.forEach(task => {
            console.log(task.name);
            const new_task = {
              ...task,
              categoryColor: selectedColor,
              category: newName,
              shared: shared,
              sharedWith: sharedWith,
              inSharedtask: sharedWith.length > 0,
              categorySharedWith: sharedWith,
            };
            updateTask(new_task);
          });
        }
      });

      setEditingCategory(null);
      setNewName('');
      setSharedWith([]);
      setSelectedColor('');
      setEditModalVisible(false);
    }
  };

  const handleDeleteCategory = (categoryName: string) => {
    // Find the category to delete
    const categoryToDelete = toDoList.categories.find(
      category => category.name === categoryName,
    );

    if (!categoryToDelete) {
      alert('Category not found!');
      return;
    }

    // Confirm before deletion
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete the category "${categoryName}"? This will delete all associated tasks.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCategory(categoryName);

            // Close the modal if it's open
            setEditModalVisible(false);
          },
        },
      ],
    );
  };

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleEditCategory(item.name)}
    >
      <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
      <Text style={[styles.categoryName, { color: item.color }]}>
        {item.name}
      </Text>
      <TouchableOpacity
        onPress={() => handleEditCategory(item.name)}
        style={styles.edit_Button}
      >
        <Icon name="edit" size={25} color={colors.primaryGreen} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleDeleteCategory(item.name)}
        style={styles.delete_Button}
      >
        <Ionicons name="trash-outline" size={25} color={colors.delete} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
  useEffect(() => {
    console.log(name);
    if (name != '') {
      handleEditCategory(name);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Categories</Text>
      <FlatList
        data={toDoList.categories}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.name}
        contentContainerStyle={styles.listContainer}
      />

      {/* Edit Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="none">
        <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
          <View style={styles.overlay}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <Animated.View
                  style={[
                    styles.editModal,
                    { transform: [{ translateY: slideAnim }] },
                  ]}
                >
                  <Text style={styles.modalTitle}>Edit Category</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="Category Name"
                    value={newName}
                    onChangeText={setNewName}
                  />

                  <Text style={styles.label}>Pick a Color</Text>
                  <View style={styles.colorPickerContainer}>
                    {[
                      colors.categoryRed,
                      colors.categoryOrange,
                      colors.categoryYellow,
                      colors.categoryGreen,
                      colors.categoryBlue,
                      colors.categoryPurple,
                    ].map(color => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          {
                            backgroundColor: color,
                            borderWidth: selectedColor === color ? 2 : 0,
                          },
                        ]}
                        onPress={() => setSelectedColor(color)}
                      />
                    ))}
                  </View>

                  <SharedWithSelector
                    sharedWith={sharedWith}
                    onSharedWithChange={setSharedWith}
                    type="category"
                  />

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setEditModalVisible(false)}
                    >
                      <Text style={styles.cancelButtonTex}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleSaveCategory}
                    >
                      <Text style={styles.saveButtonText}>Save Category</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  edit_Button: {
    marginRight: 20,
  },
  delete_Button: {
    marginRight: 10,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.text,
  },
  listContainer: {
    paddingBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 20,
    backgroundColor: colors.white,
    borderRadius: 8,
    elevation: 2,
  },
  colorIndicator: {
    width: 25,
    height: 25,
    borderRadius: 15,
    marginRight: 10,
    marginLeft: 10,
  },
  categoryName: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  editModal: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingBottom: 50,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: -2 }, // iOS shadow
    shadowOpacity: 0.5, // iOS shadow
    shadowRadius: 50, // iOS shadow
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 17,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 10,
  },
  colorPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: colors.darkGrey,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: colors.lightGrey,
    padding: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 }, // iOS shadow
    shadowOpacity: 0.2, // iOS shadow
    shadowRadius: 3, // iOS shadow
  },
  cancelButtonTex: {
    color: colors.darkGrey,
    fontSize: 17,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: colors.primaryGreen,
    padding: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 }, // iOS shadow
    shadowOpacity: 0.2, // iOS shadow
    shadowRadius: 3, // iOS shadow
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});
export default CategoryManagementScreen;
