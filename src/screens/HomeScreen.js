import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Ekranlar arası geçiş için
import { useStore } from '../store/useStore'; 

export default function HomeScreen() {
  const { tasks, streakCount, toggleTask, addTask, setActiveTask } = useStore();
  const [newTask, setNewTask] = useState('');
  const navigation = useNavigation(); // Navigasyon kancasını çağırdık

  const handleAddTask = () => {
    if (newTask.trim().length > 0) {
      addTask(newTask);
      setNewTask('');
    }
  };

  // YENİ: Odaklan butonuna basıldığında çalışacak fonksiyon
  const handleFocusTask = (id) => {
    setActiveTask(id); // Görevi seç
    navigation.navigate('Odaklanma'); // Odaklanma sekmesine zıpla
  };

  const renderTask = ({ item }) => (
  <View style={styles.taskCard}>
    <TouchableOpacity 
      style={[styles.checkbox, item.isCompleted && styles.checkboxCompleted]} 
      onPress={() => toggleTask(item.id)}
    >
      {item.isCompleted && <Ionicons name="checkmark" size={18} color="#fff" />}
    </TouchableOpacity>
    
    <View style={{ flex: 1 }}>
      <Text style={[styles.taskTitle, item.isCompleted && styles.taskCompletedText]}>
        {item.title}
      </Text>
      
      {/* NOT GÖRÜNTÜLEME ALANI: Eğer not varsa başlığın altında göster */}
      {item.note ? (
        <Text style={styles.taskNoteText} numberOfLines={2}>
          {item.note}
        </Text>
      ) : null}
    </View>

    {!item.isCompleted && (
      <TouchableOpacity style={styles.focusButton} onPress={() => handleFocusTask(item.id)}>
        <Ionicons name="timer-outline" size={22} color="#6A5ACD" />
      </TouchableOpacity>
    )}
  </View>
);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Merhaba!</Text>
        <Text style={styles.subtitle}>Bugün neye odaklanıyoruz?</Text>
      </View>
    <View style={styles.streakCard}>
        <View style={styles.streakInfo}>
          <Text style={styles.streakLabel}>Mevcut Serin</Text>
          <Text style={styles.streakValue}>{streakCount} Gün 🔥</Text>
        </View>
        <Text style={styles.streakMessage}>Harika gidiyorsun, adım adım devam et!</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Yeni görev ekle..."
          value={newTask}
          onChangeText={setNewTask}
          onSubmitEditing={handleAddTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Görevlerim</Text>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FB', paddingHorizontal: 20, paddingTop: 50 },
  header: { marginBottom: 20 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#2D3142' },
  subtitle: { fontSize: 16, color: '#9094A6', marginTop: 5 },
  inputContainer: { flexDirection: 'row', marginBottom: 25 },
  input: { flex: 1, backgroundColor: '#FFF', height: 50, borderRadius: 12, paddingHorizontal: 15, fontSize: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, marginRight: 10 },
  addButton: { width: 50, height: 50, backgroundColor: '#6A5ACD', borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#6A5ACD', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4 },
  listContainer: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2D3142', marginBottom: 15 },
  taskCard: { backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#6A5ACD', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  checkboxCompleted: { backgroundColor: '#6A5ACD' },
  streakCard: {
    backgroundColor: '#6A5ACD', // Uygulamanın ana mor rengi [cite: 112]
    padding: 20,
    borderRadius: 20,
    marginBottom: 25,
    shadowColor: '#6A5ACD',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  streakInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  streakLabel: {
    color: '#E2E6F2',
    fontSize: 14,
    fontWeight: '500',
  },
  streakValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  streakMessage: {
    color: '#FFF',
    fontSize: 13,
    opacity: 0.9,
  }, 
  taskTitle: { fontSize: 16, color: '#4F5568', fontWeight: '500', flex: 1 },
  taskCompletedText: { textDecorationLine: 'line-through', color: '#B0B4C3' },
  taskNoteText: {
    fontSize: 13,
    color: '#9094A6',
    marginTop: 4,
    fontStyle: 'italic',
  },
  focusButton: { padding: 8, backgroundColor: '#F4F6FB', borderRadius: 8 } // Yeni butonun stili
});