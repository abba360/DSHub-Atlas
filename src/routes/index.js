const { Router } = require("express");
const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/users/user.routes");
const internRoutes = require("../modules/interns/intern.routes");

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DSHub auth service is healthy"
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/interns", internRoutes);

module.exports = router;
