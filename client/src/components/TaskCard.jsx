import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Clock, MessageSquare, Paperclip, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

const TaskCard = ({ task, index }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white dark:bg-secondary-800 p-4 rounded-lg shadow-sm border ${
            snapshot.isDragging 
              ? 'border-primary-500 shadow-md ring-1 ring-primary-500' 
              : 'border-secondary-200 dark:border-secondary-700'
          } mb-3 group transition-shadow hover:border-secondary-300 dark:hover:border-secondary-600`}
          style={{ ...provided.draggableProps.style }}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-wrap gap-1">
              {task.labels && task.labels.map(label => (
                <span key={label} className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded">
                  {label}
                </span>
              ))}
              {task.priority === 'Urgent' && (
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">
                  Urgent
                </span>
              )}
            </div>
            <button className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          
          <h4 className="text-sm font-medium text-secondary-900 dark:text-white mb-2 line-clamp-2">
            {task.title}
          </h4>
          
          {task.description && (
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-3">
              {task.dueDate && (
                <div className={`flex items-center text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-secondary-500 dark:text-secondary-400'}`}>
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {format(new Date(task.dueDate), 'MMM d')}
                </div>
              )}
              {/* Placeholders for comments/attachments */}
              <div className="flex items-center text-xs text-secondary-500 dark:text-secondary-400">
                <MessageSquare className="w-3.5 h-3.5 mr-1" />
                2
              </div>
            </div>
            
            <div className="flex -space-x-2 overflow-hidden">
              {task.assignees && task.assignees.slice(0, 3).map((assignee, i) => (
                <img
                  key={assignee._id || i}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-secondary-800"
                  src={assignee.avatar || `https://ui-avatars.com/api/?name=${assignee.name || 'U'}&background=random`}
                  alt={assignee.name}
                  title={assignee.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
