import React, { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus, Filter, Search } from 'lucide-react';
import useTaskStore from '../store/useTaskStore';
import TaskCard from '../components/TaskCard';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'In Progress', 'Completed'];

const Tasks = () => {
  const { tasks, fetchTasks, updateTaskStatus, addTask, isLoading } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock workspaceId for demonstration, in a real app this would come from route params or context
  const workspaceId = '64f1b2b3c4d5e6f7a8b9c0d1'; 

  useEffect(() => {
    fetchTasks(workspaceId);
  }, [fetchTasks, workspaceId]);

  const onDragEnd = useCallback(
    (result) => {
      const { destination, source, draggableId } = result;

      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) return;

      const newStatus = destination.droppableId;
      updateTaskStatus(draggableId, newStatus, tasks);
    },
    [tasks, updateTaskStatus]
  );

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const handleCreateTask = async (data) => {
    try {
      await addTask({
        ...data,
        workspaceId,
        status: 'Pending',
        labels: data.labels ? data.labels.split(',').map(l => l.trim()) : [],
      });
      setIsModalOpen(false);
      reset();
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const filteredTasks = tasks.filter(t => t.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Task Board</h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">Manage your project tasks</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {isLoading && tasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
            {STATUSES.map((status) => (
              <div key={status} className="flex flex-col h-full bg-secondary-100/50 dark:bg-secondary-800/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-secondary-900 dark:text-white">{status}</h3>
                  <span className="bg-secondary-200 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {filteredTasks.filter((t) => t.status === status).length}
                  </span>
                </div>
                
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 overflow-y-auto custom-scrollbar transition-colors ${
                        snapshot.isDraggingOver ? 'bg-primary-50 dark:bg-primary-900/10 rounded-lg' : ''
                      }`}
                    >
                      {filteredTasks
                        .filter((t) => t.status === status)
                        .map((task, index) => (
                          <TaskCard key={task._id} task={task} index={index} />
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

      {/* Create Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
        <form onSubmit={handleSubmit(handleCreateTask)} className="space-y-4">
          <Input label="Title" {...register('title', { required: true })} placeholder="Task title" />
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">
              Description
            </label>
            <textarea
              {...register('description')}
              className="w-full rounded-md border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              placeholder="Add details about this task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">
                Priority
              </label>
              <select
                {...register('priority')}
                className="w-full rounded-md border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <Input label="Due Date" type="date" {...register('dueDate')} />
          </div>

          <Input label="Labels (comma separated)" {...register('labels')} placeholder="Frontend, Bug, Design" />

          <div className="flex justify-end pt-4 space-x-3">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
