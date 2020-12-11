import express from "express";
import bodyParser from "body-parser";
import "core-js/stable";
import "regenerator-runtime/runtime";
import dotenv from "dotenv";
import routes from "./routes/routes";

const app = express();

dotenv.config();

app.use(bodyParser.json());

app.use(routes);

app.use((req, res)=>{
  res.status(404).json({ error: "Not Found" });
});

app.listen(process.env.PORT, () => {
  console.log(`app is listening to port ${process.env.PORT}`);
});
