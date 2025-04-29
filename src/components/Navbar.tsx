import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-slate-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex flex-col">
          <Link href="/" className="text-xl font-semibold flex items-center">
            StardustStudio<span className="text-xs align-top ml-1">©</span>
          </Link>
          <span className="text-sm text-gray-300">A High-Resolution AI Image Generator</span>
        </div>
        <div className="space-x-4">
          <Link href="/" className="hover:text-blue-200 transition-colors">
            Home
          </Link>
        </div>
      </div>
    </nav>
  );
} 