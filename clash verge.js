// ============================================================================
// 适用版本: Clash Verge Rev / ClashMi / Mihomo 内核
// 配置文件: 终极融合版 v13.6-Final (完美闭环定型版 - 满血注释版)
// 核心亮点: GEO二进制极速解析 / 防DNS泄漏 / WebRTC严格阻断 / 智能按需装载规则集
// ============================================================================

// 🎛️ [特性开关] - 业务规则按需启用 (true为启用，false为禁用，节省内存)
var ruleOptions = {
  finance: true,   // 开启 金融服务 分流
  crypto: true,    // 开启 加密货币/交易所 分流
  ai: true,        // 开启 AI服务 (ChatGPT/Gemini/Claude等) 分流
  youtube: true,   // 开启 YouTube 视频专属分流
  google: true,    // 开启 Google 服务分流
  github: true,    // 开启 Github 专属分流
  microsoft: true, // 开启 微软服务 分流 (含 OneDrive/Bing)
  apple: true,     // 开启 苹果服务 分流
  telegram: true,  // 开启 Telegram IP与域名 严格分流
  twitter: true,   // 开启 推特/X 专属分流
  netflix: true    // 开启 Netflix 流媒体分流
};

// 🎨 [图标库引擎] - 为策略组自动赋予高颜值图标
var flagBase = "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/";
var qureBase = "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/";

var iconMap = {
  "🚀 节点选择": qureBase + "Proxy.png",
  "⚡ 自动选择": qureBase + "Auto.png",
  "⚖️ 负载均衡": qureBase + "Round_Robin.png",
  "🔯 故障转移": qureBase + "Available.png",
  "🖐️ 手动切换": qureBase + "Static.png",
  "🏠 私有网络": qureBase + "Direct.png",
  "🐟 漏网之鱼": qureBase + "Final.png",
  "🌍 其他节点": qureBase + "Global.png",
  "💬 AI 服务": qureBase + "ChatGPT.png",
  "📹 油管视频": qureBase + "YouTube.png",
  "🔍 谷歌服务": qureBase + "Google.png",
  "🐱 Github": qureBase + "GitHub.png",
  "Ⓜ️ 微软服务": qureBase + "Microsoft.png",
  "🍏 苹果服务": qureBase + "Apple.png",
  "📲 电报消息": qureBase + "Telegram.png",
  "🌐 社交媒体": qureBase + "Twitter.png",
  "🎬 流媒体": qureBase + "Netflix.png",
  "🤝 交易所": qureBase + "Cryptocurrency.png",
  "💰 金融服务": qureBase + "PayPal.png",
  "🇺🇸 美国节点": flagBase + "us.svg",
  "🇨🇭 瑞士节点": flagBase + "ch.svg",
  "🇭🇰 香港节点": flagBase + "hk.svg",
  "🇯🇵 日本节点": flagBase + "jp.svg",
  "🇹🇼 台湾节点": flagBase + "tw.svg",
  "🇸🇬 新加坡节点": flagBase + "sg.svg",
  "🇰🇷 韩国节点": flagBase + "kr.svg",
  "🇬🇧 英国节点": flagBase + "gb.svg",
  "🇩🇪 德国节点": flagBase + "de.svg",
  "🇫🇷 法国节点": flagBase + "fr.svg",
  "🇲🇾 马来节点": flagBase + "my.svg",
  "🇹🇷 土耳其节点": flagBase + "tr.svg",
  "🇨🇦 加拿大节点": flagBase + "ca.svg",
  "🇦🇺 澳洲节点": flagBase + "au.svg",
  "🇳🇱 荷兰节点": flagBase + "nl.svg",
  "🇮🇳 印度节点": flagBase + "in.svg",
  "🇷🇺 俄罗斯节点": flagBase + "ru.svg",
  "🇦🇷 阿根廷节点": flagBase + "ar.svg",
  "🇵🇱 波兰节点": flagBase + "pl.svg",
  "🇮🇹 意大利节点": flagBase + "it.svg"
};

// 辅助函数: 获取图标
function getIcon(name) { return iconMap[name] || null; }
// 辅助函数: 为策略组对象注入图标
function withIcon(groupObj) {
  var icon = getIcon(groupObj.name);
  if (icon) groupObj["icon"] = icon;
  return groupObj;
}

