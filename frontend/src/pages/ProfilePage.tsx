import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { authAPI } from '../utils/api';

interface User {
  _id: string;
  email: string;
  firstname: string;
  lastname: string;
  nickname?: string;
  roles: string[];
  active: boolean;
  foodpreference?: string;
  allergys?: string;
  personnummer?: string;
  groups?: string[];
  driversLicense?: boolean;
  truckLicense?: boolean;
}

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-karspex-burgundy flex items-center justify-center">
        <div className="text-karspex-cream text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-karspex-burgundy flex flex-col">
      <Header />
      <div className="grow py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-karspex-cream rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-karspex-black mb-2">
                Welcome back, {user.nickname || user.firstname}!
              </h1>
              <p className="text-karspex-black">
                {user.firstname} {user.lastname}
              </p>
            </div>

            <div className="space-y-6">
              <div className="border-t border-karspex-black/10 pt-6">
                <h2 className="text-xl font-semibold text-karspex-black mb-4">Your Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-karspex-black/60">Email</p>
                    <p className="text-karspex-black font-medium">{user.email}</p>
                  </div>
                  {user.personnummer && (
                    <div>
                      <p className="text-sm text-karspex-black/60">Personnummer</p>
                      <p className="text-karspex-black font-medium">{user.personnummer}</p>
                    </div>
                  )}
                  {user.foodpreference && (
                    <div>
                      <p className="text-sm text-karspex-black/60">Food Preference</p>
                      <p className="text-karspex-black font-medium">{user.foodpreference}</p>
                    </div>
                  )}
                  {user.allergys && (
                    <div>
                      <p className="text-sm text-karspex-black/60">Allergies</p>
                      <p className="text-karspex-black font-medium">{user.allergys}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-karspex-black/60">Licenses</p>
                    <div className="flex gap-2 mt-1">
                      {user.driversLicense && (
                        <span className="bg-karspex-gold/20 text-karspex-black px-3 py-1 rounded-full text-sm">
                          B-körkort
                        </span>
                      )}
                      {user.truckLicense && (
                        <span className="bg-karspex-gold/20 text-karspex-black px-3 py-1 rounded-full text-sm">
                          C-körkort
                        </span>
                      )}
                      {!user.driversLicense && !user.truckLicense && (
                        <span className="text-karspex-black/60 text-sm">None</span>
                      )}
                    </div>
                  </div>
                  {user.groups && user.groups.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-karspex-black/60">Groups</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {user.groups.map((group) => (
                          <span
                            key={group}
                            className="bg-karspex-burgundy text-karspex-cream px-3 py-1 rounded-full text-sm"
                          >
                            {group}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-karspex-black/60">Status</p>
                    <p className="text-karspex-black font-medium">
                      {user.active ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-red-600">Inactive</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-karspex-black/60">Roles</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="bg-karspex-red text-karspex-cream px-3 py-1 rounded-full text-sm"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProfilePage;
