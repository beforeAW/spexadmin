import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import FormField from '../components/FormField';

interface Group {
  _id: string;
  name: string;
  description?: string;
  members: string[];
  managers: string[];
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  roles: string[];
}

// Mock available users
const mockAvailableUsers: User[] = [
  { _id: 'user1', firstname: 'Anna', lastname: 'Andersson', roles: ['user', 'groupmanager'] },
  { _id: 'user2', firstname: 'Erik', lastname: 'Eriksson', roles: ['user'] },
  { _id: 'user3', firstname: 'Maria', lastname: 'Svensson', roles: ['user'] },
  { _id: 'user4', firstname: 'Johan', lastname: 'Karlsson', roles: ['user'] },
  { _id: 'user5', firstname: 'Lisa', lastname: 'Johansson', roles: ['user'] },
  { _id: 'user6', firstname: 'Per', lastname: 'Andersson', roles: ['user'] },
];

// Mock groups data
const mockGroups: Group[] = [
  {
    _id: '1',
    name: 'Kör',
    description: 'Körgruppen för Spexet. Vi sjunger och gör musik tillsammans.',
    members: ['user1', 'user2', 'user3'],
    managers: ['user1'],
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2025-12-01T10:00:00Z',
  },
  {
    _id: '2',
    name: 'Orkester',
    description: 'Orkestergruppen som spelar alla låtar.',
    members: ['user2', 'user4', 'user5'],
    managers: ['user1'],
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2025-12-01T10:00:00Z',
  },
  {
    _id: '3',
    name: 'Teatergruppen',
    description: 'Skådespelare och regissörer.',
    members: ['user3', 'user6'],
    managers: ['user1'],
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2025-12-01T10:00:00Z',
  },
];

const mockUser: User = {
  _id: 'user1',
  firstname: 'Anna',
  lastname: 'Andersson',
  roles: ['user', 'groupmanager'],
};

