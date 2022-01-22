const express = require("express");
const router = express.Router();

const {
  register,
  login,
  emailVerify,
  resendEmailCode,
} = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/emailVerify", emailVerify);
router.get("/resendEmailCode/:email", resendEmailCode);

module.exports = router;
