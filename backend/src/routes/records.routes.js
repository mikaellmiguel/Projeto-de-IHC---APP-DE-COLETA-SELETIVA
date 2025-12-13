const {Router} = require('express');

const RecordsController = require('../controllers/RecordsController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');
const recordsRoutes = Router();
const recordsController = new RecordsController();

recordsRoutes.post('/:id', ensureAuthenticated, recordsController.create);
recordsRoutes.get('/:id', ensureAuthenticated, recordsController.getUserRecords);
recordsRoutes.delete('/:id', ensureAuthenticated, recordsController.delete);
recordsRoutes.put('/:id', ensureAuthenticated, recordsController.update);
recordsRoutes.get('/feed/:id', ensureAuthenticated, recordsController.getFeedRecords);
recordsRoutes.post('/like/:id', ensureAuthenticated, recordsController.addLike);
recordsRoutes.post('/unlike/:id', ensureAuthenticated, recordsController.removeLike);
recordsRoutes.get("/impact/:id/:month/:year", ensureAuthenticated, recordsController.record_impact);

module.exports = recordsRoutes;
