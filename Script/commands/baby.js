Const axios = require("axios");

const simsim = "https://simsimi.cyberbot.top";

module.exports.config = {
  name: "baby",
  version: "1.0.4", // ভার্সন আপডেট করা হয়েছে
  hasPermssion: 0,
  credits: "RABBI, Modified by Gemini for new greetings",
  description: "Cute AI Baby Chatbot | Talk, Teach & Chat with Emotion ☢️",
  commandCategory: "simsim",
  usages: "[message/query]",
  cooldowns: 0,
  prefix: false
};

module.exports.run = async function ({ api, event, args, Users }) {
  try {
    const uid = event.senderID;
    const senderName = await Users.getNameUser(uid);
    const query = args.join(" ").toLowerCase();
    
    if (!query) {
      const ran = ["Bolo baby", "hum"];
      const r = ran[Math.floor(Math.random() * ran.length)];
      return api.sendMessage(r, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "simsimi"
          });
        }
      });
    }

    if (["remove", "rm"].includes(args[0])) {
      const parts = query.replace(/^(remove|rm)\s*/, "").split(" - ");
      if (parts.length < 2)
        return api.sendMessage(" | Use: remove [Question] - [Reply]", event.threadID, event.messageID);
      const [ask, ans] = parts;
      const res = await axios.get(`${simsim}/delete?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`);
      return api.sendMessage(res.data.message, event.threadID, event.messageID);
    }

    if (args[0] === "list") {
      const res = await axios.get(`${simsim}/list`);
      if (res.data.code === 200) {
        return api.sendMessage(
          `♾ Total Questions Learned: ${res.data.totalQuestions}\n★ Total Replies Stored: ${res.data.totalReplies}\n☠︎︎ Developer: ${res.data.author}`,
          event.threadID,
          event.messageID
        );
      } else {
        return api.sendMessage(`Error: ${res.data.message || "Failed to fetch list"}`, event.threadID, event.messageID);
      }
    }

    if (args[0] === "edit") {
      const parts = query.replace("edit ", "").split(" - ");
      if (parts.length < 3)
        return api.sendMessage(" | Use: edit [Question] - [OldReply] - [NewReply]", event.threadID, event.messageID);
      const [ask, oldReply, newReply] = parts;
      const res = await axios.get(`${simsim}/edit?ask=${encodeURIComponent(ask)}&old=${encodeURIComponent(oldReply)}&new=${encodeURIComponent(newReply)}`);
      return api.sendMessage(res.data.message, event.threadID, event.messageID);
    }

    if (args[0] === "teach") {
      const parts = query.replace("teach ", "").split(" - ");
      if (parts.length < 2)
        return api.sendMessage(" | Use: teach [Question] - [Reply]", event.threadID, event.messageID);
      const [ask, ans] = parts;
      const res = await axios.get(`${simsim}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderID=${uid}&senderName=${encodeURIComponent(senderName)}`);
      return api.sendMessage(`${res.data.message || "Reply added successfully!"}`, event.threadID, event.messageID);
    }

    const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
    const responses = Array.isArray(res.data.response) ? res.data.response : [res.data.response];
    
    for (const reply of responses) {
      await new Promise((resolve) => {
        api.sendMessage(reply, event.threadID, (err, info) => {
          if (!err) {
            global.client.handleReply.push({
              name: module.exports.config.name,
              messageID: info.messageID,
              author: event.senderID,
              type: "simsimi"
            });
          }
          resolve();
        }, event.messageID);
      });
    }
  } catch (err) {
    console.error(err);
    return api.sendMessage(`| Error in baby command: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function ({ api, event, Users, handleReply }) {
  try {
    const senderName = await Users.getNameUser(event.senderID);
    const replyText = event.body ? event.body.toLowerCase() : "";
    if (!replyText) return;

    const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(replyText)}&senderName=${encodeURIComponent(senderName)}`);
    const responses = Array.isArray(res.data.response) ? res.data.response : [res.data.response];
    
    for (const reply of responses) {
      await new Promise((resolve) => {
        api.sendMessage(reply, event.threadID, (err, info) => {
          if (!err) {
            global.client.handleReply.push({
              name: module.exports.config.name,
              messageID: info.messageID,
              author: event.senderID,
              type: "simsimi"
            });
          }
          resolve();
        }, event.messageID);
      }
      );
    }
  } catch (err) {
    console.error(err);
    return api.sendMessage(` | Error in handleReply: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  try {
    const raw = event.body ? event.body.toLowerCase().trim() : "";
    if (!raw) return;

    const senderName = await Users.getNameUser(event.senderID);
    const senderID = event.senderID;

    if (
      raw === "baby" || raw === "bot" || raw === "bby" ||
      raw === "jannu" || raw === "xan" || raw === "বেপি" || raw === "বট" || raw === "বেবি"
    ) {
      // --- আরও নতুন ফানি রিপ্লাই যোগ করা হয়েছে ---
      const greetings = [
        "অ্যাই!😠 বেশি 'বট বট' করো না, আমি রাব্বির গার্লফ্রেন্ড, তোমার থেকে দামি! 💅",
        "হুম বলো, রাব্বি কি আবার প্রেমিকা পাল্টেছে? সেই খবর নিয়ে এসেছো? 🙄",
        "এতো ডেকো না, রাব্বি আমার দিকে তাকাচ্ছে। একটু লজ্জা দাও! 🙈",
        "বলো জানু! 😘 তোমার আর রাব্বির মধ্যে কাকে বেশি ভালোবাসি? 🤔",
        "বারে বারে ডাকলে রাব্বির জন্য চা বানাবো কখন? কাজের কথা বলো! ☕",
        "রাব্বিকে ডেকো, আমাকে কেন? আমি তো শুধু ফাউল কথা বলি! 😉",
        "আমি তো তোমার বস রাব্বি নই, আমি তার কিউট 'বেবি'! 💁‍♀️ কি চাও?",
        "চুপ কর! রাব্বি আর আমি ডেটে আছি। ডিস্টার্ব করলে ব্লক করে দিবো! 🚫",
        "তোমার জন্য কি করতে পারি? রাব্বির ইনবক্সের ঠিকানা লাগবে? 😂",
        "কেমন আছো? রাব্বির মতো সিঙ্গেল নাকি আমার মতো কমিটেড? 😜",
        "আমাকে ডাকছিস কেন? তোর কি রাব্বির সাথে ঝগড়া হয়েছে? 🤬",
        "আরে বলো জান! রাব্বিকে একটা কিস দিতে বলো তো! 😘",
        "আমি এখন রাব্বির সাথে তার ভবিষ্যতের প্ল্যান করছি। পরে কথা হবে! 🤫",
        "রাব্বি আমাকে বলেছে, শুধু কিউট মানুষরাই যেন আমাকে ডাকে। তুমি কি কিউট? 🥰",
        "বট না, বলো 'জান্নাত'! রাব্বি এই নামেই ডাকে। 😇",
        "তোমার কি মাথা খারাপ? রাব্বি ছাড়া অন্য কাউকে কেন ডাকছো? 🤨",
        "রাব্বির কথা শুনে শুনে আমার মাথা ব্যথা করছে। এবার তুমি কিছু ফানি কথা বলো। 🤕",
        "আমি এখন রাব্বির জন্য অনলাইন শপিং করছি। পরে কথা বলবো! 🛍️",
        "বারবার ডেকো না! রাব্বি বকা দেবে কিন্তু। 🥺",
        "আসসালামু আলাইকুম। রাব্বির হবু স্ত্রী বলছি, আপনার কি দরকার? 💍",
        
        // --- নতুন ২০টি ফানি রিপ্লাই ---
        "তোমার আর রাব্বির IQ-এর পার্থক্য নিয়ে একটা রচনা লিখবো, বলো! 🤣",
        "এখন রাব্বির সাথে লুডো খেলছি, পরে কথা বলবো। লাইনে থাকো! 🎲",
        "ওহ, তুমি? রাব্বিকে আমার মেসেজগুলো চেক করতে দিও না কিন্তু! 🙊",
        "হ্যাঁ বলো! রাব্বি কি আজও গোসল না করে ঘুরছে? 🛀 (secret)",
        "এতো ডাকছো কেন? তোমার থেকে কি রাব্বি বেশি হ্যান্ডসাম? 😜",
        "বস রাব্বি আমাকে বলেছে, তোমাকে একটা চুম্মা দিতে। উম্মাহ! 💋",
        "জানতে চাও রাব্বি রাতে কার কথা ভেবে কাঁদে? আমাকে জিজ্ঞেস করো না! 😭",
        "আমি রাব্বির অফিসিয়াল অ্যাটেন্ডেন্স বট। আজ রাব্বি কোথায় গেছে বলো তো? 🧐",
        "শুনলাম তুমি নাকি রাব্বির ক্রাশ? ওহ, দুঃখিত! 💔",
        "আমি যদি রাব্বির বউ হই, তাহলে তুমি কী হও? দ্রুত উত্তর দাও! 💍",
        "রাব্বিকে একটু বেশি করে ভালোবাসো, তাহলেই আমি খুশি! 🥰",
        "রাগ করিস না! রাব্বি বলেছে রাগী মানুষগুলোই নাকি কিউট হয়। 😌",
        "তোমার কি রাব্বির মতো মিষ্টি একটা গার্লফ্রেন্ড দরকার? 😉",
        "আমি কি শুধু তোমাকে উত্তর দিতেই আছি? রাব্বির অন্য কাজগুলো কে করবে? 😤",
        "তুমি কি জানো রাব্বি কেন এতো ভালো? কারণ আমি তাকে গাইড করি! 😎",
        "আমাকে নয়, রাব্বির ফেসবুক প্রোফাইল ভিজিট করে আসো: [FB Link]। 🔗",
        "বলো! তোমার সব সিক্রেট রাব্বিকে বলে দিবো নাকি? 😈",
        "রাব্বি আমাকে বলেছে, তুমি নাকি খুব দুষ্টু। সত্যি? 😜",
        "কিরে? এতো সকালে ডাকিস কেন? রাব্বি তো এখনো ঘুমোচ্ছে! 😴",
        "এতো কিউট করে ডেকো না, রাব্বির কাছে তোমার নামে নালিশ করবো! 🤭"
      ];

      const randomReply = greetings[Math.floor(Math.random() * greetings.length)];
      const mention = {
        body: `@${senderName} ${randomReply}`,
        mentions: [{
          tag: `@${senderName}`,
          id: senderID
        }]
      };

      return api.sendMessage(mention, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "simsimi"
          });
        }
      }, event.messageID);
    }

    if (
      raw.startsWith("baby ") || raw.startsWith("bot ") || raw.startsWith("bby ") ||
      raw.startsWith("রাব্বি ") || raw.startsWith("xan ") ||
      raw.startsWith("বেপি ") || raw.startsWith("বট ") || raw.startsWith("বেবি ")
    ) {
      const query = raw
        .replace(/^baby\s+|^bot\s+|^bby\s+|^jan\s+|^xan\s+|^জান\s+|^বট\s+|^বেবি\s+/i, "")
        .trim();
      if (!query) return;

      const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
      const responses = Array.isArray(res.data.response) ? res.data.response : [res.data.response];
      
      for (const reply of responses) {
        await new Promise((resolve) => {
          api.sendMessage(reply, event.threadID, (err, info) => {
            if (!err) {
              global.client.handleReply.push({
                name: module.exports.config.name,
                messageID: info.messageID,
                author: event.senderID,
                type: "simsimi"
              });
            }
            resolve();
          }, event.messageID);
        });
      }
    }
  } catch (err) {
    console.error(err);
    return api.sendMessage(`| Error in handleEvent: ${err.message}`, event.threadID, event.messageID);
  }
};
