import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Button } from 'react-native-paper'; 

export default function ReminderDetail() {
  const router = useRouter();
  const { reminder } = useLocalSearchParams();

  let parsedReminder;

  try {
    if (typeof reminder === 'string') {
      parsedReminder = JSON.parse(reminder);
    } else {
      throw new Error('Reminder not found');
    }
  } catch (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Reminder data is invalid or missing.</Text>
      </View>
    );
  }
  const url ='http://issw.mandakh.org/apireminder/';
  

  const handleDelete = async () => {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deletereminder',
          id: parsedReminder.id,
        }),
      });
      router.back();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      Alert.alert('Error', 'There was an issue deleting the reminder.');
    }
  };

  return (
    <View style={styles.container}>
  <Card style={styles.card}>
    <Card.Content>
      <Text style={styles.title}>{parsedReminder.title}</Text>

      <View style={styles.infoBlock}>
        <Text style={styles.label}>📅 Өдөр</Text>
        <Text style={styles.value}>
          {new Date(parsedReminder.datetime).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.infoBlock}>
        <Text style={styles.label}>⏰ Цаг</Text>
        <Text style={styles.value}>
          {new Date(parsedReminder.datetime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

    
      <View style={styles.infoBlock}>
        <Text style={styles.label}>📝 Дэлгэрэнгүй</Text>
        <Text style={styles.value}>{parsedReminder.description}</Text>
      </View>
    </Card.Content>

    <Card.Actions style={styles.cardActions}>
      <Button
        mode="outlined"
        onPress={() =>
          router.push({
            pathname: '/EditReminder',
            params: { reminder: JSON.stringify(parsedReminder) },
          })
        }
        style={styles.button}
        labelStyle={{ fontWeight: 'bold' }}
      >
        ✏️ Засах
      </Button>
      <Button
        mode="contained"
        onPress={handleDelete}
        style={styles.deleteButton}
        labelStyle={{ fontWeight: 'bold', color: 'white' }}
      >
        🗑️ Устгах
      </Button>
    </Card.Actions>
  </Card>
</View>

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  card: {
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#fff',
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ea',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoBlock: {
    marginBottom: 12,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  label: {
    fontSize: 14,
    color: '#999',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingBottom: 12,
    marginTop: 8,
  },
  button: {
    borderRadius: 20,
    borderColor: '#6200ea',
  },
  deleteButton: {
    backgroundColor: '#6200ea',
    borderRadius: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});
