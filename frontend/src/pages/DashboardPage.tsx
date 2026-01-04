import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  UserCog,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';

interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalGroups: number;
  upcomingEvents: number;
  activeUsers: number;
}

interface RecentEvent {
  _id: string;
  title: string;
  date: string;
  attendees: number;
  status: 'upcoming' | 'ongoing' | 'past';
}

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  roles: string[];
}

// Mock data
const mockStats: DashboardStats = {
  totalUsers: 47,
  totalEvents: 12,
  totalGroups: 5,
  upcomingEvents: 8,
  activeUsers: 43,
};

const mockRecentEvents: RecentEvent[] = [
  {
    _id: '1',
    title: 'Kör Repetition',
    date: '2026-01-10T18:00:00Z',
    attendees: 24,
    status: 'upcoming',
  },
  {
    _id: '2',
    title: 'Orkester Övning',
    date: '2026-01-12T19:00:00Z',
    attendees: 18,
    status: 'upcoming',
  },
  {
    _id: '7',
    title: 'Obligatoriskt säkerhetsmöte',
    date: '2026-01-08T19:00:00Z',
    attendees: 1,
    status: 'upcoming',
  },
];

const mockUser: User = {
  _id: 'user1',
  firstname: 'Anna',
  lastname: 'Andersson',
  roles: ['user', 'groupmanager', 'manager'],
};

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(mockUser);
  const [stats] = useState<DashboardStats>(mockStats);
  const [recentEvents] = useState<RecentEvent[]>(mockRecentEvents);
  const [_isLoading, _setIsLoading] = useState(false);

  useEffect(() => {
    // Get user from localStorage or use mock
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // In real app, fetch dashboard data from API
    // fetchDashboardData();
  }, []);

  const isManager = user.roles.includes('manager');
  const isAdmin = user.roles.includes('admin');
  const isGroupManager = user.roles.includes('groupmanager');

  const canViewDashboard = isManager || isAdmin || isGroupManager;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock size={16} className="text-karspex-gold" />;
      case 'ongoing':
        return <CheckCircle2 size={16} className="text-green-600" />;
      case 'past':
        return <XCircle size={16} className="text-karspex-gray-800" />;
      default:
        return null;
    }
  };

  if (!canViewDashboard) {
    return (
      <div className="min-h-screen flex flex-col bg-karspex-burgundy">
        <Header />
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-karspex-cream rounded-lg shadow-md p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-karspex-red mb-4" />
            <h2 className="text-2xl font-bold text-karspex-black mb-4">Access Denied</h2>
            <p className="text-karspex-gray-800 mb-6">
              You don't have permission to view the dashboard.
            </p>
            <Button onClick={() => navigate('/events')}>Go to Events</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-karspex-burgundy">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-karspex-cream">
            Welcome back, {user.firstname}! Here's an overview of your organization.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-karspex-cream rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-karspex-burgundy bg-opacity-10 rounded-lg">
                <Users size={24} className="text-karspex-burgundy" />
              </div>
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-karspex-black mb-1">{stats.totalUsers}</h3>
            <p className="text-sm text-karspex-gray-800">Total Users</p>
            <p className="text-xs text-green-600 mt-2">{stats.activeUsers} active</p>
          </div>

          {/* Total Events */}
          <div className="bg-karspex-cream rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-karspex-burgundy bg-opacity-10 rounded-lg">
                <Calendar size={24} className="text-karspex-burgundy" />
              </div>
              <span className="text-xs font-medium text-karspex-gold bg-karspex-gold bg-opacity-10 px-2 py-1 rounded">
                {stats.upcomingEvents} upcoming
              </span>
            </div>
            <h3 className="text-2xl font-bold text-karspex-black mb-1">{stats.totalEvents}</h3>
            <p className="text-sm text-karspex-gray-800">Total Events</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => navigate('/events')}
            >
              View All
            </Button>
          </div>

          {/* Total Groups */}
          <div className="bg-karspex-cream rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-karspex-burgundy bg-opacity-10 rounded-lg">
                <UserCog size={24} className="text-karspex-burgundy" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-karspex-black mb-1">{stats.totalGroups}</h3>
            <p className="text-sm text-karspex-gray-800">Total Groups</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => navigate('/groups')}
            >
              Manage
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Events */}
          <div className="bg-karspex-cream rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-karspex-black">Recent Events</h2>
              <Button variant="outline" size="sm" onClick={() => navigate('/events')}>
                View All
              </Button>
            </div>

            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div
                  key={event._id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-karspex-gray-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(event.status)}
                    <div className="flex-1">
                      <h4 className="font-medium text-karspex-black">{event.title}</h4>
                      <p className="text-xs text-karspex-gray-800">{formatDate(event.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-karspex-black">{event.attendees}</p>
                    <p className="text-xs text-karspex-gray-800">attendees</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-karspex-cream rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-karspex-black mb-6">Quick Actions</h2>

            <div className="space-y-3">
              <Button className="w-full justify-start" onClick={() => navigate('/events')}>
                <Calendar size={20} className="mr-3" />
                Create New Event
              </Button>

              {(isManager || isAdmin || isGroupManager) && (
                <Button className="w-full justify-start" onClick={() => navigate('/groups')}>
                  <UserCog size={20} className="mr-3" />
                  Manage Groups
                </Button>
              )}

              {(isManager || isAdmin) && (
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => navigate('/users')}
                >
                  <Users size={20} className="mr-3" />
                  View All Users
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default DashboardPage;
