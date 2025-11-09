const axios = require("axios");

const simsim = "https://simsimi.cyberbot.top";

module.exports.config = {
  name: "baby",
  version: "1.0.4",
  hasPermssion: 0,
  credits: "RABBI, Modified by Gemini",
  description: "Cute AI Baby Chatbot | Talk, Teach & Chat with Emotion ☢️",
  commandCategory: "simsim",
  usages: "[message/query] | teach [Question] - [Reply] | remove [Q] - [R] | list", // ব্যবহারের পদ্ধতি স্পষ্ট করা হয়েছে
  cooldowns: 2, // একটি ছোট cooldown যোগ করা হয়েছে
  prefix: false
};

// সিমসিমি/চ্যাট API কল করার জন্য একটি সাধারণ ফাংশন
async function getSimsimiResponse(query, senderName) {
  const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
  // API থেকে উত্তর array অথবা string হিসেবে আসতে পারে, সেটিকে array করে নেওয়া হচ্ছে
  const responses = Array.isArray(res.data.response) ? res.data.response : [res.data.response];
  return responses;
}

// বার্তা পাঠানোর জন্য একটি সাধারণ ফাংশন
function sendMessage(api, event, reply, isReply = false) {
  return new Promise(resolve => {
    api.sendMessage(reply, event.threadID, (err, info) => {
      if (!err && info && global.client && global.client.handleReply) {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          type: "simsimi"
        });
      }
      resolve();
    }, isReply ? event.messageID : null);
  });
}

