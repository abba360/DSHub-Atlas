const app = require("./app");
const env = require("./config/env");
const { pool } = require("./config/db");
const userService = require("./modules/users/user.service");

const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    if (
      env.ADMIN_BOOTSTRAP_NAME &&
      env.ADMIN_BOOTSTRAP_EMAIL &&
      env.ADMIN_BOOTSTRAP_PASSWORD
    ) {
      await userService.seedAdminIfMissing({
        fullName: env.ADMIN_BOOTSTRAP_NAME,
        email: env.ADMIN_BOOTSTRAP_EMAIL,
        password: env.ADMIN_BOOTSTRAP_PASSWORD
      });
    }
    app.listen(env.PORT, () => {
      console.log(`${env.APP_NAME} listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
