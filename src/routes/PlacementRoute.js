const express = require("express");
const router = express.Router();
const dynamicUpload = require("../utils/Uploader");
const { ApprovalAdd, ApprovalEdit, ApprovalSoftDelete, PlacementAdd, PlacementEdit, PlacementSoftDelete, ApprovalandPlacements } = require("../Controllers/PlacementController");
router.post("/approval/add", dynamicUpload("approvals").single("image"), ApprovalAdd);
router.post("/approval/edit", dynamicUpload("approvals").single("image"), ApprovalEdit);
router.get("/approval/delete/:id", ApprovalSoftDelete)
router.post("/placement/add",  dynamicUpload("placements").single("image"), PlacementAdd);
 router.post("/placement/edit",  dynamicUpload("placements").single("image"), PlacementEdit);
router.get("/placement/delete/:id", PlacementSoftDelete)
router.get("/placement/approval", ApprovalandPlacements)
module.exports = router;