// 🌍 [地区节点过滤器] - 精准正则匹配机场节点名称，自动分类归档
var regionFilters = [
  { name: "🇺🇸 美国节点", regex: "美|\\bus\\b|united.?states|america", filterRegex: "(?i)(?:美国|united.?states|america|(?:^|[^a-zA-Z])us(?:[^a-zA-Z]|$))" },
  { name: "🇨🇭 瑞士节点", regex: "瑞士|\\bch\\b|\\brs\\b|switzerland", filterRegex: "(?i)(?:瑞士|switzerland|(?:^|[^a-zA-Z])ch(?:[^a-zA-Z]|$)|(?:^|[^a-zA-Z])rs(?:[^a-zA-Z]|$))" },
  { name: "🇭🇰 香港节点", regex: "港|\\bhk\\b|hongkong|hong.?kong", filterRegex: "(?i)(?:港|hongkong|hong.?kong|(?:^|[^a-zA-Z])hk(?:[^a-zA-Z]|$))" },
  { name: "🇯🇵 日本节点", regex: "日|\\bjp\\b|japan", filterRegex: "(?i)(?:日本|japan|(?:^|[^a-zA-Z])jp(?:[^a-zA-Z]|$))" },
  { name: "🇹🇼 台湾节点", regex: "台|\\btw\\b|taiwan", filterRegex: "(?i)(?:台湾|taiwan|(?:^|[^a-zA-Z])tw(?:[^a-zA-Z]|$))" },
  { name: "🇸🇬 新加坡节点", regex: "新|\\bsg\\b|singapore", filterRegex: "(?i)(?:新加坡|singapore|(?:^|[^a-zA-Z])sg(?:[^a-zA-Z]|$))" },
  { name: "🇰🇷 韩国节点", regex: "韩|\\bkr\\b|korea", filterRegex: "(?i)(?:韩国|korea|(?:^|[^a-zA-Z])kr(?:[^a-zA-Z]|$))" },
  { name: "🇬🇧 英国节点", regex: "英|\\buk\\b|\\bgb\\b|united.?kingdom|britain", filterRegex: "(?i)(?:英国|united.?kingdom|britain|(?:^|[^a-zA-Z])uk(?:[^a-zA-Z]|$)|(?:^|[^a-zA-Z])gb(?:[^a-zA-Z]|$))" },
  { name: "🇩🇪 德国节点", regex: "德|\\bde\\b|germany", filterRegex: "(?i)(?:德国|germany|(?:^|[^a-zA-Z])de(?:[^a-zA-Z]|$))" },
  { name: "🇫🇷 法国节点", regex: "法|\\bfr\\b|france", filterRegex: "(?i)(?:法国|france|(?:^|[^a-zA-Z])fr(?:[^a-zA-Z]|$))" },
  { name: "🇲🇾 马来节点", regex: "马来|\\bmy\\b|malaysia", filterRegex: "(?i)(?:马来|malaysia|(?:^|[^a-zA-Z])my(?:[^a-zA-Z]|$))" },
  { name: "🇹🇷 土耳其节点", regex: "土耳其|\\btr\\b|turkey|turkiye", filterRegex: "(?i)(?:土耳其|turkey|turkiye|(?:^|[^a-zA-Z])tr(?:[^a-zA-Z]|$))" },
  { name: "🇨🇦 加拿大节点", regex: "加拿大|canada|\\bca[-]|[-]ca\\b", filterRegex: "(?i)(?:加拿大|canada|(?:^|[^a-zA-Z])ca[-]|[-]ca(?:[^a-zA-Z]|$))" },
  { name: "🇦🇺 澳洲节点", regex: "澳|\\bau\\b|australia", filterRegex: "(?i)(?:澳大利亚|australia|(?:^|[^a-zA-Z])au(?:[^a-zA-Z]|$))" },
  { name: "🇳🇱 荷兰节点", regex: "荷兰|\\bnl\\b|netherlands", filterRegex: "(?i)(?:荷兰|netherlands|(?:^|[^a-zA-Z])nl(?:[^a-zA-Z]|$))" },
  { name: "🇮🇳 印度节点", regex: "印度|india|\\bindian\\b", filterRegex: "(?i)(?:印度|india|indian)" },
  { name: "🇷🇺 俄罗斯节点", regex: "俄|\\bru\\b|russia", filterRegex: "(?i)(?:俄罗斯|russia|(?:^|[^a-zA-Z])ru(?:[^a-zA-Z]|$))" },
  { name: "🇦🇷 阿根廷节点", regex: "阿根廷|\\bar\\b|argentina", filterRegex: "(?i)(?:阿根廷|argentina|(?:^|[^a-zA-Z])ar(?:[^a-zA-Z]|$))" },
  { name: "🇵🇱 波兰节点", regex: "波兰|\\bpl\\b|poland", filterRegex: "(?i)(?:波兰|poland|(?:^|[^a-zA-Z])pl(?:[^a-zA-Z]|$))" },
  { name: "🇮🇹 意大利节点", regex: "意大利|\\bit\\b|italy", filterRegex: "(?i)(?:意大利|italy|(?:^|[^a-zA-Z])it(?:[^a-zA-Z]|$))" }
];

