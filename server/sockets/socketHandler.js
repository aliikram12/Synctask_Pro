const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_workspace', (workspaceId) => {
      socket.join(workspaceId);
      console.log(`User ${socket.id} joined workspace ${workspaceId}`);
    });

    socket.on('leave_workspace', (workspaceId) => {
      socket.leave(workspaceId);
      console.log(`User ${socket.id} left workspace ${workspaceId}`);
    });

    socket.on('typing', ({ workspaceId, userId, taskId }) => {
      socket.to(workspaceId).emit('user_typing', { userId, taskId });
    });

    socket.on('stop_typing', ({ workspaceId, userId, taskId }) => {
      socket.to(workspaceId).emit('user_stopped_typing', { userId, taskId });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      // Handle presence/offline status if needed
    });
  });
};

module.exports = socketHandler;
