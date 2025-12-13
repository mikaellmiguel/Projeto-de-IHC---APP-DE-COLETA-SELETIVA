const {Router} = require("express");

const GroupsController = require("../controllers/GroupsController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const GoalsController = require("../controllers/GoalsController");
const goalsController = new GoalsController();

const groupsRoutes = Router();
const groupsController = new GroupsController();

groupsRoutes.post("/", ensureAuthenticated, groupsController.create);
groupsRoutes.get("/", ensureAuthenticated, groupsController.list);
groupsRoutes.put("/:id", ensureAuthenticated, groupsController.update);
groupsRoutes.delete("/:id", ensureAuthenticated, groupsController.delete);
groupsRoutes.post("/join/:code", ensureAuthenticated, groupsController.join);
groupsRoutes.post("/leave/:id", ensureAuthenticated, groupsController.leave);
groupsRoutes.post("/add-admin/:id", ensureAuthenticated, groupsController.addAdmin);
groupsRoutes.post("/remove-admin/:id", ensureAuthenticated, groupsController.removeAdmin);
groupsRoutes.get("/members/:id", ensureAuthenticated, groupsController.listMembers);
groupsRoutes.post("/remove-member/:id/", ensureAuthenticated, groupsController.removeMember);
groupsRoutes.get("/:id/goals", ensureAuthenticated, goalsController.list);
groupsRoutes.post("/:id/goals/:month/:year", ensureAuthenticated, goalsController.create);
groupsRoutes.put("/:id/goals/:month/:year", ensureAuthenticated, goalsController.update);
groupsRoutes.delete("/:id/goals/:month/:year", ensureAuthenticated, goalsController.delete);


module.exports = groupsRoutes;