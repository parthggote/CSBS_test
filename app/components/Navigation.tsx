import Image from "next/image";

export function Navigation() {
  return (
    <nav className="flex items-center p-4 bg-white shadow-md">
      <img src="/kit-logo.png" alt="KIT College of Engineering Logo" width={160} height={80} style={{ display: 'block' }} />
      {/* Add navigation links or user menu here if needed */}
    </nav>
  );
} 