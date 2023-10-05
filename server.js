const express = require("express");
app = module.exports = express();
bodyParser = require("body-parser");
require("dotenv").config();
const timecut = require("timecut");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Website you wish to allow to connect

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  ); // Request methods you wish to allow

  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,token"
  ); // Request headers you wish to allow

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  next(); // Pass to next layer of middleware
});

app.get("/generate-video", async function (req, res) {
  try {
    try {
      await timecut({
        url: "https://bright-lokum-ef4278.netlify.app/",
        viewport: {
          width: 300, // sets the viewport (window size) to 800x600
          height: 400,
        },
        selector: "html", // crops each frame to the bounding box of '#container'
        left: 20,
        top: 40, // further crops the left by 20px, and the top by 40px
        right: 6,
        bottom: 30, // and the right by 6px, and the bottom by 30px
        fps: 15, // saves 30 frames for each virtual second
        duration: 1, // for 20 virtual seconds
        output: "video.mp4", // to video.mp4 of the current working directory
      }).then(function () {
        console.log("Done!");
        const videoFilePath = "./video.mp4"; // Path to the generated video file
        res.download(videoFilePath, "video.mp4", (err) => {
          if (err) {
            console.error("Error sending video file:", err);
            res.status(500).json({
              error: "An error occurred while sending the video file",
            });
          }
        });
      });
    } catch (error) {
      console.error("Error in timecut:", error);
      throw error;
    }
  } catch (e) {
    console.error("Error", e);
    res.status(500).json({ error: "An error occurred" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});

// const timecut = require("timecut");
// timecut({
//   url: "https://tungs.github.io/amuse/truchet-tiles/#autoplay=true&switchStyle=random",
//   viewport: {
//     width: 800, // sets the viewport (window size) to 800x600
//     height: 600,
//   },
//   selector: "#container", // crops each frame to the bounding box of '#container'
//   left: 20,
//   top: 40, // further crops the left by 20px, and the top by 40px
//   right: 6,
//   bottom: 30, // and the right by 6px, and the bottom by 30px
//   fps: 15, // saves 30 frames for each virtual second
//   duration: 1, // for 20 virtual seconds
//   output: "video.mp4", // to video.mp4 of the current working directory
//   tempDir: "./frames",
// }).then(function () {
//   console.log("Done!");
// });

// const puppeteer = require("puppeteer");
// const fs = require("fs");
// const { promisify } = require("util");
// const exec = promisify(require("child_process").exec);

// async function captureFrames(url, selector, fps, duration, output) {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto(url);

//   const frameCount = fps * duration;
//   const frames = [];

//   for (let i = 0; i < frameCount; i++) {
//     const elementHandle = await page.$(selector);
//     const screenshot = await elementHandle.screenshot();
//     frames.push(screenshot);
//     console.log("1000 / fps", 1000 / fps);
//     console.log("fps", fps);
//     await new Promise((resolve) => setTimeout(resolve, 1000 / fps)); // Introduce delay
//   }

//   await browser.close();

//   return frames;
// }

// async function createVideo(frames, fps, output) {
//   const frameDir = "./frames";

//   if (!fs.existsSync(frameDir)) {
//     fs.mkdirSync(frameDir);
//   }

//   frames.forEach((frame, index) => {
//     fs.writeFileSync(`${frameDir}/frame_${index}.png`, frame);
//   });

//   const { stdout, stderr } = await exec(
//     `ffmpeg -r ${fps} -i ${frameDir}/frame_%d.png -vcodec libx264 -pix_fmt yuv420p ${output}`
//   );
//   console.log("stdout", stdout);
//   console.log(stdout);
//   console.error(stderr);

//   // Clean up the frames directory
//   fs.rmdirSync(frameDir, { recursive: true });
// }

// const url =
//   "https://tungs.github.io/amuse/truchet-tiles/#autoplay=true&switchStyle=random";
// const selector = "#container";
// const fps = 20;
// const duration = 1;
// const output = "video.mp4";

// captureFrames(url, selector, fps, duration, output)
//   .then((frames) => createVideo(frames, fps, output))
//   .then(() => {
//     console.log("Done! ---------->");
//   })
//   .catch((error) => {
//     console.error(error);
//   });
