
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CreateAuction from './pages/CreateAuction';
import AuctionDetail from './pages/AuctionDetail';
import BidScreen from './pages/BidScreen';
import BidderDashboard from './pages/BidderDashboard';
import PlayerDashboard from './pages/PlayerDashboard';
import JoinAuction from './pages/JoinAuction';
import LiveAuction from './pages/LiveAuction';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join/:code" element={<JoinAuction />} />
          
          {/* Main App Routes (authenticated) */}
          <Route element={<AppLayout />}>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Organizer Routes */}
            <Route path="/organizer" element={<OrganizerDashboard />} />
            <Route path="/organizer/create" element={<CreateAuction />} />
            <Route path="/organizer/auction/:id" element={<AuctionDetail />} />
            <Route path="/organizer/auction/:id/bid" element={<BidScreen />} />
            
            {/* Bidder Routes */}
            <Route path="/bidder" element={<BidderDashboard />} />

            {/* Player Routes */}
            <Route path="/player" element={<PlayerDashboard />} />
            
            {/* Common Authenticated Routes */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/auction/:id" element={<LiveAuction />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;