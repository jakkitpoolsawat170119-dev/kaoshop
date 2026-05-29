import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ข้อกำหนดการใช้งาน | KaoShop",
  description: "ข้อกำหนดและเงื่อนไขการใช้งานเว็บไซต์ KaoShop",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">ข้อกำหนดการใช้งาน</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">มีผลบังคับใช้: 1 มกราคม 2568</p>

      <div className="space-y-8 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">1. การยอมรับข้อกำหนด</h2>
          <p>การเข้าใช้งานเว็บไซต์ KaoShop (kaoshop-omega.vercel.app) ถือว่าคุณยอมรับข้อกำหนดและเงื่อนไขการใช้งานทั้งหมดที่ระบุในหน้านี้ หากไม่เห็นด้วย กรุณาหยุดใช้งานเว็บไซต์</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">2. บริการที่ให้</h2>
          <p>KaoShop ให้บริการรีวิวสินค้าออนไลน์และลิงก์ Affiliate ไปยังแพลตฟอร์ม e-commerce เพื่อช่วยผู้บริโภคในการตัดสินใจซื้อสินค้า</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">3. Affiliate Disclosure</h2>
          <p>KaoShop เข้าร่วมโปรแกรม Affiliate ของ Shopee และแพลตฟอร์มอื่น เมื่อคุณซื้อสินค้าผ่านลิงก์ในเว็บไซต์ เราอาจได้รับค่าคอมมิชชั่น โดยไม่มีค่าใช้จ่ายเพิ่มเติมจากคุณ</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">4. ทรัพย์สินทางปัญญา</h2>
          <p>เนื้อหาทั้งหมดในเว็บไซต์ ได้แก่ บทความ รูปภาพ โลโก้ และการออกแบบ เป็นทรัพย์สินของ KaoShop ห้ามนำไปใช้โดยไม่ได้รับอนุญาต</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">5. การจำกัดความรับผิด</h2>
          <p>KaoShop ไม่รับผิดชอบต่อความเสียหายใด ๆ ที่เกิดจากการใช้ข้อมูลในเว็บไซต์ หรือการซื้อสินค้าผ่านลิงก์ที่แนะนำ ราคาและรายละเอียดสินค้าอาจเปลี่ยนแปลงได้ตามที่ผู้ขายกำหนด</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">6. การเชื่อมต่อกับโซเชียลมีเดีย</h2>
          <p>KaoShop ใช้ TikTok API, Facebook API และ Line Messaging API เพื่อเผยแพร่เนื้อหารีวิวสินค้าบนแพลตฟอร์มโซเชียลมีเดีย การโพสต์ดังกล่าวดำเนินการโดยอัตโนมัติโดยเจ้าของบัญชี KaoShop เท่านั้น</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">7. การเปลี่ยนแปลงข้อกำหนด</h2>
          <p>KaoShop สงวนสิทธิ์ในการแก้ไขข้อกำหนดเหล่านี้ได้ตลอดเวลา การเปลี่ยนแปลงจะมีผลทันทีเมื่อเผยแพร่บนเว็บไซต์</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">8. ติดต่อเรา</h2>
          <p>หากมีคำถามเกี่ยวกับข้อกำหนดการใช้งาน กรุณาติดต่อผ่านหน้า <a href="/contact" className="text-orange-500 hover:underline">ติดต่อเรา</a></p>
        </section>
      </div>
    </div>
  );
}
