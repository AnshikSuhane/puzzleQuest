import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Authrouter } from "./routes/auth.js";
import { Puzzlerouter } from "./routes/puzzles.js";

dotenv.config();

const app = express();

// ✅ Allow both localhost and Netlify frontend
const allowedOrigins = [
  "http://localhost:5173",
  "https://beautiful-granita-65861d.netlify.app"
];  

// ✅ Setup CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman) or allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }  
  },  
  credentials: true, // Required if you're using cookies or Authorization headers
}));  

// ✅ Body parser
app.use(express.json());

app.use("/api/auth", Authrouter);
app.use("/api/puzzles", Puzzlerouter);

// ✅ Server listen
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
