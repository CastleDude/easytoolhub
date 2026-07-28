/**
 * Image Generator — Generate article cover images
 * Uses: Runware REST API (FLUX.1 Schnell) → sharp → WebP > SVG placeholder fallback
 */

const https = require("https");
const crypto = require("crypto");
const sharp = require("sharp");

function generateUUID() {
  return crypto.randomUUID();
}

function generateWithRunware(prompt) {
  const apiKey = process.env.RUNWARE_API_KEY;
  if (!apiKey) throw new Error("RUNWARE_API_KEY not set");

  const task = {
    taskType: "imageInference",
    taskUUID: generateUUID(),
    model: "runware:400@1",
    positivePrompt: prompt.substring(0, 1000),
    width: 1024,
    height: 1024,
    outputType: "URL",
    outputFormat: "PNG",
  };

  const body = JSON.stringify([task]);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "api.runware.ai",
      path: "/v1",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
    }, (res) => {
      let data = "";
      res.on("data", (d) => (data += d));
      res.on("end", () => {
        try {
          const results = JSON.parse(data);
          if (results.errors && results.errors.length > 0) {
            reject(new Error(results.errors[0].message || "Runware API error"));
            return;
          }
          const imageResult = results.data?.[0] || (Array.isArray(results) ? results[0] : results);
          if (imageResult.imageURL) {
            resolve(imageResult.imageURL);
          } else {
            reject(new Error("No imageURL in response: " + JSON.stringify(imageResult).substring(0, 200)));
          }
        } catch (e) {
          reject(new Error("Failed to parse Runware response: " + e.message));
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function downloadAndConvertToWebP(url, outputPath) {
  const fs = require("fs");
  const path = require("path");
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? require("https") : require("http");
    protocol.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadAndConvertToWebP(res.headers.location, outputPath).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const webp = await sharp(buffer)
            .webp({ quality: 80 })
            .toBuffer();
          fs.writeFileSync(outputPath, webp);
          resolve(outputPath);
        } catch (e) {
          reject(new Error("WebP conversion failed: " + e.message));
        }
      });
    }).on("error", reject);
  });
}

function generatePlaceholderSVG(title) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40) % 360;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(${hue1},60%,50%)"/>
      <stop offset="100%" style="stop-color:hsl(${hue2},60%,40%)"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <text x="512" y="480" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="48" font-family="system-ui,sans-serif" font-weight="bold">${escapeXml(title.substring(0, 60))}</text>
  <text x="512" y="540" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="28" font-family="system-ui,sans-serif">EasyToolHub</text>
</svg>`;
}

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function generateArticleImage(slug, title) {
  const fs = require("fs");
  const path = require("path");

  // Check both .webp and legacy .png
  const webpPath = path.join(process.cwd(), "public/images/blog", `${slug}.webp`);
  const pngPath = path.join(process.cwd(), "public/images/blog", `${slug}.png`);

  if (fs.existsSync(webpPath)) {
    console.log(`  [ImageGen] Image exists: ${slug}.webp`);
    return `/images/blog/${slug}.webp`;
  }
  if (fs.existsSync(pngPath)) {
    console.log(`  [ImageGen] Legacy PNG exists: ${slug}.png`);
    return `/images/blog/${slug}.png`;
  }

  const prompt = `Professional tech review cover image: ${title}. Modern clean design, tech aesthetic, product photography style.`;
  console.log(`  [ImageGen] Generating for: ${slug}`);

  try {
    const imageUrl = await generateWithRunware(prompt);
    await downloadAndConvertToWebP(imageUrl, webpPath);
    console.log(`  [ImageGen] Saved: ${slug}.webp`);
    return `/images/blog/${slug}.webp`;
  } catch (e) {
    console.error(`  [ImageGen] Runware failed for ${slug}:`, e.message);
    try {
      const svgContent = generatePlaceholderSVG(title);
      const svgPath = webpPath.replace(/\.webp$/, ".svg");
      fs.writeFileSync(svgPath, svgContent, "utf-8");
      console.log(`  [ImageGen] Fallback SVG saved: ${slug}.svg`);
      return `/images/blog/${slug}.svg`;
    } catch (svgErr) {
      console.error(`  [ImageGen] SVG fallback also failed:`, svgErr.message);
      return null;
    }
  }
}

module.exports = { generateArticleImage };
