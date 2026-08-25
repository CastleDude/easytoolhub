/**
 * Image Generator — Generate article cover images
 * Uses: Runware REST API (FLUX.1 Schnell) → sharp → WebP (1024×576, 16:9 ratio = 252:142) > SVG placeholder fallback
 *
 * Output rules:
 * - Size: 1024×576 (16:9 — same ratio as 252×142), width 1024
 * - No text / watermark / letters
 * - Flat single-layer composition (no object-on-photo, no shadow/layered effect)
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
    height: 576, // 16:9
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
          // 16:9, width 1024 (same ratio as 252×142) → WebP
          const webp = await sharp(buffer)
            .resize(1024, 576, { fit: "cover" })
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

function generatePlaceholderSVG() {
  let hash = 0;
  const seed = "EasyToolHub";
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40) % 360;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="576" viewBox="0 0 1024 576">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(${hue1},60%,50%)"/>
      <stop offset="100%" style="stop-color:hsl(${hue2},60%,40%)"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="576" fill="url(#bg)"/>
</svg>`;
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

  // Flat single-layer, no text, 16:9
  const prompt = `Minimal flat tech product illustration for ${title}. One single object centered on a solid plain background, clean flat vector style, 16:9 landscape. No text, no watermark, no letters, no caption, no logo. No shadow, no reflection, no layered composition, no object-on-photo-background effect.`;
  console.log(`  [ImageGen] Generating for: ${slug}`);

  try {
    const imageUrl = await generateWithRunware(prompt);
    await downloadAndConvertToWebP(imageUrl, webpPath);
    console.log(`  [ImageGen] Saved: ${slug}.webp`);
    return `/images/blog/${slug}.webp`;
  } catch (e) {
    console.error(`  [ImageGen] Runware failed for ${slug}:`, e.message);
    try {
      const svgContent = generatePlaceholderSVG();
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
