import express, { Request, Response } from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
// import { Morgan } from "./shared/morgan";
import router from "../src/app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import session from "express-session";
import { FeedRoutes } from "./app/modules/feed/feed.routes";
import { MatchRoutes } from "./app/modules/match/match.routes";
import { MessageRoutes } from "./app/modules/message/message.routes";
import { ConversationRoutes } from "./app/modules/conversation/conversation.routes";
import { BlockRoutes } from "./app/modules/block/block.routes";
import path from "path";
import { JourneyRoutes } from "./app/modules/journey/journey.route";
import { TherapyRoutes } from "./app/modules/therapy/therapy.routes";
import { DiagnosisRoutes } from "./app/modules/diagonosis/diagonosis.routes";
const app = express();

// morgan
// app.use(Morgan.successHandler);
// app.use(Morgan.errorHandler);

//body parser
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//file retrieve
// app.use(express.static('uploads'));

const UPLOAD_ROOT =
  process.env.UPLOAD_ROOT || path.resolve(process.cwd(), "uploads");
app.use(
  "/uploads",
  express.static(UPLOAD_ROOT, {
    maxAge: "1y",
    etag: true,
  
    setHeaders(res) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    },
  })
);

// Session middleware (must be before passport initialization)
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Secure should be true in production with HTTPS
  })
);

// Initialize Passport
// app.use(passport.initialize());
// app.use(passport.session());

//router
app.use("/api/v1", router);
app.use("/api/v1/feed", FeedRoutes);
app.use("/api/v1/match", MatchRoutes);
app.use("/api/v1/chat", MessageRoutes); // messages
app.use("/api/v1/chat", ConversationRoutes); // list/recent/archive
app.use("/api/v1/user", BlockRoutes);
app.use("/api/v1/journey", JourneyRoutes);
app.use("/api/v1/therapy", TherapyRoutes);
app.use("api/v1/diagnosis", DiagnosisRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hey Backend, How can I assist you ");
});

//global error handle
app.use(globalErrorHandler);

// handle not found route
app.use((req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "Not Found",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

export default app;
