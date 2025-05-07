import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, TextInput as PaperInput, Button } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditReminder() {
  const router = useRouter();
  const { reminder } = useLocalSearchParams();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [datetime, setDatetime] = useState(new Date());
  const [id, setId] = useState(null);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (reminder && typeof reminder === 'string') {
      try {
        const parsed = JSON.parse(reminder);
        setTitle(parsed.title || '');
        setDescription(parsed.description || '');
        setDatetime(new Date(parsed.datetime));
        setId(parsed.id || null);

        const date = new Date(parsed.datetime);
        setSelectedDate(date.toISOString().split('T')[0]);
        setSelectedTime(date.toTimeString().slice(0, 5));
      } catch (error) {
        console.error('Reminder parse error:', error);
      }
    }
  }, [reminder]);

  const handleCalendarDateChange = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    const date = new Date(day.dateString);
    setDatetime(prev => {
      const updated = new Date(prev);
      updated.setFullYear(date.getFullYear());
      updated.setMonth(date.getMonth());
      updated.setDate(date.getDate());
      return updated;
    });
    setShowCalendar(false);
  };

  const handleTimePickerChange = (event: any, selected?: Date) => {
    if (selected) {
      const hour = selected.getHours();
      const minute = selected.getMinutes();
      setSelectedTime(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
      setDatetime(prev => {
        const updated = new Date(prev);
        updated.setHours(hour);
        updated.setMinutes(minute);
        updated.setSeconds(0);
        return updated;
      });
    }
    setShowTimePicker(false);
  };

  const handleSubmit = async () => {
    if (!title || !description || !datetime) {
      Alert.alert('Алдаа', 'Бүх талбарыг бөглөнө үү.');
      return;
    }

    const payload = {
      title,
      description,
      datetime: datetime.toISOString(),
    };

    const url = 'http://issw.mandakh.org/apireminder/';

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, action: 'updatereminder', id }),
      });
      router.back();
    } catch (error) {
      console.error('Error updating reminder:', error);
      Alert.alert('Error', 'Failed to update reminder. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <PaperInput
            label="Гарчиг"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <PaperInput
            label="Дэлгэрэнгүй"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
          />
        </Card.Content>
      </Card>

      {/* 📅 Date Selector */}
      <TouchableOpacity onPress={() => setShowCalendar(!showCalendar)} style={styles.selectButton}>
        <Text style={styles.selectButtonText}>📅 Өдөр сонгох</Text>
      </TouchableOpacity>

      {showCalendar && (
        <Card style={styles.calendarCard}>
          <Calendar
            onDayPress={handleCalendarDateChange}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#6200ea' },
            }}
            theme={{
              selectedDayBackgroundColor: '#6200ea',
              todayTextColor: '#6200ea',
              arrowColor: '#6200ea',
            }}
          />
        </Card>
      )}

      {selectedDate !== '' && (
        <Text style={styles.label}>Сонгосон өдөр: {selectedDate}</Text>
      )}

      {/* 🕒 Time Selector */}
      <TouchableOpacity onPress={() => setShowTimePicker(!showTimePicker)} style={styles.selectButton}>
        <Text style={styles.selectButtonText}>🕒 Цаг сонгох</Text>
      </TouchableOpacity>

      {showTimePicker && (
        <Card style={styles.calendarCard}>
          <DateTimePicker
            value={datetime}
            mode="time"
            is24Hour={true}
            textColor="black" 
            display={Platform.OS === 'web' ? 'spinner' : (Platform.OS === 'ios' ? 'spinner' : 'clock')}
            onChange={handleTimePickerChange}
          />
        </Card>
      )}

      {selectedTime !== '' && (
        <Text style={styles.label}>Сонгосон цаг: {selectedTime}</Text>
      )}

    
      <TouchableOpacity onPress={handleSubmit} style={styles.addButton}>
            <Text style={styles.addButtonText}>Reminder засах</Text>
          </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f8f8' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 5,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#6200ea',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 16,
    elevation: 3, // Android дээр сүүдэр
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
    color: 'black',
  },
  selectButton: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  selectButtonText: {
    color: '#6200ea',
    fontSize: 16,
    fontWeight: '600',
  },
  calendarCard: {
    color: '#6200ea',
    marginBottom: 10,
    borderRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
});
