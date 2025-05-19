import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import "dotenv/config";
import { setupRoute } from "./routes/index.route";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/helloworld", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the API" });
});
setupRoute(app);

// Error handlers
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
