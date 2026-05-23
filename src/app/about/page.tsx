import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เกี่ยวกับ KaoShop | เว็บรีวิวสินค้าออนไลน์",
  description: "KaoShop รีวิวสินค้าออนไลน์อย่างตรงไปตรงมา ช่วยให้คุณตัดสินใจซื้อสินค้าได้ง่ายขึ้น",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">เกี่ยวกับ KaoShop</h1>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-800">
          <p className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-2">เราคือใคร?</p>
          <p>KaoShop คือเว็บไซต์รีวิวสินค้าออนไลน์ที่รวบรวมรีวิวสินค้าคุณภาพจากหลากหลายหมวดหมู่ ไม่ว่าจะเป็นสินค้าอิเล็กทรอนิกส์ สุขภาพ หนังสือ และอีกมากมาย</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">เป้าหมายของเรา</h2>
          <p>เราต้องการช่วยให้คุณตัดสินใจซื้อสินค้าได้อย่างมั่นใจ ด้วยข้อมูลรีวิวที่ตรงไปตรงมา มีคะแนนประเมิน จุดเด่น และจุดด้อยของแต่ละสินค้า</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Affiliate Disclosure</h2>
          <p>KaoShop เป็นส่วนหนึ่งของโปรแกรม Affiliate ของ Shopee เมื่อคุณซื้อสินค้าผ่านลิงก์ในเว็บของเรา เราอาจได้รับค่าคอมมิชชั่นเล็กน้อย โดยไม่มีค่าใช้จ่ายเพิ่มเติมจากคุณ ทั้งนี้ไม่มีผลต่อความเป็นกลางในการรีวิวของเรา</p>
        </div>
      </div>
    </div>
  );
}
