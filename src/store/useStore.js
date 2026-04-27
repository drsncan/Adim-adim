import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useStore = create(
  persist(
    (set, get) => ({
      tasks: [],
      activeTaskId: null,
      streakCount: 0, // [cite: 31, 42]
      lastCompletionDate: null, // YYYY-MM-DD formatında tutacağız

      addTask: (title) => set((state) => ({
        tasks: [...state.tasks, { id: Date.now().toString(), title, isCompleted: false, note: '' }]
      })),

      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
        )
      })),

      setActiveTask: (id) => set({ activeTaskId: id }),

      // YENİ: Seri (Streak) Güncelleme Fonksiyonu
      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = get().lastCompletionDate;
        const currentStreak = get().streakCount;

        if (lastDate === today) return; // Bugün zaten görev yapılmışsa artırma

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDate === yesterdayStr) {
          // Eğer dün yapılmışsa seriyi 1 artır 
          set({ streakCount: currentStreak + 1, lastCompletionDate: today });
        } else {
          // Arada gün atlanmışsa seriyi 1'e sıfırla 
          set({ streakCount: 1, lastCompletionDate: today });
        }
      },

      completeActiveTask: () => {
        const { activeTaskId, tasks, updateStreak } = get();
        set({
          tasks: tasks.map(task => 
            task.id === activeTaskId ? { ...task, isCompleted: true } : task
          ),
          activeTaskId: null 
        });
        updateStreak(); // Görev bitince seriyi kontrol et [cite: 20]
      },

      updateTaskNote: (id, noteText) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, note: noteText } : task
        )
      }))
    }),
    {
      name: 'adim-adim-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);