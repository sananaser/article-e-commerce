const dotenv = require("dotenv");
// Load environment variables first
dotenv.config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

connectDB();
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});