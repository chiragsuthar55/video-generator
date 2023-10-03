const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);
const fs = require("fs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,token"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.get("/video", async function (req, res) {
  try {
    const url = "https://bright-lokum-ef4278.netlify.app/";
    const selector = "html";
    const fps = 20;
    const duration = 2;
    const output = "video.mp4";

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const frameCount = fps * duration;
    const frames = [];

    for (let i = 0; i < frameCount; i++) {
      const elementHandle = await page.$(selector);
      const screenshot = await elementHandle.screenshot();
      frames.push(screenshot);
      await new Promise((resolve) => setTimeout(resolve, 1000 / fps));
    }

    await browser.close();

    const frameDir = "./frames";

    if (!fs.existsSync(frameDir)) {
      fs.mkdirSync(frameDir);
    }

    frames.forEach((frame, index) => {
      fs.writeFileSync(`${frameDir}/frame_${index}.png`, frame);
    });

    const { stdout, stderr } = await exec(
      `ffmpeg -r ${fps} -i ${frameDir}/frame_%d.png -vcodec libx264 -pix_fmt yuv420p ${output}`
    );

    console.log(stdout);
    console.error(stderr);

    // Clean up the frames directory
    fs.rmdirSync(frameDir, { recursive: true });

    const videoFilePath = "./video.mp4";

    console.log("videoFilePath", videoFilePath);
    res.download(videoFilePath, "video.mp4", (err) => {
      if (err) {
        console.error("Error sending video file:", err);
        res.status(500).json({
          error: "An error occurred while sending the video file",
        });
      }
    });
    delete videoFilePath;
  } catch (error) {
    console.error("Error", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
