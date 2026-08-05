import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { TaskProvider, useTaskContext } from './TaskContext';

const renderSpy = vi.fn();

function TaskConsumer() {
  const { addTask, stats } = useTaskContext();
  renderSpy();

  return (
    <button
      type="button"
      onClick={() => addTask({ title: 'New task', isCompleted: false })}
    >
      {stats.total} tasks
    </button>
  );
}

describe('TaskProvider', () => {
  beforeEach(() => {
    renderSpy.mockClear();
  });

  test('renders consumers once per task update while keeping stats current', () => {
    render(
      <TaskProvider>
        <TaskConsumer />
      </TaskProvider>
    );

    renderSpy.mockClear();
    fireEvent.click(screen.getByRole('button', { name: '0 tasks' }));

    expect(screen.getByRole('button', { name: '1 tasks' })).toBeInTheDocument();
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });
});