function GroupManagementPage() {
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [user, setUser] = useState<User>(mockUser);
  const [availableUsers] = useState<User[]>(mockAvailableUsers);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [managerSearchQuery, setManagerSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [] as string[],
    managers: [] as string[],
  });

  useEffect(() => {
    // Get user from localStorage or use mock
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // In real app, fetch groups from API
    // fetchGroups();
  }, []);

  const canManageGroups = user.roles.includes('groupmanager') || user.roles.includes('manager');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserToggle = (userId: string, field: 'members' | 'managers') => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(userId)
        ? prev[field].filter((id) => id !== userId)
        : [...prev[field], userId],
    }));
  };

  const filterUsers = (query: string) => {
    if (!query.trim()) return availableUsers;
    const lowerQuery = query.toLowerCase();
    return availableUsers.filter(
      (u) =>
        u.firstname.toLowerCase().includes(lowerQuery) ||
        u.lastname.toLowerCase().includes(lowerQuery)
    );
  };

  const openCreateModal = () => {
    setFormData({ name: '', description: '', members: [], managers: [user._id] });
    setMemberSearchQuery('');
    setManagerSearchQuery('');
    setIsCreateModalOpen(true);
  };

  const openEditModal = (group: Group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      members: group.members,
      managers: group.managers,
    });
    setMemberSearchQuery('');
    setManagerSearchQuery('');
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (group: Group) => {
    setSelectedGroup(group);
    setIsDeleteModalOpen(true);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();

    // In real app, send POST request to API
    const newGroup: Group = {
      _id: String(Date.now()),
      name: formData.name,
      description: formData.description,
      members: formData.members,
      managers: formData.managers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setGroups([...groups, newGroup]);
    setIsCreateModalOpen(false);
  };

  const handleEditGroup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGroup) return;

    // In real app, send PUT request to API
    const updatedGroups = groups.map((group) =>
      group._id === selectedGroup._id
        ? {
            ...group,
            name: formData.name,
            description: formData.description,
            members: formData.members,
            managers: formData.managers,
            updatedAt: new Date().toISOString(),
          }
        : group
    );

    setGroups(updatedGroups);
    setIsEditModalOpen(false);
    setSelectedGroup(null);
  };

  const handleDeleteGroup = () => {
    if (!selectedGroup) return;

    // In real app, send DELETE request to API
    setGroups(groups.filter((group) => group._id !== selectedGroup._id));
    setIsDeleteModalOpen(false);
    setSelectedGroup(null);
  };

  if (!canManageGroups) {
    return (
      <div className="min-h-screen flex flex-col bg-karspex-burgundy">
        <Header />
        <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-karspex-cream rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-karspex-black mb-4">Access Denied</h2>
            <p className="text-karspex-gray-800 mb-6">
              You don't have permission to manage groups.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-karspex-burgundy">
      <Header />

      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Group Management</h1>
            <p className="text-karspex-cream">Create and manage groups for your organization</p>
          </div>
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <Plus size={20} />
            Create Group
          </Button>
        </div>

        {groups.length === 0 ? (
          <div className="bg-karspex-cream rounded-lg shadow-md p-8 text-center">
            <Users size={48} className="mx-auto text-karspex-gray-800 mb-4" />
            <h3 className="text-xl font-bold text-karspex-black mb-2">No Groups Yet</h3>
            <p className="text-karspex-gray-800 mb-6">Create your first group to get started.</p>
            <Button onClick={openCreateModal}>
              <Plus size={20} className="mr-2" />
              Create Group
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <div
                key={group._id}
                className="bg-karspex-cream rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-karspex-black">{group.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(group)}
                      className="p-2 text-karspex-gray-800 hover:text-karspex-gold transition-colors duration-200"
                      title="Edit Group"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(group)}
                      className="p-2 text-karspex-gray-800 hover:text-karspex-red transition-colors duration-200"
                      title="Delete Group"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {group.description && (
                  <p className="text-karspex-gray-800 mb-4 line-clamp-3">{group.description}</p>
                )}

                <div className="flex items-center text-sm text-karspex-gray-800">
                  <Users size={16} className="mr-2" />
                  <span>
                    {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-karspex-gray-100">
                  <p className="text-xs text-karspex-gray-800">
                    Created: {new Date(group.createdAt).toLocaleDateString('sv-SE')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Create Group Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Group"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <FormField label="Group Name" htmlFor="name" required>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Kör, Orkester, Teatergruppen"
              required
            />
          </FormField>

          <FormField label="Description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Brief description of the group..."
            />
          </FormField>

          {/* Members Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-karspex-black">
              Select Members (Optional)
            </label>
            <Input
              type="text"
              placeholder="Search users..."
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
            />
            <div className="max-h-48 overflow-y-auto border border-karspex-gray-100 rounded-lg p-3 space-y-2">
              {filterUsers(memberSearchQuery).map((availUser) => (
                <label
                  key={availUser._id}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-karspex-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.members.includes(availUser._id)}
                    onChange={() => handleUserToggle(availUser._id, 'members')}
                    className="rounded border-karspex-gray-100 text-karspex-burgundy focus:ring-karspex-gold"
                  />
                  <span className="text-sm text-karspex-gray-800">
                    {availUser.firstname} {availUser.lastname}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Managers Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-karspex-black">
              Select Managers <span className="text-karspex-red">*</span>
            </label>
            <Input
              type="text"
              placeholder="Search users..."
              value={managerSearchQuery}
              onChange={(e) => setManagerSearchQuery(e.target.value)}
            />
            <div className="max-h-48 overflow-y-auto border border-karspex-gray-100 rounded-lg p-3 space-y-2">
              {filterUsers(managerSearchQuery).map((availUser) => (
                <label
                  key={availUser._id}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-karspex-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.managers.includes(availUser._id)}
                    onChange={() => handleUserToggle(availUser._id, 'managers')}
                    className="rounded border-karspex-gray-100 text-karspex-burgundy focus:ring-karspex-gold"
                  />
                  <span className="text-sm text-karspex-gray-800">
                    {availUser.firstname} {availUser.lastname}
                  </span>
                </label>
              ))}
            </div>
            {formData.managers.length === 0 && (
              <p className="text-xs text-karspex-red">At least one manager is required</p>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formData.managers.length === 0}>
              Create Group
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedGroup(null);
        }}
        title="Edit Group"
      >
        <form onSubmit={handleEditGroup} className="space-y-4">
          <FormField label="Group Name" htmlFor="edit-name" required>
            <Input
              id="edit-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </FormField>

          <FormField label="Description" htmlFor="edit-description">
            <Textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
            />
          </FormField>

          {/* Members Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-karspex-black">
              Select Members (Optional)
            </label>
            <Input
              type="text"
              placeholder="Search users..."
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
            />
            <div className="max-h-48 overflow-y-auto border border-karspex-gray-100 rounded-lg p-3 space-y-2">
              {filterUsers(memberSearchQuery).map((availUser) => (
                <label
                  key={availUser._id}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-karspex-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.members.includes(availUser._id)}
                    onChange={() => handleUserToggle(availUser._id, 'members')}
                    className="rounded border-karspex-gray-100 text-karspex-burgundy focus:ring-karspex-gold"
                  />
                  <span className="text-sm text-karspex-gray-800">
                    {availUser.firstname} {availUser.lastname}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Managers Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-karspex-black">
              Select Managers <span className="text-karspex-red">*</span>
            </label>
            <Input
              type="text"
              placeholder="Search users..."
              value={managerSearchQuery}
              onChange={(e) => setManagerSearchQuery(e.target.value)}
            />
            <div className="max-h-48 overflow-y-auto border border-karspex-gray-100 rounded-lg p-3 space-y-2">
              {filterUsers(managerSearchQuery).map((availUser) => (
                <label
                  key={availUser._id}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-karspex-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.managers.includes(availUser._id)}
                    onChange={() => handleUserToggle(availUser._id, 'managers')}
                    className="rounded border-karspex-gray-100 text-karspex-burgundy focus:ring-karspex-gold"
                  />
                  <span className="text-sm text-karspex-gray-800">
                    {availUser.firstname} {availUser.lastname}
                  </span>
                </label>
              ))}
            </div>
            {formData.managers.length === 0 && (
              <p className="text-xs text-karspex-red">At least one manager is required</p>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedGroup(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={formData.managers.length === 0}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedGroup(null);
        }}
        title="Delete Group"
      >
        <div className="space-y-4">
          <p className="text-karspex-gray-800">
            Are you sure you want to delete <strong>{selectedGroup?.name}</strong>? This action
            cannot be undone.
          </p>
          {selectedGroup && selectedGroup.members.length > 0 && (
            <p className="text-sm text-karspex-red">
              Warning: This group has {selectedGroup.members.length} member
              {selectedGroup.members.length !== 1 ? 's' : ''}.
            </p>
          )}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedGroup(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteGroup}
              className="bg-karspex-red hover:bg-red-700"
            >
              Delete Group
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default GroupManagementPage;
