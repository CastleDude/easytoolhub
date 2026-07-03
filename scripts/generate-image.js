/**
 * 图片生成工具 — 支持硅基流动 (默认, 免费/同步) + 阿里云百炼 (异步)
 *
 * 用法：
 *   node scripts/generate-image.js "一只可爱的橘猫" --output public/images/cat.png
 *   node scripts/generate-image.js "sunset" --provider bailian --size 1024*1024
 *
 * 免费模型 (硅基流动):
 *   Tongyi-MAI/Z-Image-Turbo (默认), Qwen/Qwen-Image, Kwai-Kolors/Kolors, baidu/ERNIE-Image-Turbo
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

// ========== SiliconFlow (同步, 免费) ==========
const SF_HOST = "api.siliconflow.cn";
const SF_PATH = "/v1/images/generations";
const SF_MODEL = "Qwen/Qwen-Image";

function sfApiKey() {
  return process.env.SILICONFLOW_API_KEY || "";
}

async function generateWithSiliconFlow(prompt, size = "1024x1024", n = 1, model = SF_MODEL) {
  const key = sfApiKey();
  if (!key) throw new Error("SILICONFLOW_API_KEY not set");

  console.log(`[生图:硅基] 模型: ${model} | "${prompt}"`);
  const body = JSON.stringify({ model, prompt, n, size });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: SF_HOST, path: SF_PATH, method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
    }, (res) => {
      let data = "";
      res.on("data", (d) => (data += d));
      res.on("end", () => {
        try {
          const j = JSON.parse(data);
          if (j.data?.length) {
            console.log(`[生图:硅基] 成功! ${j.data.length} 张`);
            resolve(j.data.map((d) => ({ url: d.url || d.b64_json })));
          } else {
            reject(new Error("硅基: " + (j.message || JSON.stringify(j).substring(0, 300))));
          }
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ========== Bailian (异步, 百炼) ==========
const BL_HOST = "dashscope.aliyuncs.com";
const BL_SUBMIT = "/api/v1/services/aigc/text2image/image-synthesis";
const BL_POLL = "/api/v1/tasks";
const BL_MODEL = "wanx-v1";

function blApiKey() {
  return process.env.DASHSCOPE_API_KEY || "";
}

function blRequest(method, reqPath, headers, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(
      { hostname: BL_HOST, path: reqPath, method, headers },
      (res) => {
        let data = "";
        res.on("data", (d) => (data += d));
        res.on("end", () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, raw: data }); }
        });
      }
    );
    r.on("error", reject);
    if (body) r.write(body);
    r.end();
  });
}

async function generateWithBailian(prompt, size = "1024*1024", n = 1) {
  const key = blApiKey();
  if (!key) throw new Error("DASHSCOPE_API_KEY not set");

  console.log(`[生图:百炼] 提交任务: "${prompt}"`);
  const submit = await blRequest("POST", BL_SUBMIT, {
    "Content-Type": "application/json",
    Authorization: "Bearer " + key,
    "X-DashScope-Async": "enable",
  }, JSON.stringify({ model: BL_MODEL, input: { prompt }, parameters: { size, n } }));

  if (submit.status !== 200 || !submit.body?.output?.task_id) {
    throw new Error("百炼提交失败: " + JSON.stringify(submit.body).substring(0, 300));
  }
  const taskId = submit.body.output.task_id;
  console.log(`[生图:百炼] 任务ID: ${taskId}`);

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const poll = await blRequest("GET", `${BL_POLL}/${taskId}`, {
      Authorization: "Bearer " + key,
    });
    const status = poll.body?.output?.task_status;
    if (status === "SUCCEEDED") {
      const results = poll.body.output.results || [];
      console.log(`[生图:百炼] 成功! ${results.length} 张`);
      return results;
    } else if (status === "FAILED") {
      throw new Error("百炼失败: " + (poll.body?.output?.message || "unknown"));
    }
    if (i % 5 === 0) console.log(`[生图:百炼] 等待中... (${status})`);
  }
  throw new Error("百炼超时");
}

// ========== Common ==========
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const protocol = url.startsWith("https") ? require("https") : require("http");
    protocol.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, filePath).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(filePath);
      res.pipe(file);
      file.on("finish", () => { file.close(); console.log(`[生图] 已保存: ${filePath}`); resolve(filePath); });
    }).on("error", reject);
  });
}

// ========== CLI ==========
async function main() {
  const args = process.argv.slice(2);
  let prompt = "";
  let size = "1024x1024";
  let output = "";
  let provider = "siliconflow";
  let model = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--size" && args[i + 1]) { size = args[++i]; }
    else if (args[i] === "--output" && args[i + 1]) { output = args[++i]; }
    else if (args[i] === "--provider" && args[i + 1]) { provider = args[++i]; }
    else if (args[i] === "--model" && args[i + 1]) { model = args[++i]; }
    else if (!prompt) { prompt = args[i]; }
  }

  if (!prompt) {
    console.log("用法: node scripts/generate-image.js <提示词> [--provider siliconflow|bailian] [--size 1024x1024] [--output path.png]");
    console.log("硅基免费模型: Qwen/Qwen-Image(默认), Tongyi-MAI/Z-Image-Turbo, Kwai-Kolors/Kolors, baidu/ERNIE-Image-Turbo");
    process.exit(1);
  }

  try {
    const results = provider === "bailian"
      ? await generateWithBailian(prompt, size)
      : await generateWithSiliconFlow(prompt, size, 1, model || SF_MODEL);

    for (let i = 0; i < results.length; i++) {
      const url = results[i].url;
      console.log(`[生图] 图片 ${i + 1}: ${url}`);
      if (output) {
        const outPath = results.length > 1 ? output.replace(/\.(\w+)$/, `_$i.$1`) : output;
        await downloadFile(url, outPath);
      }
    }
  } catch (e) {
    console.error("[生图] 错误:", e.message);
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = { generateWithSiliconFlow, generateWithBailian, downloadFile, SF_MODEL, BL_MODEL };
