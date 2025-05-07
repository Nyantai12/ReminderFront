import React, { useState } from 'react';
import { View, Button, Image, FlatList, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ImageUploadScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setSelectedImage(result.assets[0]);
    } else {
      console.log('Зураг сонгогдоогүй');
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      Alert.alert('Анхаар!', 'Зураг сонгоно уу');
      return;
    }

    const formData = new FormData();
    formData.append('action', 'uploadimage');
    formData.append('image', {
        uri: selectedImage.uri,
        name: selectedImage.fileName || 'photo.jpg', // аль болох оригинал нэр авна
        type: 'image/jpeg',
      });
      

    console.log('FormData:', formData._parts); // Бүртгэж шалгаарай!

    try {
      const response = await fetch('http://issw.mandakh.org/apireminder/', {
        method: 'POST',
        body: formData, // Corrected this part
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (data.resultCode === 200) {
        setUploadedImages(prev => [...prev, ...data.data]);
        setSelectedImage(null);
      }
       else {
        Alert.alert('Амжилтгүй', data.resultMessage || 'Зураг хадгалах үед алдаа гарлаа');
      }
    } catch (error) {
      console.error('Upload алдаа:', error);
      Alert.alert('Сервертэй холбогдож чадсангүй');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick Image" onPress={pickImage} />
      {selectedImage && (
        <Image source={{ uri: selectedImage.uri }} style={styles.preview} />
      )}
      <Button title="Upload Image" onPress={uploadImage} />

      <Text style={styles.title}>Uploaded Images:</Text>
<FlatList
  data={uploadedImages}
  keyExtractor={item => item.id.toString()}
  renderItem={({ item }) => (
    <View style={{ marginBottom: 10 }}>
      <Image
        source={{ uri: `http://issw.mandakh.org/${item.image}` }} 
        style={styles.uploadedImage}
      />
      
    </View>
  )}
/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  preview: { width: '100%', height: 200, marginVertical: 10 },
  uploadedImage: { width: '100%', height: 150, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  
});
