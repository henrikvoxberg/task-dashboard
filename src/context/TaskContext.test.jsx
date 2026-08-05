import React, { useState } from 'react';
import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { TaskProvider, useTaskContext } from './TaskContext';

vi.mock('../common/utils/DataHydrationService', () => ({
  DataHydrationService: {
    shouldHydrate: () => false,
    getInitialTasks: () => []
  }
}));

describe('TaskProvider', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1234);
  });

  test('keeps the context value stable across unrelated parent renders', () => {
    const values = [];
    let rerenderParent;

    function Consumer() {
      values.push(useTaskContext());
      return null;
    }

    function Parent() {
      const [, setCount] = useState(0);
      rerenderParent = () => setCount(count => count + 1);
      return (
        <TaskProvider>
          <Consumer />
        </TaskProvider>
      );
    }

    render(<Parent />);
    const initialValue = values.at(-1);

    act(() => rerenderParent());

    expect(values.at(-1)).toBe(initialValue);
  });

  test('updates tasks and derived stats in the same render', () => {
    const values = [];
    let context;

    function Consumer() {
      context = useTaskContext();
      values.push(context);
      return null;
    }

    render(
      <TaskProvider>
        <Consumer />
      </TaskProvider>
    );

    let newTask;
    act(() => {
      newTask = context.addTask({ text: 'New task', isCompleted: false });
    });

    expect(newTask).toEqual({ id: 1235, text: 'New task', isCompleted: false });
    expect(context.tasks).toEqual([newTask]);
    expect(context.stats).toEqual({ total: 1, completed: 0, remaining: 1 });
    expect(values).toHaveLength(2);

    act(() => context.toggleTask(newTask.id));

    expect(context.stats).toEqual({ total: 1, completed: 1, remaining: 0 });
    expect(values).toHaveLength(3);
  });

  test('preserves optional task ID behavior for bulk actions', () => {
    let context;

    function Consumer() {
      context = useTaskContext();
      return null;
    }

    render(
      <TaskProvider>
        <Consumer />
      </TaskProvider>
    );

    let firstTask;
    let secondTask;
    act(() => {
      firstTask = context.addTask({ text: 'First', isCompleted: false });
      secondTask = context.addTask({ text: 'Second', isCompleted: false });
    });

    act(() => context.completeAllTasks([firstTask.id]));
    expect(context.tasks.find(task => task.id === firstTask.id).isCompleted).toBe(true);
    expect(context.tasks.find(task => task.id === secondTask.id).isCompleted).toBe(false);

    act(() => context.deleteCompletedTasks([]));
    expect(context.tasks).toEqual([secondTask]);

    act(() => context.completeAllTasks());
    act(() => context.deleteCompletedTasks());
    expect(context.tasks).toEqual([]);
  });
});