// 高连通性探活地址
var HEALTH_CHECK_URL = "https://www.gstatic.com/generate_204";

// ============================================================================
// 🚀 [主干配置注入] - Config Generator
// ============================================================================
function main(config) {

  // 📌 [1] 全局核心设置 (Global Config)
  config["ipv6"] = true;                  // 开启 IPv6 支持，顺应现代网络架构
  config["tcp-concurrent"] = true;        // 开启 TCP 并发，大幅提升连接建立速度
  config["unified-delay"] = true;         // 统一延迟计算，确保探活数据准确性
  config["find-process-mode"] = "always"; // 始终寻找进程名，便于基于进程的精确路由
  config["experimental"] = config["experimental"] || {};
  config["experimental"]["udp-fallback-match"] = false; // 配合拦截规则，阻断不支持 UDP 的节点并触发 TCP 优雅降级
  config["profile"] = {
    "store-selected": true,               // 持久化保存用户的节点选择状态
    "store-fake-ip": true                 // 缓存 Fake-IP 映射，防止应用频繁断连
  };

  // 📡 [2] 域名嗅探 (Sniffer) - 解决 IP直连导致的路由黑洞
  config["sniffer"] = {
    "enable": true,
    "force-dns-mapping": true,
    "parse-pure-ip": true,
    "override-destination": true,
    "sniff": {
      "HTTP": { "ports": [80, 8080, 8880] },
      "TLS": { "ports": [443, 8443] },
      "QUIC": { "ports": [443, 8443] } // 嗅探 QUIC 流量，防止 YouTube 等流媒体走 UDP 直连
    },
    "skip-domain": [ // 以下域名跳过嗅探，避免因修改目的地址导致设备掉线或验证失败
      "Mijia Cloud",
      "+.oray.com",
      "captive.apple.com",
      "+.push.apple.com"
    ]
  };

  // 🖧 [3] TUN 虚拟网卡设置 (TUN Mode)
  config["tun"] = {
    "enable": true,
    "stack": "mixed",               // mixed 栈提供最佳兼容性与性能
    "auto-route": true,
    "auto-detect-interface": true,
    "strict-route": true,           // 开启严格路由，防止流量绕过内核
    "endpoint-independent-nat": false,
    "dns-hijack": ["any:53", "tcp://any:53"], // 劫持所有发往 53 端口的 DNS 查询交由内核处理
    "route-exclude-address": [      // [核心优化] 排除常见局域网网段，防止局域网设备互访受阻
      "192.168.0.0/16", "10.0.0.0/8", "172.16.0.0/12", "127.0.0.0/8",
      "169.254.0.0/16", "224.0.0.0/4", "255.255.255.255/32", "100.64.0.0/10",
      "239.255.255.250/32", "fc00::/7", "fe80::/10", "ff00::/8", "::ffff:0:0/96", "::1/128"
    ]
  };

  // 🗺️ [4] GEO 数据库配置 (GEO Data)
  config["geodata-mode"] = true;
  config["geo-auto-update"] = true;
  config["geodata-loader"] = "memconservative"; // 内存保守模式，降低内核占用
  config["geo-update-interval"] = 24;
  // [核心修复] 严格使用官方 Release 编译产物，彻底解决 raw 文件缓存不同步及 GitHub API 频控死锁问题
  config["geox-url"] = {
    "geoip": "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip.dat",
    "geosite": "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat",
    "mmdb": "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/country.mmdb",
    "asn": "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/GeoLite2-ASN.mmdb"
  };

  // 🛡️ [5] DNS 终极防泄漏引擎 (DNS Settings)
  config.dns = {
    "enable": true,
    "ipv6": true,
    "prefer-h3": false,
    "cache-algorithm": "arc", // 使用高效 ARC 缓存淘汰算法
    "enhanced-mode": "fake-ip", // Fake-IP 模式，实现真正的 DNS 无感知秒解析
    "fake-ip-range": "198.18.0.1/16",
    "respect-rules": false,
    "default-nameserver": [ // bootstrap DNS，仅用于解析以下加密 DNS 自身的域名
      "223.5.5.5", "119.29.29.29", "tcp://223.5.5.5", "tcp://119.29.29.29"
    ],
    "nameserver": [         // 国内防污染公共 DNS
      "https://doh.pub/dns-query",
      "https://dns.alidns.com/dns-query"
    ],
    "proxy-server-nameserver": [ // 专门用于解析节点域名的底层 DNS
      "223.5.5.5", "119.29.29.29", "tcp://223.5.5.5", "tcp://119.29.29.29"
    ],
    "nameserver-policy": {
      // 核心修复：分离并单独声明 geosite:cn 等常见直连标签，确保精准分流，绝不污染外网解析
      "geosite:cn": ["223.5.5.5", "119.29.29.29", "tcp://223.5.5.5"],
      "geosite:private": ["223.5.5.5", "119.29.29.29", "tcp://223.5.5.5"],
      "+.push.apple.com": ["223.5.5.5", "119.29.29.29"],
      "+.microsoft.com": ["223.5.5.5", "119.29.29.29"],
      "+.windows.com": ["223.5.5.5", "119.29.29.29"]
    },
    // [核心优化] 泛域名格式统一规范化（使用 +.xxx），过滤内网、支付、时间同步服务，防止其获取到虚假 IP
    "fake-ip-filter": [
      "+.weixin.com", "+.wx.qq.com", "+.servicewechat.com", "+.alipay.com",
      "+.alipayobjects.com", "+.unionpay.com", "+.tenpay.com", "+.wechatpay.com",
      "+.qlogo.cn", "+.qpic.cn", "localhost", "+.local", "+.lan",
      "+.localdomain",
      "time.apple.com", "time1.apple.com", "time2.apple.com",
      "time3.apple.com", "time4.apple.com", "time5.apple.com", "time6.apple.com",
      "time7.apple.com", "time-ios.apple.com", "time.cloudflare.com",
      "time.windows.com", "0.pool.ntp.org", "1.pool.ntp.org", "2.pool.ntp.org",
      "3.pool.ntp.org", "0.cn.pool.ntp.org", "1.cn.pool.ntp.org", "2.cn.pool.ntp.org",
      "3.cn.pool.ntp.org", "+.ntp.org.cn", "+.time.edu.cn", "time1.cloud.tencent.com",
      "time2.cloud.tencent.com", "time3.cloud.tencent.com", "time4.cloud.tencent.com",
      "time5.cloud.tencent.com", "ntp.aliyun.com", "ntp1.aliyun.com",
      "ntp2.aliyun.com", "ntp3.aliyun.com", "ntp4.aliyun.com", "ntp5.aliyun.com",
      "ntp6.aliyun.com", "ntp7.aliyun.com", "+.msftncsi.com", "+.msftconnecttest.com",
      "captive.apple.com", "+.battlenet.com.cn", "+.blzstatic.cn", "+.battle.net",
      "+.xboxlive.com", "+.playfabapi.com", "+.playstation.net", "+.playstation.com",
      "+.nintendo.net", "+.mcdn.bilivideo.cn", "+.bilibili.com", "+.bilicdn.com",
      "+.bilivideo.com", "+.market.xiaomi.com", "+.services.googleapis.cn"
    ]
  };

  // 📦 [6] 规则集自动更新 (Rule Providers) 
  // 核心优化: 彻底移除未在路由中使用的冗余 private-ip 规则集，降低系统常驻内存消耗
  var proxyUrlPrefix = "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo";
  var providers = {
    "httpdns-reject": {
      "type": "http", "format": "yaml", "behavior": "classical",
      "url": "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/BlockHttpDNS/BlockHttpDNS.yaml",
      "path": "./ruleset/httpdns_reject.yaml", "interval": 86400
    },
    "category-ads-all": {
      "type": "http", "format": "yaml", "behavior": "domain",
      "url": proxyUrlPrefix + "/geosite/category-ads-all.yaml",
      "path": "./ruleset/category-ads-all.yaml", "interval": 86400
    }
  };

  // 依据顶部开关动态装载所需规则集，避免全量下载拖慢启动速度
  if (ruleOptions.ai) providers["category-ai-!cn"] = { "type": "http", "format": "yaml", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/category-ai-!cn.yaml", "path": "./ruleset/category-ai-!cn.yaml", "interval": 86400 };
  if (ruleOptions.youtube) providers["youtube"] = { "type": "http", "format": "yaml", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/youtube.yaml", "path": "./ruleset/youtube.yaml", "interval": 86400 };
  if (ruleOptions.google) providers["google"] = { "type": "http", "format": "yaml", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/google.yaml", "path": "./ruleset/google.yaml", "interval": 86400 };
  if (ruleOptions.github) providers["github"] = { "type": "http", "format": "yaml", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/github.yaml", "path": "./ruleset/github.yaml", "interval": 86400 };
  if (ruleOptions.microsoft) providers["microsoft"] = { "type": "http", "format": "yaml", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/microsoft.yaml", "path": "./ruleset/microsoft.yaml", "interval": 86400 };
  if (ruleOptions.apple) providers["apple"] = { "type": "http", "format": "yaml", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/apple.yaml", "path": "./ruleset/apple.yaml", "interval": 86400 };
  if (ruleOptions.twitter) providers["twitter"] = { "type": "http", "format": "yaml", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/twitter.yaml", "path": "./ruleset/twitter.yaml", "interval": 86400 };
  if (ruleOptions.netflix) providers["netflix"] = { "type": "http", "format": "yaml", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/netflix.yaml", "path": "./ruleset/netflix.yaml", "interval": 86400 };
  if (ruleOptions.telegram) providers["telegram-ip"] = { "type": "http", "format": "yaml", "behavior": "ipcidr", "url": proxyUrlPrefix + "/geoip/telegram.yaml", "path": "./ruleset/telegram-ip.yaml", "interval": 86400 };
  if (ruleOptions.crypto) {
    providers["okx"] = { "type": "http", "format": "yaml", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/okx.yaml", "path": "./ruleset/okx.yaml", "interval": 86400 };
    providers["binance"] = { "type": "http", "format": "yaml", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/binance.yaml", "path": "./ruleset/binance.yaml", "interval": 86400 };
    providers["kraken"] = { "type": "http", "format": "yaml", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/kraken.yaml", "path": "./ruleset/kraken.yaml", "interval": 86400 };
  }
  config["rule-providers"] = providers;

  // 🗂️ [7] 策略组矩阵 (Proxy Groups)
  config.proxies = config.proxies || [];
  // 注入兜底节点，防止用户导入全空订阅导致整个应用崩溃
  config.proxies.push({
    "name": "⛔ 节点全离线或为空",
    "type": "socks5",
    "server": "127.0.0.1",
    "port": 65535,
    "udp": false
  });

  var regionNames = [];
  for (var n = 0; n < regionFilters.length; n++) { regionNames.push(regionFilters[n].name); }

  var commonProxies = ["🚀 节点选择", "⚡ 自动选择", "⚖️ 负载均衡", "🔯 故障转移", "🖐️ 手动切换", "DIRECT"];

  // 初始化基础功能性策略组
  config["proxy-groups"] = [
    withIcon({ "name": "🚀 节点选择", "type": "select", "proxies": ["⚡ 自动选择", "⚖️ 负载均衡", "🔯 故障转移", "🖐️ 手动切换", "DIRECT", "REJECT"] }),
    withIcon({ "name": "⚡ 自动选择", "type": "select", "proxies": regionNames.concat(["DIRECT"]) }),
    withIcon({
      "name": "⚖️ 负载均衡",
      "type": "load-balance",
      "include-all": true,
      "exclude-type": "direct|reject",
      "exclude-filter": "⛔ 节点全离线或为空",
      "strategy": "consistent-hashing", // 采用一致性哈希，确保同一域名的连接落在同一节点
      "url": HEALTH_CHECK_URL,
      "interval": 300, "timeout": 3000, "lazy": true
    }),
    withIcon({
      "name": "🔯 故障转移",
      "type": "fallback",
      "include-all": true,
      "exclude-type": "direct|reject",
      "exclude-filter": "⛔ 节点全离线或为空",
      "url": HEALTH_CHECK_URL,
      "interval": 300, "timeout": 3000, "lazy": true, "max-failed-times": 3 // 连续3次失败自动切换备用
    }),
    withIcon({ "name": "🖐️ 手动切换", "type": "select", "include-all": true }),
    withIcon({ "name": "🏠 私有网络", "type": "select", "proxies": ["DIRECT", "🚀 节点选择", "⚡ 自动选择", "🖐️ 手动切换"] })
  ];

  // 动态构建各国家/地区自动测速策略组
  for (var rIndex = 0; rIndex < regionFilters.length; rIndex++) {
    var region = regionFilters[rIndex];
    config["proxy-groups"].push(withIcon({
      "name": region.name,
      "type": "url-test",
      "include-all": true,
      "filter": region.filterRegex,
      "proxies": ["⛔ 节点全离线或为空"],
      "url": HEALTH_CHECK_URL,
      "interval": 300, "timeout": 3000, "lazy": true, "max-failed-times": 3,
      "expected-status": 204, "tolerance": 50 // 容差值50ms内不频繁切换，防止连接闪断
    }));
  }

  // 动态构建业务分类策略组
  var activeBusinessGroups = [];
  if (ruleOptions.ai) activeBusinessGroups.push("💬 AI 服务");
  if (ruleOptions.youtube) activeBusinessGroups.push("📹 油管视频");
  if (ruleOptions.google) activeBusinessGroups.push("🔍 谷歌服务");
  if (ruleOptions.telegram) activeBusinessGroups.push("📲 电报消息");
  if (ruleOptions.github) activeBusinessGroups.push("🐱 Github");
  if (ruleOptions.microsoft) activeBusinessGroups.push("Ⓜ️ 微软服务");
  if (ruleOptions.apple) activeBusinessGroups.push("🍏 苹果服务");
  if (ruleOptions.twitter) activeBusinessGroups.push("🌐 社交媒体");
  if (ruleOptions.netflix) activeBusinessGroups.push("🎬 流媒体");
  if (ruleOptions.crypto) activeBusinessGroups.push("🤝 交易所");
  if (ruleOptions.finance) activeBusinessGroups.push("💰 金融服务");
  activeBusinessGroups.push("🐟 漏网之鱼");

  for (var b = 0; b < activeBusinessGroups.length; b++) {
    var groupName = activeBusinessGroups[b];
    var groupProxies = commonProxies.concat(regionNames);
    if (groupName === "Ⓜ️ 微软服务" || groupName === "🍏 苹果服务") {
      groupProxies.push("REJECT"); // 允许这部分业务直接丢弃流量(如拦截系统强制更新)
    }
    config["proxy-groups"].push(withIcon({ "name": groupName, "type": "select", "proxies": groupProxies }));
  }

  // 🚦 [8] 终极路由规则 (Routing Rules)
  // 核心修复: 依据 Mihomo 官方最新规范，逻辑规则底层必须使用双括号嵌套！
  // 以下已全部优化为标准 AND 结构： AND,((条件1),(条件2)),策略
  var rules = [
    // --- 苹果与公共 DNS 劫持防护 ---
    "DOMAIN,mask.icloud.com,REJECT",
    "DOMAIN,mask-h2.icloud.com,REJECT",
    "DOMAIN,mask-api.icloud.com,REJECT",
    "DOMAIN,apple-relay.cloudflare.com,REJECT",
    "DOMAIN,apple-relay.apple.com,REJECT",
    "DOMAIN,doh.pub,DIRECT",
    "DOMAIN,dns.alidns.com,DIRECT",
    "RULE-SET,httpdns-reject,REJECT,no-resolve", // 屏蔽 HttpDNS，防止大厂绕过代理泄漏真 IP

    // --- [核心优化] WebRTC 与 QUIC 强力阻断 (防止真实 IP 泄漏) ---
    "AND,((NETWORK,UDP),(DST-PORT,443),(NOT,((GEOSITE,CN)))),REJECT", // 精准阻断非大陆 UDP 443 (QUIC)，强制境外 QUIC 降级至 TCP 且放行国内正常 UDP 流量
    "RULE-SET,category-ads-all,REJECT",
    "DOMAIN-REGEX,^(stun|turn|turns)\\d*\\.,REJECT",
    "DOMAIN-SUFFIX,coturn.net,REJECT",
    "DOMAIN-SUFFIX,metered.ca,REJECT",
    "DOMAIN-SUFFIX,anyfirewall.com,REJECT",

    // --- 进程级 UDP 泄漏封堵 ---
    "AND,((NETWORK,udp),(PROCESS-NAME,chrome.exe)),REJECT",
    "AND,((NETWORK,udp),(PROCESS-NAME,msedge.exe)),REJECT",
    "AND,((NETWORK,udp),(PROCESS-NAME,firefox.exe)),REJECT",
    "AND,((NETWORK,udp),(PROCESS-NAME,brave.exe)),REJECT",
    "AND,((NETWORK,udp),(PROCESS-NAME,opera.exe)),REJECT",
    "AND,((NETWORK,udp),(PROCESS-NAME,vivaldi.exe)),REJECT",
    "AND,((NETWORK,udp),(PROCESS-NAME,safari)),REJECT",
    "AND,((NETWORK,udp),(PROCESS-NAME,Google Chrome)),REJECT",
    "AND,((NETWORK,udp),(PROCESS-NAME,Microsoft Edge)),REJECT",
    "AND,((NETWORK,udp),(PROCESS-NAME,Firefox)),REJECT",

    // --- STUN 常见端口封杀 ---
    "AND,((NETWORK,udp),(DST-PORT,3478)),REJECT",
    "AND,((NETWORK,tcp),(DST-PORT,3478)),REJECT",
    "AND,((NETWORK,udp),(DST-PORT,19302)),REJECT",
    "AND,((NETWORK,tcp),(DST-PORT,19302)),REJECT",
    "AND,((NETWORK,udp),(DST-PORT,5349)),REJECT",
    "AND,((NETWORK,tcp),(DST-PORT,5349)),REJECT",

    // --- [极速解析] 局域网拦截优化 ---
    // 核心优化：私有网络彻底告别 ipcidr 数万行规则集，改用 GEOIP 内存态原生二进制查询，处理耗时降至微秒级！
    "GEOIP,private,🏠 私有网络,no-resolve",

    // --- 常见国内服务直连 ---
    "DOMAIN-SUFFIX,twilio.com,🚀 节点选择",
    "DOMAIN-SUFFIX,weixin.com,DIRECT",
    "DOMAIN-SUFFIX,wx.qq.com,DIRECT",
    "DOMAIN-SUFFIX,servicewechat.com,DIRECT",
    "DOMAIN-SUFFIX,alipay.com,DIRECT",
    "DOMAIN-SUFFIX,alipayobjects.com,DIRECT",
    "DOMAIN-SUFFIX,unionpay.com,DIRECT",
    "DOMAIN-SUFFIX,tenpay.com,DIRECT",
    "DOMAIN-SUFFIX,wechatpay.com,DIRECT",
    "DOMAIN-SUFFIX,qlogo.cn,DIRECT",
    "DOMAIN-SUFFIX,qpic.cn,DIRECT",
    "DOMAIN,localhost,DIRECT",
    "DOMAIN-SUFFIX,local,DIRECT",
    "DOMAIN-SUFFIX,lan,DIRECT",
    "DOMAIN,captive.apple.com,DIRECT"
  ];

  // --- 动态载入业务分流规则 ---
  if (ruleOptions.finance) {
    rules = rules.concat([
      "DOMAIN-SUFFIX,wise.com,💰 金融服务",
      "DOMAIN-SUFFIX,transferwise.com,💰 金融服务",
      "DOMAIN-KEYWORD,stripe,💰 金融服务",
      "DOMAIN-KEYWORD,paypal,💰 金融服务",
      "DOMAIN-SUFFIX,hcaptcha.com,💰 金融服务",
      "DOMAIN-SUFFIX,dukascopy.com,💰 金融服务",
      "DOMAIN-SUFFIX,dukas.io,💰 金融服务",
      "DOMAIN-SUFFIX,jforex.net,💰 金融服务",
      "DOMAIN-SUFFIX,trading-platform.info,💰 金融服务"
    ]);
  }

  if (ruleOptions.crypto) {
    rules = rules.concat([
      "DOMAIN-KEYWORD,binance,🤝 交易所",
      "DOMAIN-SUFFIX,bnbstatic.com,🤝 交易所",
      "DOMAIN-SUFFIX,bntrace.com,🤝 交易所",
      "DOMAIN-SUFFIX,bsappapi.com,🤝 交易所",
      "DOMAIN-SUFFIX,nftstatic.com,🤝 交易所",
      "DOMAIN-SUFFIX,binance.me,🤝 交易所",
      "DOMAIN-SUFFIX,okx.com,🤝 交易所",
      "DOMAIN-SUFFIX,oklink.com,🤝 交易所",
      "DOMAIN-SUFFIX,okx.io,🤝 交易所",
      "DOMAIN-SUFFIX,okx-dns.com,🤝 交易所",
      "DOMAIN-SUFFIX,okx-dns1.com,🤝 交易所",
      "DOMAIN-SUFFIX,okx-dns2.com,🤝 交易所",
      "DOMAIN-SUFFIX,kraken.com,🤝 交易所",
      "RULE-SET,okx,🤝 交易所",
      "RULE-SET,binance,🤝 交易所",
      "RULE-SET,kraken,🤝 交易所"
    ]);
  }

  if (ruleOptions.ai) {
    rules = rules.concat([
      "DOMAIN-SUFFIX,gemini.google,💬 AI 服务",
      "DOMAIN-SUFFIX,gemini.google.com,💬 AI 服务",
      "DOMAIN-SUFFIX,aistudio.google.com,💬 AI 服务",
      "DOMAIN-SUFFIX,notebooklm.google.com,💬 AI 服务",
      "DOMAIN-SUFFIX,generativelanguage.googleapis.com,💬 AI 服务",
      "DOMAIN-SUFFIX,deepmind.com,💬 AI 服务",
      "DOMAIN-SUFFIX,labs.google,💬 AI 服务",
      "DOMAIN-SUFFIX,ai.google.dev,💬 AI 服务",
      "RULE-SET,category-ai-!cn,💬 AI 服务"
    ]);
  }

  if (ruleOptions.youtube) rules.push("RULE-SET,youtube,📹 油管视频");
  if (ruleOptions.google) rules.push("RULE-SET,google,🔍 谷歌服务");
  if (ruleOptions.github) rules.push("RULE-SET,github,🐱 Github");
  if (ruleOptions.microsoft) rules.push("RULE-SET,microsoft,Ⓜ️ 微软服务");
  if (ruleOptions.apple) rules.push("RULE-SET,apple,🍏 苹果服务");
  if (ruleOptions.twitter) rules.push("RULE-SET,twitter,🌐 社交媒体");
  if (ruleOptions.netflix) rules.push("RULE-SET,netflix,🎬 流媒体");

  // [严格防泄漏] 带有 no-resolve 参数，匹配不到目标时不会主动触发远程 DNS 查询，保护 Telegram 隐私
  if (ruleOptions.telegram) rules.push("RULE-SET,telegram-ip,📲 电报消息,no-resolve");

  rules.push("DOMAIN-SUFFIX,nextcloud.com,🚀 节点选择");

  // --- [终极性能提速] 国内全栈直连兜底 --- 
  // 核心优化 1：放弃超大型纯文本域名规则列表，改用内存载入的 GEOSITE 二进制直接检索 cn 标签，省去解析损耗
  rules.push("GEOSITE,cn,DIRECT");

  // 核心优化 2：放弃传统 IP 匹配，直接调用底层库的 GEOIP 原生 Radix 树检索系统，效率呈指数级上升！
  // no-resolve 必须原样保留，100% 杜绝非名单域名的 DNS 泄漏！
  rules = rules.concat([
    "GEOIP,CN,DIRECT,no-resolve",
    "MATCH,🐟 漏网之鱼"
  ]);

  config["rules"] = rules;
  return config;
}
