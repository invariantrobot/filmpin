import betterLogging from "better-logging";
import express from "express";
import expressSession from "express-session";
import cors from "cors";
import moviesRouter from "./controllers/movies.controller.js";

const port = 8989;
const app = express();

const { Theme } = betterLogging;
betterLogging(console, {
  color: Theme.green,
});

// Enable debug output
console.logLevel = 4;

// Enable CORS for frontend requests
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// Register a custom middleware for logging incoming requests
app.use(
  betterLogging.expressMiddleware(console, {
    ip: { show: true, color: Theme.green.base },
    method: { show: true, color: Theme.green.base },
    header: { show: false },
    path: { show: true },
    body: { show: true },
  }),
);

// Configure session management
const sessionConf = expressSession({
  secret: "Super secret! Shh! Do not tell anyone...",
  resave: true,
  saveUninitialized: true,
});

app.use(sessionConf);

// Serve static files
//app.use(express.static(resolvePath("client", "dist")));

// Register middlewares that parse the body of the request, available under req.body property
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Bind REST controllers to /api/*
app.use("/api", moviesRouter);

app.get("/healthz", (req, res) => res.json({ ok: true }));

app.listen(port, () =>
  console.log(`Server listening on http://localhost:${port}`),
);

//app.get("*", (req, res) => {
//res.sendFile(path.join(resolvePath("client", "dist"), "index.html"));
//});
