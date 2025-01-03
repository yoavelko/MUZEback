exports.notifyClients = (io, event, data) => {
    // This function can be used to notify all connected clients
    io.emit(event, data);
};