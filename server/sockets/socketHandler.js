const socketHandler = (io) => {
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_workspace', ({ workspaceId, userId, userName }) => {
      if (!workspaceId) return;
      socket.join(workspaceId);
      socket.workspaceId = workspaceId;
      socket.userId = userId;

      if (userId) {
        if (!onlineUsers.has(workspaceId)) onlineUsers.set(workspaceId, new Map());
        onlineUsers.get(workspaceId).set(userId, { userId, userName, socketId: socket.id });
        io.to(workspaceId).emit('presence_update', {
          online: Array.from(onlineUsers.get(workspaceId).values()),
        });
      }
    });

    socket.on('leave_workspace', (workspaceId) => {
      socket.leave(workspaceId);
      if (socket.userId && onlineUsers.has(workspaceId)) {
        onlineUsers.get(workspaceId).delete(socket.userId);
        io.to(workspaceId).emit('presence_update', {
          online: Array.from(onlineUsers.get(workspaceId).values()),
        });
      }
    });

    socket.on('typing', ({ workspaceId, userId, userName, taskId }) => {
      socket.to(workspaceId).emit('user_typing', { userId, userName, taskId });
    });

    socket.on('stop_typing', ({ workspaceId, userId, taskId }) => {
      socket.to(workspaceId).emit('user_stopped_typing', { userId, taskId });
    });

    socket.on('disconnect', () => {
      const { workspaceId, userId } = socket;
      if (workspaceId && userId && onlineUsers.has(workspaceId)) {
        onlineUsers.get(workspaceId).delete(userId);
        io.to(workspaceId).emit('presence_update', {
          online: Array.from(onlineUsers.get(workspaceId).values()),
        });
      }
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
