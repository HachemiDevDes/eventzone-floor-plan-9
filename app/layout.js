import "./globals.css";

export const metadata = {
  title: "Eventzone | Premium Event Platform",
  description: "A premium event organizer platform to design floor layouts and manage schedules.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

