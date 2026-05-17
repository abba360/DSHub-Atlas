const express = require("express");
const router = express.Router();

const controller = require("./intern.controller");

router.post("/", controller.createIntern);
router.get("/", controller.getAllInterns);
router.get("/:id", controller.getInternById);
router.put("/:id", controller.updateIntern);
router.delete("/:id", controller.deleteIntern);

module.exports = router;