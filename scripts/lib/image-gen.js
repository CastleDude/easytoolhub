/**
 * Image Generator — Generate article cover images
 * Uses: Runware MCP > Bailian API fallback
 */

const https = require("https");

function generateWithBailian(prompt) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error("DASHSCOPE_API_KEY not set");

  const body = JSON.stringify({
    model: "wanx-v1",
    input: { prompt: prompt.substring(0, 200) },
    parameters: { size: "1024*1024" },
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "dashscope.aliyuncs.com",
      path: "/api/v1/services/aigc/text2image/image-synthesis",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
        "X-DashScope-Async": "enable",
      },
    }, (res) => {
      let data = "";
      res.on("data", (d) => (data += d));
      res.on("end", () => {
        const j = JSON.parse(data);
        if (j.output?.task_id) {
          pollTask(j.output.task_id, apiKey).then(resolve).catch(reject);
        } else {
          reject(new Error("No task_id: " + JSON.stringify(j).substring(0, 200)));
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function pollTask(taskId, apiKey) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      https.get({
        hostname: "dashscope.aliyuncs.com",
        path: `/api/v1/tasks/${taskId}`,
        headers: { Authorization: "Bearer " + apiKey },
      }, (res) => {
        let data = "";
        res.on("data", (d) => (data += d));
        res.on("end", () => {
          const j = JSON.parse(data);
          if (j.output?.task_status === "SUCCEEDED") {
            clearInterval(interval);
            resolve(j.output.results.map((r) => r.url));
          } else if (j.output?.task_status === "FAILED" || attempts > 30) {
            clearInterval(interval);
            reject(new Error("Image generation failed or timeout"));
          }
        });
      }).on("error", () => {});
    }, 2000);
  });
}

function downloadImage(url, filePath) {
  const fs = require("fs");
  const path = require("path");
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? require("https") : require("http");
    protocol.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, filePath).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(filePath);
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(filePath); });
    }).on("error", reject);
  });
}

async function generateArticleImage(slug, title) {
  const fs = require("fs");
  const path = require("path");
  const outputPath = path.join(process.cwd(), "public/images/blog", `${slug}.png`);

  // Skip if image already exists
  if (fs.existsSync(outputPath)) {
    console.log(`  [ImageGen] Image exists: ${slug}.png`);
    return `/images/blog/${slug}.png`;
  }

  const prompt = `Professional tech review cover image: ${title}. Modern clean design, tech aesthetic, product photography style.`;
  console.log(`  [ImageGen] Generating for: ${slug}`);

  try {
    const urls = await generateWithBailian(prompt);
    await downloadImage(urls[0], outputPath);
    console.log(`  [ImageGen] Saved: ${slug}.png`);
    return `/images/blog/${slug}.png`;
  } catch (e) {
    console.error(`  [ImageGen] Failed for ${slug}:`, e.message);
    // Return a placeholder or null
    return null;
  }
}

module.exports = { generateArticleImage };
