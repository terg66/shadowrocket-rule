// =========================================================================
// 适用版本: Clash Verge Rev / Clash Mi / Mihomo 内核 (终极通用版)
// 核心特色: 结合实战防封锁 + 官方底层调优 + 完美硬件/游戏机兼容
// =========================================================================

var ruleOptions = {
  finance: true,      // 💰 金融服务
  crypto: true,       // 🤝 交易所
  ai: true,           // 💬 AI 服务
  youtube: true,      // 📹 油管视频
  google: true,       // 🔍 谷歌服务
  github: true,       // 🐱 Github
  microsoft: true,    // Ⓜ️ 微软服务
  apple: true,        // 🍏 苹果服务
  telegram: true,     // 📲 电报消息
  twitter: true,      // 🌐 社交媒体
  netflix: true       // 🎬 流媒体
};

function main(config) {
  // --- 1. 全局核心底层与抗封锁调优 (吸取 Mi 官方精华) ---
  config["ipv6"] = true;
  config["prefer-ipv6"] = false;
  config["tcp-concurrent"] = true;
  config["unified-delay"] = true;
  config["find-process-mode"] = "strict";

  config["profile"] = {
    "store-selected": true,
    "store-fake-ip": true
  };

  // --- 2. 域名嗅探 (解决透明代理局域网分流) ---
  config["sniffer"] = {
    "enable": true,
    "force-dns-mapping": true,
    "parse-pure-ip": true,
    "override-destination": true,
    "sniff": {
      "HTTP": { "ports": [80, "8080-8880"], "override-destination": true },
      "TLS": { "ports": [443, 8443] },
      "QUIC": { "ports": [443, 8443] }
    },
    "skip-domain": ["Mijia Cloud", "+.oray.com", "captive.apple.com", "+.push.apple.com"]
  };

  // --- 3. TUN 模式安全配置 ---
  config["tun"] = {
    "enable": true,
    "stack": "mixed", // PC端mixed性能更好，Mi端会自动处理
    "auto-route": true,
    "auto-detect-interface": true,
    "strict-route": true, // 防止DNS和流量泄漏
    "endpoint-independent-nat": true, // 改善游戏联机 NAT 类型
    "dns-hijack": ["any:53", "tcp://any:53"],
    "route-exclude-address": [
      "192.168.0.0/16", "10.0.0.0/8", "172.16.0.0/12", "127.0.0.0/8",
      "169.254.0.0/16", "224.0.0.0/4", "255.255.255.255/32",
      "100.64.0.0/10", "fe80::/10", "ff00::/8", "::ffff:0:0/96", "::1/128"
    ]
  };

  // --- 4. GEO 数据源 (官方直连源) ---
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

  // --- 5. DNS 高阶配置 (融合 Mi 官方白名单与 Script B 分流) ---
  config.dns = {
    "enable": true,
    "ipv6": true,
    "prefer-h3": true, // 开启 HTTP/3 DNS 加速
    "cache-algorithm": "arc", // 命中率更高的缓存算法
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16", // 国际保留网段，防Docker冲突
    "respect-rules": true,
    "default-nameserver": ["223.5.5.5", "119.29.29.29"],
    "nameserver": ["https://8.8.8.8/dns-query", "https://1.1.1.1/dns-query"],
    "proxy-server-nameserver": ["https://223.5.5.5/dns-query", "119.29.29.29"],
    "nameserver-policy": {
      "geosite:cn,private": ["https://223.5.5.5/dns-query", "119.29.29.29"]
    },
    // 【神级白名单】整合了支付防风控、系统时间对齐、主机游戏 STUN、国内流媒体 CDN 纠偏
    "fake-ip-filter": [
      "+.weixin.com", "+.wx.qq.com", "+.servicewechat.com", "+.alipay.com", "+.unionpay.com", "+.tenpay.com", // 支付
      "localhost", "+.local", "+.lan", "WORKGROUP", // 局域网
      "time.*.com", "time.*.gov", "time.*.edu.cn", "time.*.apple.com", "time-ios.apple.com", // 苹果/国际时间
      "ntp.*.com", "*.time.edu.cn", "*.ntp.org.cn", "*.pool.ntp.org", "time1.cloud.tencent.com", // NTP对时
      "*.msftncsi.com", "*.msftconnecttest.com", "captive.apple.com", // 微软/苹果网络探测
      "*.mcdn.bilivideo.cn", "+.bilibili.com", "+.bilicdn.com", "+.bilivideo.com", // B站 CDN
      "+.market.xiaomi.com", "+.services.googleapis.cn" // 国内商店推送
    ]
  };

  // --- 6. 动态规则集 Providers ---
  var proxyUrlPrefix = "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo";
  var providers = {
    "category-ads-all": { "type": "http", "format": "mrs", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/category-ads-all.mrs", "path": "./ruleset/category-ads-all.mrs", "interval": 86400 },
    "cn": { "type": "http", "format": "mrs", "behavior": "domain", "url": proxyUrlPrefix + "/geosite/cn.mrs", "path": "./ruleset/cn.mrs", "interval": 86400 },
    "private-ip": { "type": "http", "format": "mrs", "behavior": "ipcidr", "url": proxyUrlPrefix + "/geoip/private.mrs", "path": "./ruleset/private-ip.mrs", "interval": 86400 },
    "cn-ip": { "type": "http", "format": "mrs", "behavior": "ipcidr", "url": proxyUrlPrefix + "/geoip/cn.mrs", "path": "./ruleset/cn-ip.mrs", "interval": 86400 }
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

  // --- 7. 代理组逻辑 (20+ 国家兜底识别 & 正则性能优化) ---
  var proxies = config.proxies || [];
  // 覆盖主流 20+ 个国家与地区
  var regionFilters = [
    { name: "🇺🇸 美国节点", regex: "美|us|united states|america" },
    { name: "🇨🇭 瑞士节点", regex: "瑞士|rs|switzerland" },
    { name: "🇭🇰 香港节点", regex: "港|hk|hongkong|hong kong" },
    { name: "🇯🇵 日本节点", regex: "日|jp|japan" },
    { name: "🇹🇼 台湾节点", regex: "台|tw|taiwan" },
    { name: "🇸🇬 新加坡节点", regex: "新|sg|singapore" },
    { name: "🇰🇷 韩国节点", regex: "韩|kr|korea" },
    { name: "🇬🇧 英国节点", regex: "英|uk|united kingdom|britain" },
    { name: "🇩🇪 德国节点", regex: "德|de|germany" },
    { name: "🇫🇷 法国节点", regex: "法|fr|france" },
    { name: "🇲🇾 马来节点", regex: "马来|my|malaysia" },
    { name: "🇹🇷 土耳其节点", regex: "土耳其|tr|turkey" },
    { name: "🇨🇦 加拿大节点", regex: "加|ca|canada" },
    { name: "🇦🇺 澳洲节点", regex: "澳|au|australia" },
    { name: "🇳🇱 荷兰节点", regex: "荷|nl|netherlands" },
    { name: "🇮🇳 印度节点", regex: "印|in|india" },
    { name: "🇷🇺 俄罗斯节点", regex: "俄|ru|russia" },
    { name: "🇦🇷 阿根廷节点", regex: "阿根廷|ar|argentina" },
    { name: "🇵🇱 波兰节点", regex: "波兰|pl|poland" },
    { name: "🇮🇹 意大利节点", regex: "意|it|italy" }
  ];

  for (var i = 0; i < regionFilters.length; i++) {
    regionFilters[i].compiledRegex = new RegExp(regionFilters[i].regex, "i");
  }

  var activeRegions = [];
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

  for (var m = 0; m < regionFilters.length; m++) {
    if (regionFilters[m].hasProxy) activeRegions.push(regionFilters[m]);
  }
  if (activeRegions.length === 0) activeRegions = regionFilters;

  var regionNames = [];
  for (var n = 0; n < activeRegions.length; n++) {
    regionNames.push(activeRegions[n].name);
  }
  if (unMatchedProxies.length > 0) regionNames.push("🌍 其他节点");

  var commonProxies = ["🚀 节点选择"].concat(regionNames).concat(["🖐️ 手动切换"]);
  config["proxy-groups"] = [
    { "name": "🚀 节点选择", "type": "select", "proxies": ["⚡ 自动选择", "🖐️ 手动切换", "DIRECT", "REJECT"] },
    { "name": "⚡ 自动选择", "type": "select", "proxies": regionNames },
    { "name": "🖐️ 手动切换", "type": "select", "include-all": true },
    { "name": "🏠 私有网络", "type": "select", "proxies": ["DIRECT", "🚀 节点选择", "⚡ 自动选择", "🖐️ 手动切换"] }
  ];

  for (var rIndex = 0; rIndex < activeRegions.length; rIndex++) {
    var region = activeRegions[rIndex];
    config["proxy-groups"].push({
      "name": region.name,
      "type": "url-test",
      "include-all": true,
      "filter": "(?i)" + region.regex,
      "url": "https://edge.microsoft.com/captiveportal/generate_204",
      "interval": 600,
      "timeout": 5000,
      "lazy": true,
      "max-failed-times": 2,
      "expected-status": 204,
      "tolerance": 50
    });
  }

  if (unMatchedProxies.length > 0) {
    config["proxy-groups"].push({
      "name": "🌍 其他节点", "type": "url-test", "proxies": unMatchedProxies,
      "url": "https://edge.microsoft.com/captiveportal/generate_204", "interval": 600, "timeout": 5000, "lazy": true, "max-failed-times": 2, "expected-status": 204, "tolerance": 50
    });
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
    var groupProxies = commonProxies.slice();
    if (groupName === "Ⓜ️ 微软服务" || groupName === "🍏 苹果服务") groupProxies.push("DIRECT");
    config["proxy-groups"].push({ "name": groupName, "type": "select", "proxies": groupProxies });
  }

  // --- 8. 精准路由分流 Rules ---
  var rules = [
    "DOMAIN-SUFFIX,weixin.com,DIRECT", "DOMAIN-SUFFIX,wx.qq.com,DIRECT", "DOMAIN-SUFFIX,servicewechat.com,DIRECT",
    "DOMAIN-SUFFIX,alipay.com,DIRECT", "DOMAIN-SUFFIX,unionpay.com,DIRECT", "DOMAIN-SUFFIX,tenpay.com,DIRECT",
    "DOMAIN,localhost,DIRECT", "DOMAIN-SUFFIX,local,DIRECT", "DOMAIN-SUFFIX,lan,DIRECT", "DOMAIN,captive.apple.com,DIRECT",
    "RULE-SET,private-ip,🏠 私有网络,no-resolve",

    // 强力防泄漏: 屏蔽 QUIC 和 P2P/WebRTC 通讯
    "DST-PORT,3478,REJECT", "DST-PORT,3479,REJECT", "DST-PORT,3480,REJECT", "DST-PORT,3481,REJECT",
    "DST-PORT,19302,REJECT", "DST-PORT,19305,REJECT", "DST-PORT,5349,REJECT",
    "DOMAIN-KEYWORD,stun,REJECT", "DOMAIN-KEYWORD,turn,REJECT",
    "AND,((NETWORK,UDP),(DST-PORT,443)),REJECT",
    "RULE-SET,category-ads-all,REJECT"
  ];

  if (ruleOptions.finance) {
    rules = rules.concat([
      "DOMAIN-KEYWORD,wise,💰 金融服务", "DOMAIN-SUFFIX,wise.help,💰 金融服务", "DOMAIN-SUFFIX,wiseassets.com,💰 金融服务",
      "DOMAIN-SUFFIX,transferwise.com,💰 金融服务", "DOMAIN-KEYWORD,stripe,💰 金融服务", "DOMAIN-SUFFIX,stripe.network,💰 金融服务",
      "DOMAIN-SUFFIX,link.com,💰 金融服务", "DOMAIN-SUFFIX,hcaptcha.com,💰 金融服务", "DOMAIN-SUFFIX,sprig.com,💰 金融服务",
      "DOMAIN-KEYWORD,dukascopy,💰 金融服务", "DOMAIN-SUFFIX,dukas.io,💰 金融服务", "DOMAIN-SUFFIX,jforex.net,💰 金融服务", "DOMAIN-SUFFIX,trading-platform.info,💰 金融服务"
    ]);
  }
  if (ruleOptions.crypto) {
    rules = rules.concat([
      "DOMAIN-KEYWORD,binance,🤝 交易所", "DOMAIN-SUFFIX,bnbstatic.com,🤝 交易所", "DOMAIN-SUFFIX,bntrace.com,🤝 交易所",
      "DOMAIN-SUFFIX,bsappapi.com,🤝 交易所", "DOMAIN-SUFFIX,nftstatic.com,🤝 交易所", "DOMAIN-SUFFIX,binance.me,🤝 交易所",
      "DOMAIN-KEYWORD,okx,🤝 交易所", "DOMAIN-SUFFIX,okx.com,🤝 交易所", "DOMAIN-SUFFIX,oklink.com,🤝 交易所",
      "DOMAIN-KEYWORD,kraken,🤝 交易所", "DOMAIN-SUFFIX,kraken.com,🤝 交易所", "DOMAIN-SUFFIX,kraken.pro,🤝 交易所",
      "RULE-SET,okx,🤝 交易所", "RULE-SET,binance,🤝 交易所", "RULE-SET,kraken,🤝 交易所"
    ]);
  }
  if (ruleOptions.ai) {
    rules = rules.concat([
      "DOMAIN-KEYWORD,gemini,💬 AI 服务", "DOMAIN-KEYWORD,aistudio,💬 AI 服务", "DOMAIN-KEYWORD,notebooklm,💬 AI 服务",
      "DOMAIN-SUFFIX,generativelanguage.googleapis.com,💬 AI 服务", "DOMAIN-SUFFIX,deepmind.com,💬 AI 服务",
      "DOMAIN-SUFFIX,labs.google,💬 AI 服务", "DOMAIN-SUFFIX,ai.google.dev,💬 AI 服务", "RULE-SET,category-ai-!cn,💬 AI 服务"
    ]);
  }

  if (ruleOptions.youtube) rules.push("RULE-SET,youtube,📹 油管视频");
  if (ruleOptions.google) rules.push("RULE-SET,google,🔍 谷歌服务");
  if (ruleOptions.github) rules.push("RULE-SET,github,🐱 Github");
  if (ruleOptions.microsoft) rules.push("RULE-SET,microsoft,Ⓜ️ 微软服务");
  if (ruleOptions.apple) rules.push("RULE-SET,apple,🍏 苹果服务");
  if (ruleOptions.twitter) rules.push("RULE-SET,twitter,🌐 社交媒体");
  if (ruleOptions.netflix) rules.push("RULE-SET,netflix,🎬 流媒体");
  if (ruleOptions.telegram) rules.push("RULE-SET,telegram-ip,📲 电报消息,no-resolve");

  rules = rules.concat([
    "RULE-SET,cn,DIRECT",
    "RULE-SET,cn-ip,DIRECT,no-resolve",
    "MATCH,🐟 漏网之鱼"
  ]);
  config["rules"] = rules;

  return config;
}
