import express from "express";
import "dotenv/config";
import config from "./config/keys.js";
import DFrouter from "./routes/dialogFlow.routes.js";
import path from "path";
import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

import "./models/Registration.js";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const PORT = process.env.PORT || 5000;

app.use("/api", DFrouter);

if (process.env.NODE_ENV === "production") {
  // js and css files
  app.use(express.static("client/build"));

  // index.html for all page routes
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Listening to PORT = ${PORT}`);
  //PORT on which the app is running
});
