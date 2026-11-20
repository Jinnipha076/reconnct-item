const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://fbkbcbdoydmpgpbwrafk.supabase.co";
const SUPABASE_KEY = "sb_publishable_0vkbDyvp79jaTEDHsA3obw_-VblR__i";

const COMMUNITY_USERS = [
  {
    email: "somchai.community2026@gmail.com",
    name: "สมชาย ใจดี",
    emoji: "👨‍💼",
    posts: [
      {
        type: "lost",
        status: "searching",
        category: "keys",
        title: "ทำกุญแจรถยนต์ Honda City หล่นหาย แถวลานจอดรถ",
        description: "ทำกุญแจรถยนต์รีโมทสีดำหล่นหาย มีพวงกุญแจหมีสีน้ำตาลใส่เสื้อฮู้ดสีเขียว ใครเก็บได้ช่วยติดต่อด้วยครับ เดือดร้อนมากต้องใช้รถ",
        marks: "พวงกุญแจมีสติกเกอร์รูปดาวเล็กๆ แปะด้านหลัง และมีกุญแจบ้านสีเงินอีก 1 ดอกห้อยอยู่ด้วยกัน",
        location_text: "ลานจอดรถหน้าอาคารเรียนรวม มรภ.บุรีรัมย์",
        latitude: 14.9962,
        longitude: 103.1045,
        image_emoji: "🔑",
        image_hue: 340,
        happened_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
      {
        type: "found",
        status: "searching",
        category: "bag",
        title: "พบกระเป๋าเป้สีดำ ลืมไว้ที่ป้ายรถเมล์",
        description: "พบกระเป๋าเป้สะพายหลังสีดำ ยี่ห้อ Anello สภาพดี วางลืมไว้บนที่นั่งป้ายรถเมล์ ข้างในมีร่มพับและขวดน้ำเก็บความเย็น",
        marks: "ในกระเป๋ามีพวงกุญแจไฟฉายเล็กๆ และสมุดจดชื่อวิชาเขียนด้วยลายมือสีน้ำเงิน",
        location_text: "ป้ายรถประจำทาง หน้าสวนจตุจักร, กรุงเทพฯ",
        latitude: 13.8034,
        longitude: 100.5539,
        image_emoji: "🎒",
        image_hue: 145,
        happened_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    email: "praew.student2026@gmail.com",
    name: "น้องแพรว มรภ.",
    emoji: "👩‍🎓",
    posts: [
      {
        type: "lost",
        status: "searching",
        category: "wallet",
        title: "ทำกระเป๋าสตางค์ใบสั้นสีน้ำตาลหล่นหาย",
        description: "กระเป๋าสตางค์แบบพับใบสั้น ยี่ห้อ Charles & Keith สีน้ำตาลเข้ม ข้างในมีเงินสดนิดหน่อยและบัตรประชาชน บัตรนักศึกษา",
        marks: "มีรูปถ่ายครอบครัวขนาด 1 นิ้วซ่อนอยู่ในช่องใส่แบงก์ชั้นในสุด",
        location_text: "โรงอาหารกลาง มหาวิทยาลัย",
        latitude: 14.9940,
        longitude: 103.1020,
        image_emoji: "👛",
        image_hue: 30,
        happened_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      },
      {
        type: "found",
        status: "arranging",
        category: "electronics",
        title: "พบ iPad Air สีเทา ลืมไว้ที่โต๊ะอ่านหนังสือ",
        description: "พบ iPad ใส่เคสพับสีเขียวมิ้นต์ วางลืมไว้บนโต๊ะอ่านหนังสือชั้น 2 ของหอสมุด ฝากไว้ที่เคาน์เตอร์บรรณารักษ์แล้ว",
        marks: "วอลเปเปอร์หน้าจอล็อกเป็นรูปตัวการ์ตูนอะนิเมะ และเคสมีสติกเกอร์รูปกาแฟแปะอยู่",
        location_text: "หอสมุดกลาง ชั้น 2 โซนอ่านหนังสือ",
        latitude: 14.9958,
        longitude: 103.1032,
        image_emoji: "📱",
        image_hue: 195,
        happened_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    email: "karn.tech2026@gmail.com",
    name: "กานต์ พิชิตชัย",
    emoji: "🧑‍💻",
    posts: [
      {
        type: "lost",
        status: "searching",
        category: "electronics",
        title: "ลืมเคสใส่หูฟัง AirPods Pro 2 บนขบวนรถไฟฟ้า",
        description: "น่าจะทำหล่นแถวที่นั่งริมประตูขบวนรถไฟฟ้า BTS ฝั่งมุ่งหน้าหมอชิต เคสซิลิโคนสีดำด้าน มีรอยขีดข่วนเล็กน้อย",
        marks: "เคสเปิดมาข้างในมีสลักชื่อย่อตัวอักษร FY ตรงฝาด้านใน และหูฟังข้างซ้ายแบตเตอรี่หมด",
        location_text: "BTS สยาม, กรุงเทพฯ",
        latitude: 13.7456,
        longitude: 100.5342,
        image_emoji: "📱",
        image_hue: 195,
        happened_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      },
      {
        type: "found",
        status: "searching",
        category: "keys",
        title: "พบพวงกุญแจห้องพร้อมคีย์การ์ดสีขาว ตกข้างทางเดิน",
        description: "เก็บพวงกุญแจลูกบิด 2 ดอก มีคีย์การ์ดสแกนประตูหอพักสีขาวตกอยู่ข้างทางเดินฟุตบาท",
        marks: "พวงกุญแจเป็นตุ๊กตาแคร์แบร์สีชมพู และมีป้ายตัวเลขห้องเขียนด้วยปากกาเคมี",
        location_text: "ทางเดินฟุตบาท ซอยหอพักนักศึกษา",
        latitude: 14.9930,
        longitude: 103.1008,
        image_emoji: "🔑",
        image_hue: 340,
        happened_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    email: "nong.ploy2026@gmail.com",
    name: "น้องพลอย สยาม",
    emoji: "👧",
    posts: [
      {
        type: "lost",
        status: "searching",
        category: "pet",
        title: "ตามหาน้องแมวสีส้ม (น้องส้มโอ) หลุดออกจากบ้าน",
        description: "น้องส้มโอ แมวลายสลิดส้ม เพศผู้ อายุ 1 ปี น้องค่อนข้างตื่นคน ไม่ดุ ใส่ปลอกคอสีแดงมีกระดิ่งสีทอง หายไปเมื่อช่วงเย็นวานนี้",
        marks: "ปลายหางมีรอยหักงอเล็กน้อย ปลอกคอมีจี้ป้ายชื่อระบุเบอร์โทรข้างหลัง",
        location_text: "ซอยรามคำแหง 24 แยก 12, บางกะปิ",
        latitude: 13.7550,
        longitude: 100.6210,
        image_emoji: "🐾",
        image_hue: 25,
        happened_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
      {
        type: "found",
        status: "searching",
        category: "jewelry",
        title: "พบสร้อยข้อมือโซ่เงินเส้นเล็ก หล่นในห้องน้ำหญิง",
        description: "เจอสร้อยข้อมือเงินแท้ลายโซ่เส้นเล็ก วางลืมไว้ตรงอ่างล้างมือห้องน้ำหญิงชั้น 1 เจ้าของติดต่อแจ้งตำหนิเพื่อขอรับคืนได้เลยค่ะ",
        marks: "มีจี้ห้อยรูปพระจันทร์เสี้ยวขนาดเล็กมาก และมีตะขอล็อกแบบก้ามปู",
        location_text: "ห้องน้ำหญิง ชั้น 1 อาคารนวัตกรรม",
        latitude: 14.9948,
        longitude: 103.1040,
        image_emoji: "💍",
        image_hue: 50,
        happened_at: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    email: "lung.sombat2026@gmail.com",
    name: "ลุงสมบัติ รปภ.",
    emoji: "👮‍♂️",
    posts: [
      {
        type: "lost",
        status: "searching",
        category: "documents",
        title: "ลืมแฟ้มเอกสารรายงานโครงงานวิจัยไว้ที่ม้านั่ง",
        description: "แฟ้มใส่เอกสารรายงานการประชุมและวิจัยสีน้ำเงิน มีสมุดโน้ตสันห่วงสีครีมอยู่ด้านใน สำคัญมากเพราะต้องส่งอาจารย์สัปดาห์นี้",
        marks: "หน้าแรกของสมุดมีตราประทับตราโรงพยาบาล และกระดาษโพสต์อิทสีเหลืองแปะอยู่",
        location_text: "ม้านั่งใต้ต้นไม้ หน้าตึกวิทยาศาสตร์",
        latitude: 14.9975,
        longitude: 103.1015,
        image_emoji: "🪪",
        image_hue: 210,
        happened_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
      },
      {
        type: "found",
        status: "searching",
        category: "documents",
        title: "เจอบัตรประชาชนและบัตร ATM ตกอยู่ตรงตู้กดเงิน",
        description: "พบบัตรประชาชนพร้อมบัตร ATM ธนาคารกสิกรไทย ตกอยู่บนแป้นพิมพ์ตู้ ATM หน้าร้านสะดวกซื้อ เจ้าของมารับคืนได้ครับ",
        marks: "เลขบัตรประชาชน 3 ตัวท้ายคือ XXX และมีเงินสด 100 บาทเหน็บอยู่หลังบัตร",
        location_text: "หน้าร้าน 7-Eleven สาขาหน้า มรภ.บุรีรัมย์",
        latitude: 14.9982,
        longitude: 103.1055,
        image_emoji: "🪪",
        image_hue: 210,
        happened_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      },
    ],
  },
];

async function run() {
  const fuyumiSupabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // 1. Delete all posts owned by Fuyumi
  const { data: fuyumiAuth } = await fuyumiSupabase.auth.signInWithPassword({
    email: "fuyumi638@gmail.com",
    password: "ReunitePass2026!#Secure",
  });

  if (fuyumiAuth?.user) {
    const { data: del, error: delErr } = await fuyumiSupabase
      .from("posts")
      .delete()
      .eq("user_id", fuyumiAuth.user.id);
    console.log("Deleted Fuyumi's previous posts:", delErr ? delErr.message : "Done!");
  }

  // 2. Insert posts for each community member
  for (const user of COMMUNITY_USERS) {
    const userClient = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data: auth, error: signErr } = await userClient.auth.signInWithPassword({
      email: user.email,
      password: "CommunityUser2026!#Safe",
    });

    if (signErr || !auth?.user) {
      console.error("Sign in failed for", user.name, signErr?.message);
      continue;
    }

    const uid = auth.user.id;

    // Update profile emoji & verified
    await userClient
      .from("profiles")
      .update({ avatar_emoji: user.emoji, verified: true, reputation: 4.9 })
      .eq("id", uid);

    // Prepare user's posts
    const userPosts = user.posts.map((p) => ({ ...p, user_id: uid }));

    const { data: inserted, error: insErr } = await userClient
      .from("posts")
      .insert(userPosts)
      .select("id, title");

    if (insErr) {
      console.error("Insert error for", user.name, insErr.message);
    } else {
      console.log(`Inserted ${inserted.length} posts for [${user.name} ${user.emoji}]`);
    }
  }

  console.log("ALL 10 POSTS REASSIGNED TO COMMUNITY MEMBERS SUCCESSFULLY!");
}

run();
