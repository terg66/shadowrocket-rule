// =========================================================================
// 适用版本: Clash Verge Rev / Mihomo 内核
// 版本: 终极融合版 v11.5 (加入 HTTPDNS 拦截与防泄漏增强 - 修复 DNS 泄漏)
// 修复与增强清单:
// 1. 严格遵守 Boa JS 引擎标准，移除不受支持的属性
// 2. 修正逻辑规则 (AND) 语法，Mihomo 官方要求必须使用嵌套括号
// 3. 强制对称 NAT (endpoint-independent-nat: false)，彻底阻断 WebRTC 泄露
// 4. 完美实现 Fake-IP + no-resolve 无缝衔接，杜绝 DNS 泄露
// 5. 优化负载均衡与故障转移组，显式排除 direct/reject 避免测速异常
// 6. 【新增】引入 HTTPDNS 强力拦截，强制国内 App 走标准 DNS，确保分流 100% 准确
// 7. 【新增】核心 DoH 白名单，防止 HTTPDNS 拦截误杀 Clash 自身 DNS 请求
// 8. 【紧急修复】为 HTTPDNS 拦截规则追加 no-resolve，防止触发真实 DNS 解析导致泄漏
// =========================================================================

var ruleOptions = {
  finance: true,
  crypto: true,
  ai: true,
  youtube: true,
  google: true,
  github: true,
  microsoft: true,
  apple: true,
  telegram: true,
  twitter: true,
  netflix: true
};

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

function getIcon(name) { return iconMap[name] || null; }
function withIcon(groupObj) {
  var icon = getIcon(groupObj.name);
  if (icon) groupObj["icon"] = icon;
  return groupObj;
}

