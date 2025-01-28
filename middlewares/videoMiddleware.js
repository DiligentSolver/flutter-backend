// Middleware to serve static files (including videos) from the "videos" folder
const app = express();
app.use("/videos", express.static(path.join(__dirname, "videos"))); // Serve videos from the 'videos' directory
