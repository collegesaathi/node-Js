const express = require("express");
const router = express.Router();
const { AddChat, ChatGet, ChatVisitorGet, ChatUserGet } = require("../controllers/ChatController");
router.post("/chat/add", AddChat);
router.get("/chat/get", ChatGet);
router.get("/chat/user", ChatUserGet);
router.get("/chat/visitor/:visitor_id", ChatVisitorGet);


module.exports = router;
