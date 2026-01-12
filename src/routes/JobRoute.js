const express = require("express");
const router = express.Router();

const {
  JobAdd,
  JobGetAll,
  JobGetById,
  JobUpdate,
  JobDelete,
} = require("../controllers/JobController");

router.post("/job/add", JobAdd);
router.get("/job/get", JobGetAll);
router.get("/job/get/:id", JobGetById);
router.post("/job/update/", JobUpdate);
router.delete("/job/delete/:id", JobDelete);

module.exports = router;
