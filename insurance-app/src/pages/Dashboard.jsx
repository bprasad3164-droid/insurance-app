export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-200 w-full p-6 flex flex-col items-center">
      <header className="flex justify-between clay p-4 mb-6 w-full max-w-4xl">
        <h1 className="text-xl font-bold">Insurance Portal</h1>
        <nav className="space-x-4">
          <a href="#" className="hover:text-blue-600 transition-colors">Home</a>
          <a href="#" className="hover:text-blue-600 transition-colors">About</a>
        </nav>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
        <a href="/admin" className="clay p-10 text-center font-bold text-lg hover:scale-105 transition-transform">Admin Login</a>
        <a href="/user" className="clay p-10 text-center font-bold text-lg hover:scale-105 transition-transform">User Login</a>
        <a href="/agent" className="clay p-10 text-center font-bold text-lg hover:scale-105 transition-transform">Agent Login</a>
      </div>
    </div>
  );
}