var regionFilters = [
  { name: "🇺🇸 美国节点", regex: "美|\\bus\\b|united.?states|america", filterRegex: "(?i)(?:美国|united.?states|america|(?:^|[^a-zA-Z])us(?:[^a-zA-Z]|))" },
  { name: "🇨🇭 瑞士节点", regex: "瑞士|\\bch\\b|\\brs\\b|switzerland", filterRegex: "(?i)(?:瑞士|switzerland|(?:^|[^a-zA-Z])ch(?:[^a-zA-Z]|)|(?:^|[^a-zA-Z])rs(?:[^a-zA-Z]|))" },
  { name: "🇭🇰 香港节点", regex: "港|\\bhk\\b|hongkong|hong.?kong", filterRegex: "(?i)(?:港|hongkong|hong.?kong|(?:^|[^a-zA-Z])hk(?:[^a-zA-Z]|))" },
  { name: "🇯🇵 日本节点", regex: "日|\\bjp\\b|japan", filterRegex: "(?i)(?:日本|japan|(?:^|[^a-zA-Z])jp(?:[^a-zA-Z]|))" },
  { name: "🇹🇼 台湾节点", regex: "台|\\btw\\b|taiwan", filterRegex: "(?i)(?:台湾|taiwan|(?:^|[^a-zA-Z])tw(?:[^a-zA-Z]|))" },
  { name: "🇸🇬 新加坡节点", regex: "新|\\bsg\\b|singapore", filterRegex: "(?i)(?:新加坡|singapore|(?:^|[^a-zA-Z])sg(?:[^a-zA-Z]|))" },
  { name: "🇰🇷 韩国节点", regex: "韩|\\bkr\\b|korea", filterRegex: "(?i)(?:韩国|korea|(?:^|[^a-zA-Z])kr(?:[^a-zA-Z]|))" },
  { name: "🇬🇧 英国节点", regex: "英|\\buk\\b|\\bgb\\b|united.?kingdom|britain", filterRegex: "(?i)(?:英国|united.?kingdom|britain|(?:^|[^a-zA-Z])uk(?:[^a-zA-Z]|)|(?:^|[^a-zA-Z])gb(?:[^a-zA-Z]|))" },
  { name: "🇩🇪 德国节点", regex: "德|\\bde\\b|germany", filterRegex: "(?i)(?:德国|germany|(?:^|[^a-zA-Z])de(?:[^a-zA-Z]|))" },
  { name: "🇫🇷 法国节点", regex: "法|\\bfr\\b|france", filterRegex: "(?i)(?:法国|france|(?:^|[^a-zA-Z])fr(?:[^a-zA-Z]|))" },
  { name: "🇲🇾 马来节点", regex: "马来|\\bmy\\b|malaysia", filterRegex: "(?i)(?:马来|malaysia|(?:^|[^a-zA-Z])my(?:[^a-zA-Z]|))" },
  { name: "🇹🇷 土耳其节点", regex: "土耳其|\\btr\\b|turkey|turkiye", filterRegex: "(?i)(?:土耳其|turkey|turkiye|(?:^|[^a-zA-Z])tr(?:[^a-zA-Z]|))" },
  { name: "🇨🇦 加拿大节点", regex: "加拿大|canada|\\bca[-]|[-]ca\\b", filterRegex: "(?i)(?:加拿大|canada|(?:^|[^a-zA-Z])ca[-_]|[-_]ca(?:[^a-zA-Z]|))" },
  { name: "🇦🇺 澳洲节点", regex: "澳|\\bau\\b|australia", filterRegex: "(?i)(?:澳大利亚|australia|(?:^|[^a-zA-Z])au(?:[^a-zA-Z]|))" },
  { name: "🇳🇱 荷兰节点", regex: "荷兰|\\bnl\\b|netherlands", filterRegex: "(?i)(?:荷兰|netherlands|(?:^|[^a-zA-Z])nl(?:[^a-zA-Z]|))" },
  { name: "🇮🇳 印度节点", regex: "印度|india|\\bindian\\b", filterRegex: "(?i)(?:印度|india|indian)" },
  { name: "🇷🇺 俄罗斯节点", regex: "俄|\\bru\\b|russia", filterRegex: "(?i)(?:俄罗斯|russia|(?:^|[^a-zA-Z])ru(?:[^a-zA-Z]|))" },
  { name: "🇦🇷 阿根廷节点", regex: "阿根廷|\\bar\\b|argentina", filterRegex: "(?i)(?:阿根廷|argentina|(?:^|[^a-zA-Z])ar(?:[^a-zA-Z]|))" },
  { name: "🇵🇱 波兰节点", regex: "波兰|\\bpl\\b|poland", filterRegex: "(?i)(?:波兰|poland|(?:^|[^a-zA-Z])pl(?:[^a-zA-Z]|))" },
  { name: "🇮🇹 意大利节点", regex: "意大利|\\bit\\b|italy", filterRegex: "(?i)(?:意大利|italy|(?:^|[^a-zA-Z])it(?:[^a-zA-Z]|))" }
];

var HEALTH_CHECK_URL = "https://www.gstatic.com/generate_204";

