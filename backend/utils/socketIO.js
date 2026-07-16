let ioInstance = null;

module.exports = {
  init: (io) => {
    ioInstance = io;
    console.log('🔌 Socket.io helper initialized');
  },
  getIO: () => ioInstance,
  emitToUser: (userId, event, data) => {
    if (ioInstance && userId) {
      ioInstance.to(userId.toString()).emit(event, data);
    }
  },
  broadcast: (event, data) => {
    if (ioInstance) {
      ioInstance.emit(event, data);
    }
  }
};
