import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useRouter } from 'expo-router';
import { Card } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

type Reminder = {
  id: number;
  title: string;
  description: string;
  datetime: string;
};

export default function HomeScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const baseUrl = 'http://issw.mandakh.org';

  const apiUrl = `${baseUrl}/apireminder/`;

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'savetoken', token }),
        });
      }
    });

    fetchReminders();
  }, []);

  // 🔄 Refresh reminders when returning to this screen
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchReminders();
    }, [])
  );

  const fetchReminders = async () => {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'getreminders' }),
      });

      const data = await response.json();
      setReminders(data.data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Reminder }) => (
    <TouchableOpacity
      style={styles.reminderItem}
      onPress={() =>
        router.push({
          pathname: '/detail',
          params: {
            reminder: JSON.stringify(item),
          },
        })
      }
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.reminderTitle}>{item.title}</Text>
          <Text style={styles.reminderTime}>
            {new Date(item.datetime).toLocaleString([], {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reminder Апп</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : reminders.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
          No reminders found.
        </Text>
      ) : (
        <FlatList
          data={reminders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={loading}
          onRefresh={fetchReminders}
        />
      )}

     <TouchableOpacity
        style={styles.newReminderButton1}
        onPress={() =>
          router.push({
            pathname: '/uploadimg',
            params: {},
          })
        }
      >
        <Text style={styles.newReminderText}>+ Зураг оруулах</Text>
      </TouchableOpacity>


      <TouchableOpacity
        style={styles.newReminderButton}
        onPress={() =>
          router.push({
            pathname: '/AddReminder',
            params: {},
          })
        }
      >
        <Text style={styles.newReminderText}>+ Reminder нэмэх</Text>
      </TouchableOpacity>
    </View>
  );
}


async function registerForPushNotificationsAsync() {
  try {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push мэдэгдэл зөвшөөрөгдөөгүй');
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('📱 Expo Push Token:', token);
      return token;
    } else {
      console.warn('Бодит төхөөрөмж дээр туршина уу');
    }
  } catch (error) {
    console.error('Push notification бүртгэлд алдаа:', error);
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    paddingTop:20,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'center',
    color: '#6200ea',
  },
  reminderItem: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    padding: 12,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  reminderTime: {
    fontSize: 14,
    color: '#777',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
  newReminderButton: {
    backgroundColor: '#6200ea',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  newReminderButton1: {
    margin: 'auto',
    width:250,
    backgroundColor: '#6200ea',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  newReminderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
