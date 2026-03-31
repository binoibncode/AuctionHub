

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-dark-500 mt-2">Manage users and global platform settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-xl font-bold text-white">Total Users</h3>
          <p className="text-4xl text-primary-500 font-bold mt-2">1,245</p>
        </div>
        <div className="card p-6">
          <h3 className="text-xl font-bold text-white">Active Auctions</h3>
          <p className="text-4xl text-accent-500 font-bold mt-2">12</p>
        </div>
        <div className="card p-6">
          <h3 className="text-xl font-bold text-white">Total Revenue</h3>
          <p className="text-4xl text-green-500 font-bold mt-2">$45.2k</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4 text-dark-500">
          <p>System operational.</p>
        </div>
      </div>
    </div>
  );
}
