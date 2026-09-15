import "../globals.css";

export const metadata = {
  title: "Quản trị hệ thống - Giới Trẻ BRVT",
  description: "Trang quản trị nội dung website Giới trẻ Giáo phận Bà Rịa",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body style={{ backgroundColor: '#f1f5f9', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
