import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { useStore } from '../store/useStore';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const R = 125;
const CIRCLE_LENGTH = 2 * Math.PI * R;
const TOTAL_SECONDS = 25 * 60; 

export default function FocusScreen() {
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false); // Not alanının açık/kapalı durumu
  const progress = useSharedValue(0);

  const { activeTaskId, tasks, completeActiveTask, updateTaskNote } = useStore();
  const activeTask = tasks.find(t => t.id === activeTaskId);

  // Yerel not durumu (Yazarken performansı artırmak için)
  const [currentNote, setCurrentNote] = useState('');

  // Ekran yüklendiğinde veya aktif görev değiştiğinde o görevin notunu getir
  useEffect(() => {
    if (activeTask) {
      setCurrentNote(activeTask.note || '');
    } else {
      setCurrentNote('');
    }
  }, [activeTask]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(interval);
      setIsActive(false);
      progress.value = withTiming(1, { duration: 500 });
      
      if (activeTaskId) {
        completeActiveTask();
        alert(`Tebrikler! "${activeTask.title}" görevini tamamladın! 🎉`);
      } else {
        alert("Tebrikler! Odaklanma seansını tamamladın. 🎉");
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, progress, activeTaskId, activeTask, completeActiveTask]);

  useEffect(() => {
    if (timeLeft < TOTAL_SECONDS && timeLeft > 0) {
      progress.value = withTiming(1 - (timeLeft / TOTAL_SECONDS), { duration: 1000, easing: Easing.linear });
    }
  }, [timeLeft, progress]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(TOTAL_SECONDS);
    progress.value = withTiming(0, { duration: 500 });
  };

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCLE_LENGTH * progress.value,
  }));

  // Not yazıldıkça Store'a anında kaydet
  const handleNoteChange = (text) => {
    setCurrentNote(text);
    if (activeTaskId) {
      updateTaskNote(activeTaskId, text);
    }
  };

  return (
    // Klavyenin ekranı ezmesini engellemek için KeyboardAvoidingView kullanıyoruz
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.headerTitle}>Odaklanma Modu</Text>
          
          <Text style={styles.activeTaskText}>
            {activeTask ? `Şu an odaklanılan: ${activeTask.title}` : "Serbest Odaklanma Modu"}
          </Text>
          
          <View style={[styles.timerContainer, isNoteOpen && { transform: [{ scale: 0.7 }], marginBottom: 10 }]}>
            <Svg width={270} height={270} viewBox="0 0 270 270">
              <Circle cx="135" cy="135" r={R} stroke="#E2E6F2" strokeWidth="12" fill="none" />
              <AnimatedCircle cx="135" cy="135" r={R} stroke="#6A5ACD" strokeWidth="12" fill="none" strokeDasharray={CIRCLE_LENGTH} animatedProps={animatedProps} strokeLinecap="round" rotation="-90" originX="135" originY="135" />
            </Svg>
            <Text style={styles.timerText}>{formatTime()}</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.iconButton} onPress={resetTimer}>
              <Ionicons name="refresh-outline" size={32} color="#6A5ACD" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.playButton} onPress={toggleTimer}>
              <Ionicons name={isActive ? "pause" : "play"} size={40} color="#FFF" style={{ marginLeft: isActive ? 0 : 4 }} />
            </TouchableOpacity>

            {/* YENİ: Notları açıp kapatan buton */}
            <TouchableOpacity 
              style={[styles.iconButton, isNoteOpen && { backgroundColor: '#6A5ACD' }]} 
              onPress={() => setIsNoteOpen(!isNoteOpen)}
            >
              <Ionicons name="document-text-outline" size={32} color={isNoteOpen ? "#FFF" : "#6A5ACD"} />
            </TouchableOpacity>
          </View>

          {/* YENİ: Not Yazma Alanı (Sadece isNoteOpen true ise görünür) */}
          {isNoteOpen && (
            <View style={styles.noteWrapper}>
              <TextInput
                style={styles.noteInput}
                multiline
                placeholder="Odaklanırken aklına gelenleri buraya yaz..."
                placeholderTextColor="#A0A5B5"
                value={currentNote}
                onChangeText={handleNoteChange}
              />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FB', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '600', color: '#2D3142', position: 'absolute', top: 60 },
  activeTaskText: { fontSize: 16, color: '#6A5ACD', fontWeight: '500', position: 'absolute', top: 95 },
  timerContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 50, width: 270, height: 270 },
  timerText: { fontSize: 56, fontWeight: 'bold', color: '#2D3142', position: 'absolute' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '70%', zIndex: 10 },
  playButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6A5ACD', alignItems: 'center', justifyContent: 'center', shadowColor: '#6A5ACD', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  iconButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  
  // Yeni eklenen stiller
  noteWrapper: {
    width: '85%',
    height: 150,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 15,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  noteInput: {
    flex: 1,
    fontSize: 16,
    color: '#4F5568',
    textAlignVertical: 'top', // Yazının üstten başlaması için (Android)
  }
});