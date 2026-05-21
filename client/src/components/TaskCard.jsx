import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Clock, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const priorityColors = {
  Urgent: 'bg-danger-50 text-danger-600',
  High: 'bg-warning-50 text-warning-600',
  Medium: 'bg-primary-50 text-primary-600',
  Low: 'bg-surface-100 text-surface-600',
};

const TaskCard = ({ task, index, onEdit, onDelete }) => {
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white dark:bg-surface-800 p-4 rounded-lg shadow-sm border mb-3 group card-hover ${
            snapshot.isDragging
              ? 'border-primary-500 shadow-md ring-2 ring-primary-500/30'
              : 'border-surface-200 dark:border-surface-700'
          }`}
          style={provided.draggableProps.style}
          role="article"
          aria-label={`Task: ${task.title}`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-wrap gap-1">
              {task.labels?.map((label) => (
                <span
                  key={label}
                  className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded"
                >
                  {label}
                </span>
              ))}
              {task.priority && (
                <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded ${priorityColors[task.priority] || ''}`}>
                  {task.priority}
                </span>
              )}
            </div>
            <div className="relative opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <button
                className="p-1 text-surface-400 hover:text-surface-600"
                aria-label="Task options"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-6 z-10 hidden group-hover:block bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 py-1 min-w-[120px]">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>

          <h3 className="text-sm font-medium text-surface-900 dark:text-white mb-1 line-clamp-2">
            {task.title}
          </h3>

          {task.description && (
            <p className="text-xs text-surface-500 mb-3 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            {task.dueDate && (
              <div
                className={`flex items-center text-xs ${isOverdue ? 'text-danger-600 font-medium' : 'text-surface-500'}`}
              >
                <Clock className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                <time dateTime={task.dueDate}>{format(new Date(task.dueDate), 'MMM d')}</time>
              </div>
            )}
            <div className="flex -space-x-2 ml-auto">
              {task.assignees?.slice(0, 3).map((assignee, i) => (
                <div
                  key={assignee._id || i}
                  className="h-6 w-6 rounded-full gradient-bg flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white dark:ring-surface-800"
                  title={assignee.name}
                >
                  {assignee.name?.charAt(0) || '?'}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
