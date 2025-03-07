import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  Dimensions,
  Animated,
  PanResponder,
  TextInput,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';

interface AddQRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description: string; imageUri?: string }) => void;
}

const AddQRCodeModal: React.FC<AddQRCodeModalProps> = ({ 
  visible, 
  onClose,
  onSave
}) => {
  // State for form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  // Create animated value for drag gesture
  const pan = React.useRef(new Animated.ValueXY()).current;
  
  // Create pan responder for drag to dismiss
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          Animated.event([null, { dy: pan.y }], { useNativeDriver: false })(_, gestureState);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // If dragged down more than 100 units, close the modal
          handleClose();
        } else {
          // Otherwise, reset position
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false
          }).start();
        }
      }
    })
  ).current;

  // Reset pan and form when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      pan.setValue({ x: 0, y: 0 });
    }
  }, [visible, pan]);

  const handleClose = () => {
    // Reset form fields
    setTitle('');
    setDescription('');
    setImageUri(undefined);
    onClose();
  };

  const handleSave = () => {
    // Validate and save QR code
    if (title.trim()) {
      onSave({
        title: title.trim(),
        description: description.trim(),
        imageUri
      });
      handleClose();
    }
  };

  const handlePickImage = () => {
    // Here you would implement image picking functionality
    // This is just a placeholder
    console.log('Pick image');
    // For demo purposes, let's pretend we set an image
    // setImageUri('some-image-uri');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <Animated.View 
          style={[
            styles.modalView,
            { transform: [{ translateY: pan.y }] }
          ]}
        >
          {/* White header with drag handle */}
          <View style={styles.headerContainer} {...panResponder.panHandlers}>
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New QR Code</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={16} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.modalContent}>
            {/* Form Fields */}
            <View style={styles.formField}>
              <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Enter title"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter description"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Pick QR Code image <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
                <Ionicons name="image-outline" size={48} color="#777" />
                {!imageUri && <Text style={styles.imagePickerText}>Pick QR Code image</Text>}
                {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
              </TouchableOpacity>
            </View>

            {/* Save Button */}
            <View style={styles.buttonContainer}>
              <Button title="Save" onPress={handleSave} />
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  headerContainer: {
    backgroundColor: 'white',
    width: '100%',
    paddingTop: 12,
    paddingBottom: 12,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  dragHandle: {
    width: 100,
    height: 5,
    backgroundColor: '#D3D3D3',
    borderRadius: 2.5,
  },
  modalView: {
    backgroundColor: '#FFF7F7',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    height: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  modalContent: {
    flex: 1,
    width: '100%',
    padding: 20,
  },
  formField: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  required: {
    color: '#D91A1A',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  imagePicker: {
    height: 150,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerText: {
    marginTop: 8,
    color: '#777',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingVertical: 20,
  }
});

export default AddQRCodeModal;