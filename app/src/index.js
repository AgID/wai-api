import express from "express";
import bodyParser from "body-parser";
import "core-js/stable";
import "regenerator-runtime/runtime";
import dotenv from "dotenv";
import routes from "./routes/routes";

export const app = express();

dotenv.config();

app.use(bodyParser.json());

app.use(routes);

app.use((req, res)=>{
  res.status(404).json({ error: "Not Found" });
});

let port;

switch (process.env.NODE_ENV) {
  case "dev":
    port = process.env.PORT_DEV
    break;
  case "test":
    port = process.env.PORT_TEST
    break;
  default:
    port = process.env.PORT_PROD
    break;
}

export const server = app.listen(port, () => {
  console.log(`app is listening to port ${port}`);
});
