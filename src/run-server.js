import { Server } from "./n2r-server";
import express from "express";

const n2rServer = new Server();
const app = express();

app.get('/', (req, res, next) => {
	res.contentType('text/plain');
	res.send("Welcome to NodeN2R!");
});

app.use(n2rServer.expressHandler);

const port = 4000;
console.log("Listening on port "+port);
app.listen(port);
