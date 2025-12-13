const {Router}  = require('express');
const usersRoutes = require('./users.routes');
const sessionsRoutes = require('./sessions.routes');
const groupsRoutes = require('./groups.routes');
const recordsRoutes = require('./records.routes');

const routes = Router();

routes.use('/users', usersRoutes);
routes.use('/sessions', sessionsRoutes);
routes.use('/groups', groupsRoutes);
routes.use('/records', recordsRoutes);

module.exports = routes;