import Link from "next/link";

// TODO: ใส่ link จริงเมื่อสร้างช่องทางแล้ว
const SOCIAL_LINKS = {
  facebook: "https://facebook.com/kaoshop",
  line: "https://line.me/ti/p/@kaoshop",
  tiktok: "https://tiktok.com/@kaoshop",
};

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-3">KaoShop</h3>
            <p className="text-sm mb-4">
              เว็บรีวิวสินค้าและจัดอันดับที่ดีที่สุด
              ช่วยให้คุณตัดสินใจซื้อสินค้าได้ง่ายขึ้น
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-blue-600 text-gray-400 hover:text-white p-2 rounded-full transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href={SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-gray-600 text-gray-400 hover:text-white p-2 rounded-full transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon />
              </a>
              <a
                href={SOCIAL_LINKS.line}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-green-600 text-gray-400 hover:text-white p-2 rounded-full transition-colors"
                aria-label="Line"
              >
                <LineIcon />
              </a>
            </div>
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
                <Link href="/category/health" className="hover:text-white">
                  สุขภาพ
                </Link>
              </li>
              <li>
                <Link href="/category/headphones" className="hover:text-white">
                  หูฟัง
                </Link>
              </li>
              <li>
                <Link href="/category/books" className="hover:text-white">
                  หนังสือ
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
