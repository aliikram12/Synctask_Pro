import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus, Filter, Search, X } from 'lucide-react';
import useTaskStore from '../store/useTaskStore';
import useWorkspaceStore from '../store/useWorkspaceStore';
import TaskCard from '../components/TaskCard';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'In Progress', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
];

const Tasks = () => {
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const { tasks, fetchTasks, updateTaskStatus, addTask, updateTask, deleteTask, isLoading } =
    useTaskStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    sort: 'newest',
  });

  const workspaceId = activeWorkspace?._id;

  useEffect(() => {
    if (workspaceId) {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.sort) params.sort = filters.sort;
      if (searchQuery) params.search = searchQuery;
      fetchTasks(workspaceId, params);
    }
  }, [workspaceId, fetchTasks, filters.status, filters.priority, filters.sort]);

  const onDragEnd = useCallback(
    (result) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index)
        return;
      updateTaskStatus(draggableId, destination.droppableId);
    },
    [updateTaskStatus]
  );

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const handleCreateTask = async (data) => {
    if (!workspaceId) return;
    try {
      await addTask({
        ...data,
        workspaceId,
        status: 'Pending',
        labels: data.labels ? data.labels.split(',').map((l) => l.trim()).filter(Boolean) : [],
        dueDate: data.dueDate || undefined,
      });
      setIsCreateOpen(false);
      reset();
      toast.success('Task created');
    } catch {
      toast.error('Failed to create task');
    }
  };

  const handleEditTask = async (data) => {
    if (!editTask) return;
    try {
      await updateTask(editTask._id, {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate || null,
        labels: data.labels ? data.labels.split(',').map((l) => l.trim()).filter(Boolean) : [],
      });
      setEditTask(null);
      toast.success('Task updated');
    } catch {
      toast.error('Failed to update task');
    }
  };

  const filteredTasks = useMemo(() => {
    let list = [...tasks];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) => t.title?.toLowerCase().includes(q));
    }
    return list;
  }, [tasks, searchQuery]);

  if (!activeWorkspace) {
    return (
      <div className="glass rounded-xl p-12 text-center text-surface-500">
        Select or create a workspace to manage tasks.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Task Board</h1>
          <p className="text-sm text-surface-500">{activeWorkspace.name}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search tasks"
              className="pl-9 pr-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-48 sm:w-56"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="glass rounded-xl p-4 mb-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs font-medium text-surface-500 block mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-surface-500 block mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
              className="rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-surface-500 block mb-1">Sort</label>
            <select
              value={filters.sort}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
              className="rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 px-3 py-2 text-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setFilters({ status: '', priority: '', sort: 'newest' })}>
            <X className="h-4 w-4" /> Clear
          </Button>
        </div>
      )}

      {isLoading && tasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center" role="status">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
            {STATUSES.map((status) => (
              <div
                key={status}
                className="flex flex-col min-h-[400px] bg-surface-100/50 dark:bg-surface-800/30 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-surface-900 dark:text-white">{status}</h2>
                  <span className="bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {filteredTasks.filter((t) => t.status === status).length}
                  </span>
                </div>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 overflow-y-auto custom-scrollbar min-h-[200px] transition-colors rounded-lg p-1 ${
                        snapshot.isDraggingOver ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                      }`}
                    >
                      {filteredTasks
                        .filter((t) => t.status === status)
                        .map((task, index) => (
                          <TaskCard
                            key={task._id}
                            task={task}
                            index={index}
                            onEdit={() => setEditTask(task)}
                            onDelete={async () => {
                              if (confirm('Delete this task?')) {
                                await deleteTask(task._id);
                                toast.success('Task deleted');
                              }
                            }}
                          />
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      <TaskFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Task"
        onSubmit={handleCreateTask}
        register={register}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        reset={reset}
      />

      {editTask && (
        <TaskFormModal
          isOpen={!!editTask}
          onClose={() => setEditTask(null)}
          title="Edit Task"
          defaultValues={{
            title: editTask.title,
            description: editTask.description,
            priority: editTask.priority,
            dueDate: editTask.dueDate ? editTask.dueDate.split('T')[0] : '',
            labels: editTask.labels?.join(', '),
          }}
          onSubmit={handleEditTask}
          register={register}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

const TaskFormModal = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  register,
  handleSubmit,
  isSubmitting,
  defaultValues,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Title" {...register('title', { required: true })} defaultValue={defaultValues?.title} placeholder="Task title" />
      <div>
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Description</label>
        <textarea
          {...register('description')}
          defaultValue={defaultValues?.description}
          className="w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={4}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Priority</label>
          <select
            {...register('priority')}
            defaultValue={defaultValues?.priority || 'Medium'}
            className="w-full rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900 px-3 py-2 text-sm"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <Input label="Due Date" type="date" {...register('dueDate')} defaultValue={defaultValues?.dueDate} />
      </div>
      <Input label="Labels (comma separated)" {...register('labels')} defaultValue={defaultValues?.labels} />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>Save</Button>
      </div>
    </form>
  </Modal>
);

export default Tasks;