module.exports.run = async function ({ api, event, args, Users }) {
  try {
    const uid = event.senderID;
    // দ্রুত উত্তরের জন্য ইউজার নেম আগে থেকেই নিয়ে নেওয়া হচ্ছে
    const senderName = await Users.getNameUser(uid) || "User";
    const query = args.join(" ").trim();
    
    if (!query) {
      // যদি শুধু কমান্ড দেওয়া হয়
      const ran = [`বলো ${senderName} কি জানতে চাও?`, "আমি এখানে! হুম...", "কেমন আছো? কিছু জিজ্ঞেস করো..."];
      const r = ran[Math.floor(Math.random() * ran.length)];
      return sendMessage(api, event, r, true);
    }

    const command = args[0].toLowerCase();
    const commandQuery = args.slice(1).join(" ").trim();

    // --- টিচ, রিমুভ, লিস্ট, এডিট কম্যান্ড হ্যান্ডলিং ---
    
    if (["remove", "rm", "delete"].includes(command)) {
      const parts = commandQuery.split(" - ").map(p => p.trim());
      if (parts.length < 2)
        return api.sendMessage("❌ | ব্যবহারের নিয়ম: remove [Question] - [Reply]", event.threadID, event.messageID);
      const [ask, ans] = parts;
      const res = await axios.get(`${simsim}/delete?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`);
      return api.sendMessage(`✅ | ${res.data.message || "Successfully deleted!"}`, event.threadID, event.messageID);
    }

    if (command === "list") {
      const res = await axios.get(`${simsim}/list`);
      if (res.data.code === 200) {
        return api.sendMessage(
          `✅ | **Simsimi ডেটাবেস তথ্য:**\n- মোট শেখানো প্রশ্ন: ${res.data.totalQuestions}\n- মোট উত্তর: ${res.data.totalReplies}\n- ডেভেলপার: ${res.data.author}`,
          event.threadID,
          event.messageID
        );
      } else {
        return api.sendMessage(`❌ | Error: ${res.data.message || "লিস্ট আনতে ব্যর্থ"}`, event.threadID, event.messageID);
      }
    }

    if (command === "edit") {
      const parts = commandQuery.split(" - ").map(p => p.trim());
      if (parts.length < 3)
        return api.sendMessage("❌ | ব্যবহারের নিয়ম: edit [Question] - [OldReply] - [NewReply]", event.threadID, event.messageID);
      const [ask, oldReply, newReply] = parts;
      const res = await axios.get(`${simsim}/edit?ask=${encodeURIComponent(ask)}&old=${encodeURIComponent(oldReply)}&new=${encodeURIComponent(newReply)}`);
      return api.sendMessage(`✅ | ${res.data.message || "Successfully edited!"}`, event.threadID, event.messageID);
    }

    if (command === "teach") {
      const parts = commandQuery.split(" - ").map(p => p.trim());
      if (parts.length < 2)
        return api.sendMessage("❌ | ব্যবহারের নিয়ম: teach [Question] - [Reply]", event.threadID, event.messageID);
      const [ask, ans] = parts;
      const res = await axios.get(`${simsim}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderID=${uid}&senderName=${encodeURIComponent(senderName)}`);
      return api.sendMessage(`✅ | ${res.data.message || "Reply added successfully!"}`, event.threadID, event.messageID);
    }

    // --- মূল সিমসিমি চ্যাটিং ফাংশন ---
    
    const responses = await getSimsimiResponse(query, senderName);
    
    if (responses.length > 0) {
      for (const reply of responses) {
        await sendMessage(api, event, reply, true); // উত্তরগুলোকে এক এক করে পাঠানো হচ্ছে
      }
    } else {
        return api.sendMessage("🤔 | কিছু বুঝতে পারিনি, তুমি কি আবার জিজ্ঞেস করবে?", event.threadID, event.messageID);
    }
    
  } catch (err) {
    console.error("Error in baby command:", err);
    return api.sendMessage(`❌ | API এর সাথে যোগাযোগে সমস্যা: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function ({ api, event, Users, handleReply }) {
  // শুধুমাত্র 'simsimi' টাইপের রিপ্লাই হ্যান্ডেল করবে
  if (handleReply.type !== "simsimi") return; 

  try {
    const senderName = await Users.getNameUser(event.senderID) || "User";
    const replyText = event.body ? event.body.trim() : "";
    if (!replyText) return;

    // --- মূল সিমসিমি চ্যাটিং ফাংশন (রিপ্লাই এর জন্য) ---
    const responses = await getSimsimiResponse(replyText, senderName);
    
    for (const reply of responses) {
      await sendMessage(api, event, reply, true);
    }
  } catch (err) {
    console.error("Error in handleReply:", err);
    // err message না দিয়ে একটি সাধারণ বার্তা দেওয়া হলো
    return api.sendMessage(`❌ | উত্তর দেওয়ার সময় একটি সমস্যা হয়েছে।`, event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  const raw = event.body ? event.body.toLowerCase().trim() : "";
  if (!raw) return;

  // আপনার দেওয়া সব হার্ডকোডেড গ্রিটিং (greeting) লজিক বাদ দেওয়া হলো।
  // এখন শুধুমাত্র মূল SimSimi API কলিং লজিকটি রাখা হচ্ছে, যদি না কোনো কমান্ড পাওয়া যায়।

  // 'baby' বা 'bot' দিয়ে শুরু হলে, পুরো মেসেজটিকে চ্যাট প্রশ্ন হিসেবে ধরা হবে
  if (
      raw.startsWith("baby ") || raw.startsWith("bot ") || raw.startsWith("bby ") ||
      raw.startsWith("জানু ") || raw.startsWith("xan ") ||
      raw.startsWith("বেপি ") || raw.startsWith("বট ") || raw.startsWith("বেবি ")
  ) {
    const query = raw
      .replace(/^(baby|bot|bby|জানু|xan|বেপি|বট|বেবি)\s+/i, "")
      .trim();
      
    if (!query) {
      // শুধু ট্রিগার শব্দ লিখলে একটি সাধারণ উত্তর দেবে
      const senderName = await Users.getNameUser(event.senderID) || "User";
      const greetings = [`বলো ${senderName}`, "হুম, আমি রেডি!", "কি কথা বলতে চাও?"];
      const randomReply = greetings[Math.floor(Math.random() * greetings.length)];
      return api.sendMessage(randomReply, event.threadID, event.messageID);
    }

    try {
        const senderName = await Users.getNameUser(event.senderID) || "User";
        const responses = await getSimsimiResponse(query, senderName);
        
        for (const reply of responses) {
          await sendMessage(api, event, reply, true);
        }
    } catch (err) {
      console.error("Error in handleEvent chat:", err);
      // এখানেও সাধারণ বার্তা দেওয়া হলো
      return api.sendMessage(`❌ | চ্যাটিং এর সময় একটি সমস্যা হয়েছে।`, event.threadID, event.messageID);
    }
  }
};