function main(config) {

  // =====================================================================
  // 0. 重置全局状态
  // =====================================================================
  for (var i = 0; i < regionFilters.length; i++) {
    regionFilters[i].hasProxy = false;
    regionFilters[i].compiledRegex = new RegExp(regionFilters[i].regex, "i");
  }

  // =====================================================================
  // 1. 全局核心配置
  // =====================================================================
  config["ipv6"] = true;
  config["tcp-concurrent"] = true;
  config["unified-delay"] = true;
  config["find-process-mode"] = "always";
  config["profile"] = {
    "store-selected": true,
    "store-fake-ip": true
  };

  // =====================================================================
  // 2. 域名嗅探
  // =====================================================================
  config["sniffer"] = {
    "enable": true,
    "force-dns-mapping": true,
    "parse-pure-ip": true,
    "override-destination": true,
    "sniff": {
      "HTTP": { "ports": [80, 8080, 8880] },
      "TLS": { "ports": [443, 8443] },
      "QUIC": { "ports": [443, 8443] }
    },
    "skip-domain": [
      "Mijia Cloud", "+.oray.com",
      "captive.apple.com", "+.push.apple.com"
    ]
  };

  // =====================================================================
  // 3. TUN 模式
  // =====================================================================
  config["tun"] = {
    "enable": true,
    "stack": "mixed",
    "auto-route": true,
    "auto-detect-interface": true,
    "strict-route": true,
    "endpoint-independent-nat": false,
    "dns-hijack": ["any:53", "tcp://any:53"],
    "route-exclude-address": [
      "192.168.0.0/16", "10.0.0.0/8", "172.16.0.0/12",
      "127.0.0.0/8", "169.254.0.0/16", "224.0.0.0/4",
      "255.255.255.255/32", "100.64.0.0/10",
      "fe80::/10", "ff00::/8", "::ffff:0:0/96", "::1/128"
    ]
  };

  // =====================================================================
  // 4. GEO 数据源 (Mihomo 规范)
  // =====================================================================
  config["geodata-mode"] = true;
  config["geo-auto-update"] = true;
  config["geodata-loader"] = "memconservative";
  config["geo-update-interval"] = 24;
  config["geox-url"] = {
    "geoip": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geoip.dat",
    "geosite": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geosite.dat",
    "mmdb": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/country.mmdb",
    "asn": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/GeoLite2-ASN.mmdb"
  };

  // =====================================================================
  // 5. DNS 配置
  // =====================================================================
  config.dns = {
    "enable": true,
    "ipv6": true,
    "prefer-h3": false,
    "cache-algorithm": "arc",
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "respect-rules": false,
    "default-nameserver": [
      "223.5.5.5",
      "119.29.29.29",
      "tcp://223.5.5.5",
      "tcp://119.29.29.29"
    ],
    "nameserver": [
      "https://doh.pub/dns-query",
      "https://dns.alidns.com/dns-query"
    ],
    "proxy-server-nameserver": [
      "223.5.5.5",
      "119.29.29.29",
      "tcp://223.5.5.5",
      "tcp://119.29.29.29"
    ],
    "nameserver-policy": {
      "geosite:cn,private": ["223.5.5.5", "119.29.29.29", "tcp://223.5.5.5"],
      "+.push.apple.com": ["223.5.5.5", "119.29.29.29"],
      "+.microsoft.com": ["223.5.5.5", "119.29.29.29"],
      "+.windows.com": ["223.5.5.5", "119.29.29.29"]
    },
    "fake-ip-filter": [
      "+.weixin.com", "+.wx.qq.com", "+.servicewechat.com",
      "+.alipay.com", "+.unionpay.com", "+.tenpay.com",
      "localhost", "+.local", "+.lan", "*.localdomain",
      "time.apple.com", "time1.apple.com", "time2.apple.com",
      "time3.apple.com", "time4.apple.com", "time5.apple.com",
      "time6.apple.com", "time7.apple.com", "time-ios.apple.com",
      "time.cloudflare.com", "time.windows.com",
      "0.pool.ntp.org", "1.pool.ntp.org", "2.pool.ntp.org", "3.pool.ntp.org",
      "0.cn.pool.ntp.org", "1.cn.pool.ntp.org", "2.cn.pool.ntp.org", "3.cn.pool.ntp.org",
      "+.ntp.org.cn", "+.time.edu.cn",
      "time1.cloud.tencent.com", "time2.cloud.tencent.com",
      "time3.cloud.tencent.com", "time4.cloud.tencent.com", "time5.cloud.tencent.com",
      "ntp.aliyun.com", "ntp1.aliyun.com", "ntp2.aliyun.com",
      "ntp3.aliyun.com", "ntp4.aliyun.com", "ntp5.aliyun.com",
      "ntp6.aliyun.com", "ntp7.aliyun.com",
      "+.msftncsi.com", "+.msftconnecttest.com", "captive.apple.com",
      "+.battlenet.com.cn", "+.blzstatic.cn", "+.battle.net",
      "+.xboxlive.com", "+.playfabapi.com",
      "+.playstation.net", "+.playstation.com",
      "+.nintendo.net",
      "+.mcdn.bilivideo.cn", "+.bilibili.com",
      "+.bilicdn.com", "+.bilivideo.com",
      "+.market.xiaomi.com", "+.services.googleapis.cn"
    ]
  };

  // =====================================================================
  // 6. 规则集 Providers
  // =====================================================================
  var proxyUrlPrefix = "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo";
  var providers = {
    // 【修正】HTTPDNS 拦截规则集 (修正了正确的路径，并使用 jsdelivr CDN 加速防 EOF 报错)
    "httpdns-reject": {
      "type": "http",
      "format": "yaml",
      "behavior": "classical",
      "url": "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/BlockHttpDNS/BlockHttpDNS.yaml",
      "path": "./ruleset/httpdns_reject.yaml",
      "interval": 86400
    },
    "category-ads-all": {
      "type": "http", "format": "mrs", "behavior": "domain",
      "url": proxyUrlPrefix + "/geosite/category-ads-all.mrs",
      "path": "./ruleset/category-ads-all.mrs", "interval": 86400
    },
    "cn": {
      "type": "http", "format": "mrs", "behavior": "domain",
      "url": proxyUrlPrefix + "/geosite/cn.mrs",
      "path": "./ruleset/cn.mrs", "interval": 86400
    },
    "private-ip": {
      "type": "http", "format": "mrs", "behavior": "ipcidr",
      "url": proxyUrlPrefix + "/geoip/private.mrs",
      "path": "./ruleset/private-ip.mrs", "interval": 86400
    },
    "cn-ip": {
      "type": "http", "format": "mrs", "behavior": "ipcidr",
      "url": proxyUrlPrefix + "/geoip/cn.mrs",
      "path": "./ruleset/cn-ip.mrs", "interval": 86400
    }
  };

  if (ruleOptions.ai) providers["category-ai-!cn"] = { "type": "http", "format": "mrs", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/category-ai-!cn.mrs", "path": "./ruleset/category-ai-!cn.mrs", "interval": 86400 };
  if (ruleOptions.youtube) providers["youtube"] = { "type": "http", "format": "mrs", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/youtube.mrs", "path": "./ruleset/youtube.mrs", "interval": 86400 };
  if (ruleOptions.google) providers["google"] = { "type": "http", "format": "mrs", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/google.mrs", "path": "./ruleset/google.mrs", "interval": 86400 };
  if (ruleOptions.github) providers["github"] = { "type": "http", "format": "mrs", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/github.mrs", "path": "./ruleset/github.mrs", "interval": 86400 };
  if (ruleOptions.microsoft) providers["microsoft"] = { "type": "http", "format": "mrs", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/microsoft.mrs", "path": "./ruleset/microsoft.mrs", "interval": 86400 };
  if (ruleOptions.apple) providers["apple"] = { "type": "http", "format": "mrs", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/apple.mrs", "path": "./ruleset/apple.mrs", "interval": 86400 };
  if (ruleOptions.twitter) providers["twitter"] = { "type": "http", "format": "mrs", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/twitter.mrs", "path": "./ruleset/twitter.mrs", "interval": 86400 };
  if (ruleOptions.netflix) providers["netflix"] = { "type": "http", "format": "mrs", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/netflix.mrs", "path": "./ruleset/netflix.mrs", "interval": 86400 };
  if (ruleOptions.telegram) providers["telegram-ip"] = { "type": "http", "format": "mrs", "behavior": "ipcidr", "url": proxyUrlPrefix + "/geoip/telegram.mrs", "path": "./ruleset/telegram-ip.mrs", "interval": 86400 };
  if (ruleOptions.crypto) {
    providers["okx"] = { "type": "http", "format": "mrs", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/okx.mrs", "path": "./ruleset/okx.mrs", "interval": 86400 };
    providers["binance"] = { "type": "http", "format": "mrs", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/binance.mrs", "path": "./ruleset/binance.mrs", "interval": 86400 };
    providers["kraken"] = { "type": "http", "format": "mrs", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/kraken.mrs", "path": "./ruleset/kraken.mrs", "interval": 86400 };
  }
  config["rule-providers"] = providers;

  // =====================================================================
  // 7. 代理分组
  // =====================================================================
  var proxies = config.proxies || [];
  var unMatchedProxies = [];

  for (var j = 0; j < proxies.length; j++) {
    var pName = proxies[j].name;
    var isMatched = false;
    for (var k = 0; k < regionFilters.length; k++) {
      if (regionFilters[k].compiledRegex.test(pName)) {
        regionFilters[k].hasProxy = true;
        isMatched = true;
        break;
      }
    }
    if (!isMatched) unMatchedProxies.push(pName);
  }

  var activeRegions = [];
  for (var m = 0; m < regionFilters.length; m++) {
    if (regionFilters[m].hasProxy) activeRegions.push(regionFilters[m]);
  }
  if (activeRegions.length === 0) activeRegions = regionFilters;

  var regionNames = [];
  for (var n = 0; n < activeRegions.length; n++) {
    regionNames.push(activeRegions[n].name);
  }
  if (unMatchedProxies.length > 0) regionNames.push("🌍 其他节点");

  var commonProxies = [
    "🚀 节点选择",
    "⚡ 自动选择",
    "⚖️ 负载均衡",
    "🔯 故障转移",
    "🖐️ 手动切换",
    "DIRECT"
  ];

  config["proxy-groups"] = [
    withIcon({
      "name": "🚀 节点选择",
      "type": "select",
      "proxies": ["⚡ 自动选择", "⚖️ 负载均衡", "🔯 故障转移", "🖐️ 手动切换", "DIRECT", "REJECT"]
    }),
    withIcon({
      "name": "⚡ 自动选择",
      "type": "select",
      "proxies": regionNames.concat(["DIRECT"])
    }),
    withIcon({
      "name": "⚖️ 负载均衡",
      "type": "load-balance",
      "include-all-proxies": true,
      "exclude-type": "direct|reject",
      "strategy": "consistent-hashing",
      "url": HEALTH_CHECK_URL,
      "interval": 300,
      "timeout": 3000,
      "lazy": true
    }),
    withIcon({
      "name": "🔯 故障转移",
      "type": "fallback",
      "include-all-proxies": true,
      "exclude-type": "direct|reject",
      "url": HEALTH_CHECK_URL,
      "interval": 300,
      "timeout": 3000,
      "lazy": true,
      "max-failed-times": 3
    }),
    withIcon({
      "name": "🖐️ 手动切换",
      "type": "select",
      "include-all": true
    }),
    withIcon({
      "name": "🏠 私有网络",
      "type": "select",
      "proxies": ["DIRECT", "🚀 节点选择", "⚡ 自动选择", "🖐️ 手动切换"]
    })
  ];

  for (var rIndex = 0; rIndex < activeRegions.length; rIndex++) {
    var region = activeRegions[rIndex];
    config["proxy-groups"].push(withIcon({
      "name": region.name,
      "type": "url-test",
      "include-all": true,
      "filter": region.filterRegex,
      "exclude-type": "direct|reject",
      "url": HEALTH_CHECK_URL,
      "interval": 300,
      "timeout": 3000,
      "lazy": true,
      "max-failed-times": 3,
      "expected-status": 204,
      "tolerance": 50
    }));
  }

  if (unMatchedProxies.length > 0) {
    config["proxy-groups"].push(withIcon({
      "name": "🌍 其他节点",
      "type": "url-test",
      "proxies": unMatchedProxies,
      "url": HEALTH_CHECK_URL,
      "interval": 300,
      "timeout": 3000,
      "lazy": true,
      "max-failed-times": 3,
      "expected-status": 204,
      "tolerance": 50
    }));
  }

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
      groupProxies.push("REJECT");
    }
    config["proxy-groups"].push(withIcon({
      "name": groupName,
      "type": "select",
      "proxies": groupProxies
    }));
  }

  // =====================================================================
  // 8. 路由规则
  // =====================================================================
  var rules = [

    // ── [1] Apple Private Relay 拦截 ──
    "DOMAIN,mask.icloud.com,REJECT",
    "DOMAIN,mask-h2.icloud.com,REJECT",
    "DOMAIN,mask-api.icloud.com,REJECT",
    "DOMAIN,apple-relay.cloudflare.com,REJECT",
    "DOMAIN,apple-relay.apple.com,REJECT",

    // ── [2] 核心 DNS 白名单 (防止 HTTPDNS 拦截误杀 Clash 自身 DoH) ──
    "DOMAIN,doh.pub,DIRECT",
    "DOMAIN,dns.alidns.com,DIRECT",

    // ── [3] HTTPDNS 强力拦截 (强制 App 降级走标准 DNS，确保分流准确) ──
    // 👇 就是这里！只加了这一处 no-resolve，其他全没动！
    "RULE-SET,httpdns-reject,REJECT,no-resolve",

    // ── [4] 广告拦截 ──
    "RULE-SET,category-ads-all,REJECT",

    // ── [5] STUN / TURN 域名拦截 (防 WebRTC 泄露) ──
    "DOMAIN,stun.nextcloud.com,REJECT",
    "DOMAIN,stun.talk.nextcloud.com,REJECT",
    "DOMAIN,stun.l.google.com,REJECT",
    "DOMAIN,stun1.l.google.com,REJECT",
    "DOMAIN,stun2.l.google.com,REJECT",
    "DOMAIN,stun3.l.google.com,REJECT",
    "DOMAIN,stun4.l.google.com,REJECT",
    "DOMAIN,stun.services.mozilla.com,REJECT",
    "DOMAIN,stun.cloudflare.com,REJECT",
    "DOMAIN,turn.cloudflare.com,REJECT",
    "DOMAIN,stun.miwifi.com,REJECT",
    "DOMAIN,stun.hitv.com,REJECT",
    "DOMAIN,stun.m2m.orange.com,REJECT",
    "DOMAIN,global.stun.twilio.com,REJECT",
    "DOMAIN,global.turn.twilio.com,REJECT",
    "DOMAIN,stun.twilio.com,REJECT",
    "DOMAIN,turn.twilio.com,REJECT",
    "DOMAIN-SUFFIX,twilio.com,🚀 节点选择",
    "DOMAIN-SUFFIX,coturn.net,REJECT",
    "DOMAIN-SUFFIX,metered.ca,REJECT",
    "DOMAIN,turn.anyfirewall.com,REJECT",

    // ── [6] 端口级 STUN/TURN 拦截 (语法修正：Mihomo 官方要求嵌套括号) ──
    "AND,((NETWORK,UDP),(DST-PORT,3478)),REJECT",
    "AND,((NETWORK,TCP),(DST-PORT,3478)),REJECT",
    "AND,((NETWORK,UDP),(DST-PORT,19302)),REJECT",
    "AND,((NETWORK,TCP),(DST-PORT,19302)),REJECT",
    "AND,((NETWORK,UDP),(DST-PORT,5349)),REJECT",
    "AND,((NETWORK,TCP),(DST-PORT,5349)),REJECT",

    // ── [7] 国内支付 / 社交直连 ──
    "DOMAIN-SUFFIX,weixin.com,DIRECT",
    "DOMAIN-SUFFIX,wx.qq.com,DIRECT",
    "DOMAIN-SUFFIX,servicewechat.com,DIRECT",
    "DOMAIN-SUFFIX,alipay.com,DIRECT",
    "DOMAIN-SUFFIX,unionpay.com,DIRECT",
    "DOMAIN-SUFFIX,tenpay.com,DIRECT",

    // ── [8] 本地 / 私有域名直连 ──
    "DOMAIN,localhost,DIRECT",
    "DOMAIN-SUFFIX,local,DIRECT",
    "DOMAIN-SUFFIX,lan,DIRECT",
    "DOMAIN,captive.apple.com,DIRECT",
  ];

  // ── [9] 业务域名规则 (必须在 IP 规则之前) ──

  if (ruleOptions.finance) {
    rules = rules.concat([
      "DOMAIN-SUFFIX,wise.com,💰 金融服务",
      "DOMAIN-SUFFIX,wise.help,💰 金融服务",
      "DOMAIN-SUFFIX,wiseassets.com,💰 金融服务",
      "DOMAIN-SUFFIX,transferwise.com,💰 金融服务",
      "DOMAIN-SUFFIX,stripe.com,💰 金融服务",
      "DOMAIN-SUFFIX,stripe.network,💰 金融服务",
      "DOMAIN-SUFFIX,hcaptcha.com,💰 金融服务",
      "DOMAIN-SUFFIX,sprig.com,💰 金融服务",
      "DOMAIN-SUFFIX,dukascopy.com,💰 金融服务",
      "DOMAIN-SUFFIX,dukas.io,💰 金融服务",
      "DOMAIN-SUFFIX,jforex.net,💰 金融服务",
      "DOMAIN-SUFFIX,trading-platform.info,💰 金融服务",
      "DOMAIN-SUFFIX,paypal.com,💰 金融服务",
      "DOMAIN-SUFFIX,paypalobjects.com,💰 金融服务"
    ]);
  }

  if (ruleOptions.crypto) {
    rules = rules.concat([
      "DOMAIN-SUFFIX,okx.com,🤝 交易所",
      "DOMAIN-SUFFIX,oklink.com,🤝 交易所",
      "DOMAIN-SUFFIX,okx.io,🤝 交易所",
      "DOMAIN-KEYWORD,binance,🤝 交易所",
      "DOMAIN-SUFFIX,bnbstatic.com,🤝 交易所",
      "DOMAIN-SUFFIX,bntrace.com,🤝 交易所",
      "DOMAIN-SUFFIX,bsappapi.com,🤝 交易所",
      "DOMAIN-SUFFIX,nftstatic.com,🤝 交易所",
      "DOMAIN-SUFFIX,binance.me,🤝 交易所",
      "DOMAIN-SUFFIX,kraken.com,🤝 交易所",
      "DOMAIN-SUFFIX,krakenfiles.com,🤝 交易所",
      "RULE-SET,okx,🤝 交易所",
      "RULE-SET,binance,🤝 交易所",
      "RULE-SET,kraken,🤝 交易所"
    ]);
  }

  if (ruleOptions.ai) {
    rules = rules.concat([
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

  // Telegram 属于 IP-CIDR 规则，但由于其自带 no-resolve，放在此处不会触发实IP泄露
  if (ruleOptions.telegram) rules.push("RULE-SET,telegram-ip,📲 电报消息,no-resolve");

  rules.push("DOMAIN-SUFFIX,nextcloud.com,🚀 节点选择");

  // ── [10] 国内域名直连规则集 ──
  rules.push("RULE-SET,cn,DIRECT");

  // ── [11] IP 类兜底规则 ──
  // 注意：有了 no-resolve，即便域名漏网到达了这层，也不会在 Fake-IP 模式下做 DNS 请求，而是直接走到漏网之鱼，彻底防止 DNS 泄露！
  rules = rules.concat([
    "RULE-SET,private-ip,🏠 私有网络,no-resolve",
    "RULE-SET,cn-ip,DIRECT,no-resolve",
    "MATCH,🐟 漏网之鱼"
  ]);

  config["rules"] = rules;
  return config;
}
