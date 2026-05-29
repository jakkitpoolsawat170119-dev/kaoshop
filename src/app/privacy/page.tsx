import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว | KaoShop",
  description: "นโยบายความเป็นส่วนตัวของเว็บไซต์ KaoShop",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">นโยบายความเป็นส่วนตัว</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">มีผลบังคับใช้: 1 มกราคม 2568</p>

      <div className="space-y-8 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">1. ข้อมูลที่เราเก็บรวบรวม</h2>
          <p className="mb-2">KaoShop เก็บรวบรวมข้อมูลดังต่อไปนี้:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>ข้อมูลการใช้งาน เช่น หน้าที่เข้าชม จำนวนครั้งที่คลิก</li>
            <li>ข้อมูลที่เบราว์เซอร์ส่งโดยอัตโนมัติ เช่น IP address, ประเภทเบราว์เซอร์</li>
            <li>ข้อมูลจาก Cookies เพื่อวิเคราะห์การใช้งาน</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">2. วัตถุประสงค์การใช้ข้อมูล</h2>
          <p className="mb-2">เราใช้ข้อมูลเพื่อ:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>ปรับปรุงเนื้อหาและประสบการณ์การใช้งาน</li>
            <li>วิเคราะห์สถิติการเข้าชมเว็บไซต์</li>
            <li>ติดตามประสิทธิภาพของลิงก์ Affiliate</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">3. การแบ่งปันข้อมูล</h2>
          <p>KaoShop ไม่ขาย จำหน่าย หรือแบ่งปันข้อมูลส่วนบุคคลของคุณให้กับบุคคลที่สาม ยกเว้นในกรณีที่กฎหมายกำหนดหรือเพื่อปฏิบัติตามคำสั่งศาล</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">4. บริการของบุคคลที่สาม</h2>
          <p className="mb-2">เว็บไซต์ใช้บริการจากบุคคลที่สาม ได้แก่:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Shopee Affiliate</strong> — ติดตามการคลิกและการซื้อ</li>
            <li><strong>TikTok API</strong> — เผยแพร่เนื้อหาบน TikTok โดยอัตโนมัติ</li>
            <li><strong>Facebook API</strong> — เผยแพร่เนื้อหาบน Facebook Page</li>
            <li><strong>Line Messaging API</strong> — ส่งข้อความแจ้งเตือนบทความใหม่</li>
            <li><strong>OpenAI API</strong> — สร้าง caption สำหรับโซเชียลมีเดีย</li>
          </ul>
          <p className="mt-2">แต่ละบริการมีนโยบายความเป็นส่วนตัวของตนเอง</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">5. Cookies</h2>
          <p>เว็บไซต์ใช้ Cookies เพื่อจดจำการตั้งค่าและวิเคราะห์การใช้งาน คุณสามารถปิด Cookies ในเบราว์เซอร์ได้ แต่อาจส่งผลต่อการทำงานของบางฟีเจอร์</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">6. ความปลอดภัยของข้อมูล</h2>
          <p>เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูล อย่างไรก็ตาม ไม่มีระบบใดที่ปลอดภัย 100% จากการโจมตีทางไซเบอร์</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">7. สิทธิ์ของคุณ</h2>
          <p>คุณมีสิทธิ์ขอเข้าถึง แก้ไข หรือลบข้อมูลที่เราเก็บรวบรวม โดยติดต่อผ่านหน้า <a href="/contact" className="text-orange-500 hover:underline">ติดต่อเรา</a></p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">8. การเปลี่ยนแปลงนโยบาย</h2>
          <p>KaoShop สงวนสิทธิ์ในการแก้ไขนโยบายนี้ได้ตลอดเวลา การเปลี่ยนแปลงจะมีผลเมื่อเผยแพร่บนหน้านี้</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">9. ติดต่อเรา</h2>
          <p>หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว กรุณาติดต่อผ่านหน้า <a href="/contact" className="text-orange-500 hover:underline">ติดต่อเรา</a></p>
        </section>
      </div>
    </div>
  );
}
