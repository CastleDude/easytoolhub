export interface ApiDef {
  key: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  description: string;
}

export const apiDefs: ApiDef[] = [
  {
    key: "frankfurter",
    name: "汇率接口 (Frankfurter)",
    method: "GET",
    url: "https://api.frankfurter.app/latest?from=USD",
    description: "获取实时汇率数据，源自欧洲央行参考汇率，每日更新。货币转换器使用。",
  },
  {
    key: "mymemory",
    name: "MyMemory 翻译接口",
    method: "GET",
    url: "https://api.mymemory.translated.net/get?q=hello&langpair=en-GB%7Czh-CN",
    description: "免费翻译 API，无需注册，每月 5000 字限额。用于博客文章自动多语言翻译。",
  },
  {
    key: "googleAnalytics",
    name: "谷歌分析 (Google Analytics)",
    method: "GET",
    url: "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX",
    description: "网站访问统计与用户行为分析（当前使用占位 ID，尚未配置真实 GA）。",
  },
];
