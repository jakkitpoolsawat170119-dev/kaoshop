import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-3">KaoShop</h3>
            <p className="text-sm">
              เว็บรีวิวสินค้าและจัดอันดับที่ดีที่สุด
              ช่วยให้คุณตัดสินใจซื้อสินค้าได้ง่ายขึ้น
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">หมวดหมู่ยอดนิยม</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/category/electronics" className="hover:text-white">
                  อิเล็กทรอนิกส์
                </Link>
              </li>
              <li>
                <Link href="/category/beauty" className="hover:text-white">
                  ความงาม
                </Link>
              </li>
              <li>
                <Link href="/category/home" className="hover:text-white">
                  ของใช้ในบ้าน
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">เกี่ยวกับเรา</h4>
            <p className="text-sm">
              KaoShop รีวิวสินค้าอย่างตรงไปตรงมา
              เราอาจได้รับค่าคอมมิชชันจากลิงก์ในบทความ
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} KaoShop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
