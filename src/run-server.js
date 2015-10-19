import { Server } from "./n2r-server";
import express from "express";

var n2rServer = new Server();
var app = express();

app.use(n2rServer.expressHandler);

app.listen(4000);
app.listen(4001);
