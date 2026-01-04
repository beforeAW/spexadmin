import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit2, Trash2, Users } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import FormField from '../components/FormField';
import Select from '../components/Select';
import { authAPI, userAPI } from '../utils/api';

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  nickname?: string;
  email: string;
  personnummer?: string;
  roles: string[];
  foodpreference?: string;
  allergys?: string[];
  groups?: string[];
  createdAt: string;
}

interface CurrentUser {
  _id: string;
  firstname: string;
  lastname: string;
  roles: string[];
}

function UserManagementPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state for editing
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    nickname: '',
    email: '',
    roles: [] as string[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [userData, usersData] = await Promise.all([
          authAPI.getCurrentUser(),
          userAPI.getAll(),
        ]);

        setCurrentUser(userData);
        setUsers(usersData.users);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const canManageUsers =
    currentUser?.roles.includes('manager') || currentUser?.roles.includes('admin');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleToggle = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const filterUsers = () => {
    return users.filter((user) => {
      const matchesSearch =
        user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.nickname && user.nickname.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);

      return matchesSearch && matchesRole;
    });
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstname: user.firstname,
      lastname: user.lastname,
      nickname: user.nickname || '',
      email: user.email,
      roles: user.roles,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    try {
      await userAPI.update(selectedUser._id, {
        firstname: formData.firstname,
        lastname: formData.lastname,
        nickname: formData.nickname || undefined,
        email: formData.email,
        roles: formData.roles,
      });

      // Refresh users list
      const updatedUsers = await userAPI.getAll();
      setUsers(updatedUsers.users);
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await userAPI.delete(selectedUser._id);

      // Refresh users list
      const updatedUsers = await userAPI.getAll();
      setUsers(updatedUsers.users);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-karspex-red text-white';
      case 'manager':
        return 'bg-karspex-burgundy text-white';
      case 'groupmanager':
        return 'bg-karspex-gold text-karspex-black';
      case 'eventmanager':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-karspex-gray-100 text-karspex-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-karspex-burgundy">
        <Header />
        <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-karspex-cream rounded-lg shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-karspex-burgundy mb-4"></div>
            <p className="text-karspex-gray-800">Loading users...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!canManageUsers) {
    return (
      <div className="min-h-screen flex flex-col bg-karspex-burgundy">
        <Header />
        <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-karspex-cream rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-karspex-black mb-4">Access Denied</h2>
            <p className="text-karspex-gray-800 mb-6">
              You don't have permission to view user management.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const filteredUsers = filterUsers();

  return (
    <div className="min-h-screen flex flex-col bg-karspex-burgundy">
      <Header />

      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-karspex-cream">View and manage all users in the system</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-karspex-cream rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-karspex-gray-800"
              />
              <Input
                type="text"
                placeholder="Search by name, nickname, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="groupmanager">Group Manager</option>
              <option value="eventmanager">Event Manager</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </Select>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-karspex-gray-800">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>
        </div>

        {/* Users Table - Desktop */}
        <div className="hidden lg:block bg-karspex-cream rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-karspex-gray-100">
              <thead className="bg-karspex-burgundy">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-karspex-gray-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-karspex-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10 bg-karspex-burgundy rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.firstname[0]}
                            {user.lastname[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-karspex-black">
                            {user.firstname} {user.lastname}
                          </div>
                          {user.nickname && (
                            <div className="text-xs text-karspex-gray-800">"{user.nickname}"</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-karspex-gray-800">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className={`px-2 py-1 text-xs font-medium rounded ${getRoleBadgeColor(
                              role
                            )}`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-karspex-gray-800">
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openViewModal(user)}
                        className="text-karspex-burgundy hover:text-karspex-gold mr-3"
                        title="View Details"
                      >
                        <Users size={18} />
                      </button>
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-karspex-burgundy hover:text-karspex-gold mr-3"
                        title="Edit User"
                      >
                        <Edit2 size={18} />
                      </button>
                      {user._id !== currentUser?._id && (
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="text-karspex-red hover:text-red-700"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-karspex-gray-800 mb-4" />
              <p className="text-karspex-gray-800">No users found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Users Cards - Mobile/Tablet */}
        <div className="lg:hidden space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-karspex-cream rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="shrink-0 h-12 w-12 bg-karspex-burgundy rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user.firstname[0]}
                      {user.lastname[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-karspex-black truncate">
                      {user.firstname} {user.lastname}
                    </h3>
                    {user.nickname && (
                      <p className="text-xs text-karspex-gray-800">"{user.nickname}"</p>
                    )}
                    <p className="text-xs text-karspex-gray-800 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex space-x-2 ml-2">
                  <button
                    onClick={() => openViewModal(user)}
                    className="text-karspex-burgundy hover:text-karspex-gold"
                    title="View Details"
                  >
                    <Users size={18} />
                  </button>
                  <button
                    onClick={() => openEditModal(user)}
                    className="text-karspex-burgundy hover:text-karspex-gold"
                    title="Edit User"
                  >
                    <Edit2 size={18} />
                  </button>
                  {user._id !== currentUser?._id && (
                    <button
                      onClick={() => openDeleteModal(user)}
                      className="text-karspex-red hover:text-red-700"
                      title="Delete User"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className={`px-2 py-1 text-xs font-medium rounded ${getRoleBadgeColor(role)}`}
                  >
                    {role}
                  </span>
                ))}
              </div>

              <p className="text-xs text-karspex-gray-800">Joined {formatDate(user.createdAt)}</p>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="bg-karspex-cream rounded-lg shadow-md p-8 text-center">
              <Users size={48} className="mx-auto text-karspex-gray-800 mb-4" />
              <p className="text-karspex-gray-800">No users found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* View User Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedUser(null);
        }}
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-karspex-black mb-2">
                {selectedUser.firstname} {selectedUser.lastname}
                {selectedUser.nickname && ` "${selectedUser.nickname}"`}
              </h3>
            </div>

            <div>
              <label className="text-xs font-medium text-karspex-gray-800">Email</label>
              <p className="text-sm text-karspex-black">{selectedUser.email}</p>
            </div>

            {selectedUser.personnummer && (
              <div>
                <label className="text-xs font-medium text-karspex-gray-800">Personnummer</label>
                <p className="text-sm text-karspex-black">{selectedUser.personnummer}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-karspex-gray-800">Roles</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedUser.roles.map((role) => (
                  <span
                    key={role}
                    className={`px-2 py-1 text-xs font-medium rounded ${getRoleBadgeColor(role)}`}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {selectedUser.foodpreference && (
              <div>
                <label className="text-xs font-medium text-karspex-gray-800">Food Preference</label>
                <p className="text-sm text-karspex-black">{selectedUser.foodpreference}</p>
              </div>
            )}

            {selectedUser.allergys && selectedUser.allergys.length > 0 && (
              <div>
                <label className="text-xs font-medium text-karspex-gray-800">Allergies</label>
                <p className="text-sm text-karspex-black">{selectedUser.allergys.join(', ')}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-karspex-gray-800">Member Since</label>
              <p className="text-sm text-karspex-black">{formatDate(selectedUser.createdAt)}</p>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedUser(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        title="Edit User"
      >
        <form onSubmit={handleEditUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" htmlFor="firstname" required>
              <Input
                id="firstname"
                name="firstname"
                type="text"
                value={formData.firstname}
                onChange={handleInputChange}
                required
              />
            </FormField>

            <FormField label="Last Name" htmlFor="lastname" required>
              <Input
                id="lastname"
                name="lastname"
                type="text"
                value={formData.lastname}
                onChange={handleInputChange}
                required
              />
            </FormField>
          </div>

          <FormField label="Nickname" htmlFor="nickname">
            <Input
              id="nickname"
              name="nickname"
              type="text"
              value={formData.nickname}
              onChange={handleInputChange}
            />
          </FormField>

          <FormField label="Email" htmlFor="email" required>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </FormField>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-karspex-black">Roles</label>
            <div className="space-y-2">
              {['user', 'groupmanager', 'eventmanager', 'manager', 'admin'].map((role) => (
                <label
                  key={role}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-karspex-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    className="rounded border-karspex-gray-100 text-karspex-burgundy focus:ring-karspex-gold"
                  />
                  <span className="text-sm text-karspex-gray-800 capitalize">{role}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-karspex-gray-800">
            Are you sure you want to delete{' '}
            <strong>
              {selectedUser?.firstname} {selectedUser?.lastname}
            </strong>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteUser}
              className="bg-karspex-red hover:bg-red-700"
            >
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default UserManagementPage;
