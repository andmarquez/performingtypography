import { useState } from 'react';
import { useApp } from '../store/appStore';
import { TaskCard } from '../components/TaskCard';
import type { Task } from '../types';

export function InboxScreen() {
  const { inboxTasks, modes, addTask, updateTask, deleteTask, completeTask } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(60);
  const [category, setCategory] = useState('work');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addTask({
      name: name.trim(),
      durationMinutes: duration,
      category,
      priority,
      deadline: deadline || undefined,
      notes: notes || undefined,
      canSplit: true,
      preferredTimeOfDay: 'any',
      flexibility: 'flexible',
    });
    setName('');
    setDuration(60);
    setNotes('');
    setDeadline('');
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Inbox</h1>
          <p className="text-sm text-navy/60 mt-1">
            Safe dumping ground. No judgment. (Some judgment.)
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-2xl bg-coral px-4 py-2 text-sm font-bold text-white shadow-md"
        >
          + Add
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What needs doing?"
            className="w-full rounded-xl bg-cream px-3 py-3 text-sm font-medium"
            required
            autoFocus
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 15)}
              className="rounded-xl bg-cream px-3 py-2 text-sm"
              min={15}
              step={15}
              placeholder="Minutes"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl bg-cream px-3 py-2 text-sm"
            >
              {modes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.icon} {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task['priority'])}
              className="rounded-xl bg-cream px-3 py-2 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="rounded-xl bg-cream px-3 py-2 text-sm"
            />
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full rounded-xl bg-cream px-3 py-2 text-sm resize-none"
          />
          <button type="submit" className="w-full rounded-xl bg-navy py-3 font-bold text-white text-sm">
            Add to inbox
          </button>
        </form>
      )}

      <p className="text-xs font-semibold text-navy/40">
        {inboxTasks.length} unscheduled task{inboxTasks.length !== 1 ? 's' : ''}
      </p>

      {inboxTasks.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center">
          <span className="text-4xl">📥</span>
          <p className="font-display text-lg font-bold text-navy mt-3">Inbox zero energy</p>
          <p className="text-sm text-navy/50 mt-1">Add tasks here before organizing them.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inboxTasks.map((task, i) => (
            <TaskCard
              key={task.id}
              task={task}
              modes={modes}
              onUpdate={updateTask}
              onComplete={completeTask}
              onDelete={deleteTask}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
