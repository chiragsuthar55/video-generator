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

    const browser = await puppeteer.launch({
      headless: true, // Run in headless mode (no GUI)
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Required for running in some sandboxed environments
    });
    // const browser = await puppeteer.launch();
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

// const express = require("express");
// const app = express();
// const bodyParser = require("body-parser");
// const puppeteer = require("puppeteer-core");
// // const puppeteer = require("puppeteer");
// const { promisify } = require("util");
// const exec = promisify(require("child_process").exec);
// const fs = require("fs");

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// );
// app.use(bodyParser.json());

// app.use(function (req, res, next) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "X-Requested-With,content-type,token"
//   );
//   res.setHeader("Access-Control-Allow-Credentials", true);
//   next();
// });

// // app.get("/video", async function (req, res) {
// //   try {
// //     const url = "https://bright-lokum-ef4278.netlify.app/";
// //     const selector = "html";
// //     const fps = 15;
// //     const duration = 1;
// //     const output = "./temp/video.mp4"; // Save the video to a temporary directory

// //     const browser = await puppeteer.launch({
// //       headless: true,
// //       args: ["--no-sandbox", "--disable-setuid-sandbox"],
// //     });
// //     const page = await browser.newPage();
// //     await page.goto(url);

// //     const frameCount = fps * duration;
// //     const frames = [];

// //     for (let i = 0; i < frameCount; i++) {
// //       const elementHandle = await page.$(selector);
// //       const screenshot = await elementHandle.screenshot();
// //       frames.push(screenshot);
// //       await new Promise((resolve) => setTimeout(resolve, 1000 / fps));
// //     }

// //     await browser.close();

// //     const frameDir = "./frames"; // Temporary frames directory

// //     if (!fs.existsSync(frameDir)) {
// //       fs.mkdirSync(frameDir, { recursive: true });
// //     }

// //     frames.forEach((frame, index) => {
// //       console.log("index", index);
// //       fs.writeFileSync(`${frameDir}/frame_${index}.png`, frame);
// //     });

// //     const { stdout, stderr } = await exec(
// //       `ffmpeg -r ${fps} -i ${frameDir}/frame_%d.png -vcodec libx264 -pix_fmt yuv420p ${output}`
// //     );

// //     console.log(stdout);
// //     console.error(stderr);

// //     // Clean up the temporary frames directory
// //     fs.rmdirSync(frameDir, { recursive: true });

// //     // Send the video as a download
// //     res.download(output, "video.mp4", (err) => {
// //       if (err) {
// //         console.error("Error sending video file:", err);
// //         res.status(500).json({
// //           error: "An error occurred while sending the video file",
// //         });
// //       } else {
// //         // Delete the video file after it's sent
// //         fs.unlinkSync(output);
// //       }
// //     });
// //   } catch (error) {
// //     console.error("Error", error);
// //     res.status(500).json({ error: "An error occurred" });
// //   }
// // });

// app.get("/api", async (req, res) => {
//   let options = { ignoreHTTPSErrors: true, headless: true };

//   // if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
//   //   options = {
//   //     args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
//   //     defaultViewport: chrome.defaultViewport,
//   //     executablePath: await chrome.executablePath,
//   //     headless: true,
//   //     ignoreHTTPSErrors: true,
//   //   };
//   // }

//   try {
//     let browser = await puppeteer.launch(options);

//     let page = await browser?.newPage();
//     await page.goto("https://www.google.com");
//     res.send(await page.title());
//   } catch (err) {
//     console.error(err);
//     return null;
//   }
// });

// // app.get("/videoo", async function (req, res) {
// //   try {
// //     const url = "https://bright-lokum-ef4278.netlify.app/";
// //     const selector = "html";
// //     const fps = 15;
// //     const duration = 1;
// //     const output = "./temp/video.mp4"; // Save the video to a temporary directory

// //     const browser = await puppeteer.launch({
// //       headless: "new",
// //       args: ["--no-sandbox", "--disable-setuid-sandbox"],
// //     });
// //     const page = await browser.newPage();
// //     await page.goto(url);

// //     const frameCount = fps * duration;
// //     const frames = [];

// //     for (let i = 0; i < frameCount; i++) {
// //       console.log("i", i);
// //       const elementHandle = await page.$(selector);
// //       const screenshot = await elementHandle.screenshot();
// //       frames.push(screenshot);
// //       await new Promise((resolve) => setTimeout(resolve, 1000 / fps));
// //     }

// //     await browser.close();

// //     const frameDir = "./frames"; // Temporary frames directory

// //     if (!fs.existsSync(frameDir)) {
// //       fs.mkdirSync(frameDir, { recursive: true });
// //     }

// //     frames.forEach((frame, index) => {
// //       fs.writeFileSync(`${frameDir}/frame_${index}.png`, frame);
// //     });

// //     const { stdout, stderr } = await exec(
// //       `ffmpeg -r ${fps} -i ${frameDir}/frame_%d.png -vcodec libx264 -pix_fmt yuv420p ${output}`
// //     );

// //     console.log(stdout);
// //     console.error(stderr);

// //     // Clean up the temporary frames directory
// //     fs.rmdirSync(frameDir, { recursive: true });

// //     // Send the video as a download
// //     res.download(output, "video.mp4", (err) => {
// //       if (err) {
// //         console.error("Error sending video file:", err);
// //         res.status(500).json({
// //           error: "An error occurred while sending the video file",
// //           message: err.message, // Include the error message for debugging
// //         });
// //       } else {
// //         // Delete the video file after it's sent
// //         fs.unlinkSync(output);
// //       }
// //     });
// //   } catch (error) {
// //     console.error("Error", error);
// //     res.status(500).json({
// //       error: "An error occurred",
// //       message: error.message, // Include the error message for debugging
// //     });
// //   }
// // });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log("Listening on port " + PORT);
// });
