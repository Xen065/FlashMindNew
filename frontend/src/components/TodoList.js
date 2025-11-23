import React, { useState, useEffect } from 'react';
import { tasksAPI } from '../services/api';
import './TodoList.css';

const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#6b7280' },
  { value: 'medium', label: 'Medium', color: '#3b82f6' },
  { value: 'high', label: 'High', color: '#f59e0b' },
  { value: 'urgent', label: 'Urgent', color: '#dc2626' },
];

function TodoList({ courseId = null, compact = false }) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    estimatedDuration: '',
  });

  useEffect(() => {
    loadTasks();
  }, [courseId]);

  useEffect(() => {
    applyFilters();
  }, [tasks, showCompleted, filterPriority]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (courseId) params.courseId = courseId;

      const response = await tasksAPI.getAll(params);
      setTasks(response.data.data.tasks || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Filter by completion status
    if (!showCompleted) {
      filtered = filtered.filter(task => !task.isCompleted);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    // Sort: urgent first, then by due date, then by creation
    filtered.sort((a, b) => {
      // Priority order
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;

      // Creation date
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setFilteredTasks(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      setLoading(true);
      const taskData = {
        ...formData,
        courseId: courseId || null,
      };

      if (editingTask) {
        // Update existing task
        await tasksAPI.update(editingTask.id, taskData);
      } else {
        // Create new task
        await tasksAPI.create(taskData);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        estimatedDuration: '',
      });
      setShowAddForm(false);
      setEditingTask(null);

      // Reload tasks
      await loadTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      if (task.isCompleted) {
        // Uncomplete task
        await tasksAPI.update(task.id, { isCompleted: false, status: 'pending' });
      } else {
        // Complete task
        await tasksAPI.complete(task.id);
      }

      await loadTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await tasksAPI.delete(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      estimatedDuration: task.estimatedDuration || '',
    });
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      estimatedDuration: '',
    });
    setShowAddForm(false);
  };

  const getPriorityColor = (priority) => {
    return PRIORITIES.find(p => p.value === priority)?.color || '#6b7280';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  if (compact) {
    const incompleteTasks = tasks.filter(t => !t.isCompleted);
    const urgentTasks = incompleteTasks.filter(t => t.priority === 'urgent' || t.priority === 'high');

    return (
      <div className="todo-compact">
        <div className="todo-compact-header">
          <span className="todo-compact-title">📝 Tasks</span>
          <span className="todo-compact-count">
            {incompleteTasks.length}
            {urgentTasks.length > 0 && <span className="urgent-badge">{urgentTasks.length} urgent</span>}
          </span>
        </div>
        {incompleteTasks.slice(0, 3).map(task => (
          <div key={task.id} className="todo-compact-item">
            <input
              type="checkbox"
              checked={false}
              onChange={() => handleToggleComplete(task)}
            />
            <span className="task-title">{task.title}</span>
            {task.dueDate && (
              <span className={`task-due ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        ))}
        {incompleteTasks.length > 3 && (
          <div className="todo-compact-more">+{incompleteTasks.length - 3} more</div>
        )}
      </div>
    );
  }

  return (
    <div className="todo-list">
      <div className="todo-header">
        <h3>📝 Todo List</h3>
        <button
          className="btn-add-task"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '✕' : '+ Add Task'}
        </button>
      </div>

      {showAddForm && (
        <form className="todo-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Task title..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Description (optional)..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="2"
          />
          <div className="form-row">
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              {PRIORITIES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <input
              type="date"
              placeholder="Due date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-save" disabled={loading}>
              {editingTask ? 'Update Task' : 'Add Task'}
            </button>
            {editingTask && (
              <button type="button" className="btn-cancel" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="todo-filters">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          />
          Show completed
        </label>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="filter-priority"
        >
          <option value="all">All priorities</option>
          {PRIORITIES.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      <div className="todo-items">
        {loading && filteredTasks.length === 0 ? (
          <div className="todo-loading">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="todo-empty">
            <p>No tasks yet! 🎉</p>
            <p className="empty-subtitle">Add your first task to get started.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`todo-item ${task.isCompleted ? 'completed' : ''} ${isOverdue(task.dueDate) ? 'overdue' : ''}`}
            >
              <div className="task-main">
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => handleToggleComplete(task)}
                  className="task-checkbox"
                />
                <div
                  className="task-priority-indicator"
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                  title={task.priority}
                />
                <div className="task-content">
                  <div className="task-title">{task.title}</div>
                  {task.description && (
                    <div className="task-description">{task.description}</div>
                  )}
                  <div className="task-meta">
                    {task.dueDate && (
                      <span className={`task-due ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
                        📅 {formatDate(task.dueDate)}
                        {isOverdue(task.dueDate) && ' (Overdue)'}
                      </span>
                    )}
                    {task.estimatedDuration && (
                      <span className="task-duration">⏱ {task.estimatedDuration} min</span>
                    )}
                    <span className="task-priority-label" style={{ color: getPriorityColor(task.priority) }}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
              <div className="task-actions">
                <button
                  className="btn-task-action"
                  onClick={() => handleEdit(task)}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="btn-task-action"
                  onClick={() => handleDelete(task.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredTasks.length > 0 && (
        <div className="todo-summary">
          <span>
            {filteredTasks.filter(t => !t.isCompleted).length} pending
          </span>
          <span>•</span>
          <span>
            {filteredTasks.filter(t => t.isCompleted).length} completed
          </span>
        </div>
      )}
    </div>
  );
}

export default TodoList;
