import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { DataHydrationService } from '../common/utils/DataHydrationService';

// Create the task context
const TaskContext = createContext();

// Custom hook for using task context
export const useTaskContext = () => useContext(TaskContext);

// Task provider component
export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => {
    // Initialize with hydrated data if should hydrate
    return DataHydrationService.shouldHydrate() 
      ? DataHydrationService.getInitialTasks() 
      : [];
  });
  const stats = useMemo(() => {
    const completed = tasks.filter(task => task.isCompleted).length;
    return {
      total: tasks.length,
      completed,
      remaining: tasks.length - completed
    };
  }, [tasks]);

  const addTask = useCallback((task) => {
    const id = Math.floor(Math.random() * 10000) + 1;
    const newTask = { id, ...task };
    setTasks(currentTasks => [...currentTasks, newTask]);
    return newTask;
  }, []);

  const toggleTask = useCallback((id) => {
    setTasks(currentTasks =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks(currentTasks => currentTasks.filter((task) => task.id !== id));
  }, []);

  const completeAllTasks = useCallback((taskIds = null) => {
    setTasks(currentTasks => taskIds
      ? currentTasks.map(task =>
        taskIds.includes(task.id) ? { ...task, isCompleted: true } : task
      )
      : currentTasks.map(task => ({ ...task, isCompleted: true }))
    );
  }, []);

  const deleteCompletedTasks = useCallback((taskIds = null) => {
    setTasks(currentTasks => taskIds && taskIds.length > 0
      ? currentTasks.filter(task => !taskIds.includes(task.id))
      : currentTasks.filter(task => !task.isCompleted)
    );
  }, []);

  // Tag-related task operations
  const updateTasksWithEditedTag = useCallback((oldTag, newTag) => {
    setTasks(currentTasks => currentTasks.map(task => {
      if (task.tags && task.tags.includes(oldTag)) {
        const updatedTags = task.tags.map(tag => 
          tag === oldTag ? newTag : tag
        );
        return { ...task, tags: updatedTags };
      }
      return task;
    }));
  }, []);

  const updateTasksWithDeletedTag = useCallback((tagToDelete) => {
    setTasks(currentTasks => currentTasks.map(task => {
      if (task.tags && task.tags.includes(tagToDelete)) {
        const updatedTags = task.tags.filter(tag => tag !== tagToDelete);
        return { ...task, tags: updatedTags };
      }
      return task;
    }));
  }, []);

  const value = useMemo(() => ({
    tasks,
    stats,
    addTask,
    toggleTask,
    deleteTask,
    completeAllTasks,
    deleteCompletedTasks,
    updateTasksWithEditedTag,
    updateTasksWithDeletedTag
  }), [
    tasks,
    stats,
    addTask,
    toggleTask,
    deleteTask,
    completeAllTasks,
    deleteCompletedTasks,
    updateTasksWithEditedTag,
    updateTasksWithDeletedTag
  ]);

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};