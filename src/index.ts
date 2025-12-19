import express from "express";
import cors from "cors";
import multer from "multer";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) });

import connection from "./db/connection"

import routes from "./routes/routes";

const app = express();
const port = process.env.PORT || 4000;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

connection.sync().then(() => {
  // console.log("Database synced successfully");
});

const allowedOrigins = [
  'https://vendor-registration.globalplugin.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://invoices.globalplugin.com'
];

const options: cors.CorsOptions = {
  origin: allowedOrigins
};

app.use(cors(options));
app.use(upload.any());

app.use('/api', routes);

// app.get("*", (req, res) => {
//   res.status(400).send("Backend is running");
// });

//Heath test
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

app.listen(port, () => {
  console.log(`server is starting on port ${port}`);
});