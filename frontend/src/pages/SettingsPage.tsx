import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Bell, Shield, Save } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Input from '../components/Input';
import FormField from '../components/FormField';
import Textarea from '../components/Textarea';
import Checkbox from '../components/Checkbox';
import { authAPI, userAPI } from '../utils/api';

interface UserData {
  _id: string;
  firstname: string;
  lastname: string;
  nickname?: string;
  email: string;
  personnummer?: string;
  foodpreference?: string | string[];
  allergys?: string | string[];
  roles: string[];
}

function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstname: '',
    lastname: '',
    nickname: '',
    email: '',
    personnummer: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Preferences form state
  const [preferencesForm, setPreferencesForm] = useState({
    foodPreferences: {
      vegetarian: false,
      vegan: false,
      pescatarian: false,
      glutenFree: false,
      lactoseFree: false,
      halal: false,
      kosher: false,
      other: '',
    },
    allergies: {
      gluten: false,
      lactose: false,
      nuts: false,
      peanuts: false,
      eggs: false,
      fish: false,
      shellfish: false,
      soy: false,
      other: '',
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const userData = await authAPI.getCurrentUser();

        setUser(userData);
        setProfileForm({
          firstname: userData.firstname || '',
          lastname: userData.lastname || '',
          nickname: userData.nickname || '',
          email: userData.email || '',
          personnummer: userData.personnummer || '',
        });

        // Parse food preferences and allergies from string or array formats
        const parseFoodPreferences = (prefs?: string | string[]) => {
          const lines = Array.isArray(prefs)
            ? prefs.map((l) => String(l).trim()).filter((l) => l)
            : (prefs || '')
                .split('\n')
                .map((l) => l.trim())
                .filter((l) => l);
          return {
            vegetarian: lines.some((l) => l.toLowerCase() === 'vegetarian'),
            vegan: lines.some((l) => l.toLowerCase() === 'vegan'),
            pescatarian: lines.some((l) => l.toLowerCase() === 'pescatarian'),
            glutenFree: lines.some((l) => l.toLowerCase() === 'gluten free'),
            lactoseFree: lines.some((l) => l.toLowerCase() === 'lactose free'),
            halal: lines.some((l) => l.toLowerCase() === 'halal'),
            kosher: lines.some((l) => l.toLowerCase() === 'kosher'),
            other: lines
              .filter(
                (l) =>
                  ![
                    'vegetarian',
                    'vegan',
                    'pescatarian',
                    'gluten free',
                    'lactose free',
                    'halal',
                    'kosher',
                  ].includes(l.toLowerCase())
              )
              .join('\n'),
          };
        };

        const parseAllergies = (allergies?: string | string[]) => {
          const lines = Array.isArray(allergies)
            ? allergies.map((l) => String(l).trim()).filter((l) => l)
            : (allergies || '')
                .split('\n')
                .map((l) => l.trim())
                .filter((l) => l);
          return {
            gluten: lines.some((l) => l.toLowerCase() === 'gluten'),
            lactose: lines.some((l) => l.toLowerCase() === 'lactose'),
            nuts: lines.some((l) => l.toLowerCase() === 'nuts'),
            peanuts: lines.some((l) => l.toLowerCase() === 'peanuts'),
            eggs: lines.some((l) => l.toLowerCase() === 'eggs'),
            fish: lines.some((l) => l.toLowerCase() === 'fish'),
            shellfish: lines.some((l) => l.toLowerCase() === 'shellfish'),
            soy: lines.some((l) => l.toLowerCase() === 'soy'),
            other: lines
              .filter(
                (l) =>
                  ![
                    'gluten',
                    'lactose',
                    'nuts',
                    'peanuts',
                    'eggs',
                    'fish',
                    'shellfish',
                    'soy',
                  ].includes(l.toLowerCase())
              )
              .join('\n'),
          };
        };

        setPreferencesForm({
          foodPreferences: parseFoodPreferences(userData.foodpreference),
          allergies: parseAllergies(userData.allergys),
        });
      } catch (error) {
        console.error('Failed to fetch user:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFoodPreferenceChange =
    (key: keyof typeof preferencesForm.foodPreferences) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPreferencesForm({
        ...preferencesForm,
        foodPreferences: {
          ...preferencesForm.foodPreferences,
          [key]: e.target.checked,
        },
      });
    };

  const handleFoodPreferenceOtherChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPreferencesForm({
      ...preferencesForm,
      foodPreferences: {
        ...preferencesForm.foodPreferences,
        other: e.target.value,
      },
    });
  };

  const handleAllergyChange =
    (key: keyof typeof preferencesForm.allergies) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setPreferencesForm({
        ...preferencesForm,
        allergies: {
          ...preferencesForm.allergies,
          [key]: e.target.checked,
        },
      });
    };

  const handleAllergyOtherChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPreferencesForm({
      ...preferencesForm,
      allergies: {
        ...preferencesForm.allergies,
        other: e.target.value,
      },
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      const updatedUser = await userAPI.updateProfile(profileForm);
      setUser(updatedUser);

      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setSaveMessage('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSaveMessage('New passwords do not match.');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setSaveMessage('Password must be at least 8 characters long.');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      await userAPI.updatePassword(passwordForm.currentPassword, passwordForm.newPassword);

      setSaveMessage('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to change password:', error);
      setSaveMessage('Failed to change password. Please check your current password.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      // Build food preferences array
      const foodPreferencesList: string[] = [];
      if (preferencesForm.foodPreferences.vegetarian) foodPreferencesList.push('Vegetarian');
      if (preferencesForm.foodPreferences.vegan) foodPreferencesList.push('Vegan');
      if (preferencesForm.foodPreferences.pescatarian) foodPreferencesList.push('Pescatarian');
      if (preferencesForm.foodPreferences.glutenFree) foodPreferencesList.push('Gluten Free');
      if (preferencesForm.foodPreferences.lactoseFree) foodPreferencesList.push('Lactose Free');
      if (preferencesForm.foodPreferences.halal) foodPreferencesList.push('Halal');
      if (preferencesForm.foodPreferences.kosher) foodPreferencesList.push('Kosher');
      if (preferencesForm.foodPreferences.other) {
        const otherPrefs = preferencesForm.foodPreferences.other
          .split('\n')
          .map((p) => p.trim())
          .filter((p) => p);
        foodPreferencesList.push(...otherPrefs);
      }

      // Build allergies array
      const allergiesList: string[] = [];
      if (preferencesForm.allergies.gluten) allergiesList.push('Gluten');
      if (preferencesForm.allergies.lactose) allergiesList.push('Lactose');
      if (preferencesForm.allergies.nuts) allergiesList.push('Nuts');
      if (preferencesForm.allergies.peanuts) allergiesList.push('Peanuts');
      if (preferencesForm.allergies.eggs) allergiesList.push('Eggs');
      if (preferencesForm.allergies.fish) allergiesList.push('Fish');
      if (preferencesForm.allergies.shellfish) allergiesList.push('Shellfish');
      if (preferencesForm.allergies.soy) allergiesList.push('Soy');
      if (preferencesForm.allergies.other) {
        const otherAllergies = preferencesForm.allergies.other
          .split('\n')
          .map((a) => a.trim())
          .filter((a) => a);
        allergiesList.push(...otherAllergies);
      }

      const updatedUser = await userAPI.updatePreferences(
        foodPreferencesList.join('\n') || '',
        allergiesList.join('\n') || ''
      );
      setUser(updatedUser);

      setSaveMessage('Preferences updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      setSaveMessage('Failed to update preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-karspex-burgundy">
      <Header />

      <main className="grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-karspex-cream">Manage your account settings and preferences</p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="bg-karspex-cream rounded-lg shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-karspex-burgundy mb-4"></div>
            <p className="text-karspex-gray-800">Loading settings...</p>
          </div>
        ) : (
          <>
            {/* Save Message */}
            {saveMessage && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  saveMessage.includes('success')
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}
              >
                {saveMessage}
              </div>
            )}

            {/* Tabs */}
            <div className="bg-karspex-cream rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-karspex-gray-100">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'profile'
                        ? 'border-b-2 border-karspex-burgundy text-karspex-burgundy bg-white'
                        : 'text-karspex-gray-800 hover:text-karspex-burgundy hover:bg-karspex-gray-50'
                    }`}
                  >
                    <User size={18} className="inline-block mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'security'
                        ? 'border-b-2 border-karspex-burgundy text-karspex-burgundy bg-white'
                        : 'text-karspex-gray-800 hover:text-karspex-burgundy hover:bg-karspex-gray-50'
                    }`}
                  >
                    <Lock size={18} className="inline-block mr-2" />
                    Security
                  </button>
                  <button
                    onClick={() => setActiveTab('preferences')}
                    className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'preferences'
                        ? 'border-b-2 border-karspex-burgundy text-karspex-burgundy bg-white'
                        : 'text-karspex-gray-800 hover:text-karspex-burgundy hover:bg-karspex-gray-50'
                    }`}
                  >
                    <Bell size={18} className="inline-block mr-2" />
                    Preferences
                  </button>
                </nav>
              </div>

              <div className="p-6 bg-white">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField label="First Name" htmlFor="firstname" required>
                        <Input
                          id="firstname"
                          name="firstname"
                          type="text"
                          value={profileForm.firstname}
                          onChange={handleProfileInputChange}
                          required
                        />
                      </FormField>

                      <FormField label="Last Name" htmlFor="lastname" required>
                        <Input
                          id="lastname"
                          name="lastname"
                          type="text"
                          value={profileForm.lastname}
                          onChange={handleProfileInputChange}
                          required
                        />
                      </FormField>
                    </div>

                    <FormField label="Nickname" htmlFor="nickname">
                      <Input
                        id="nickname"
                        name="nickname"
                        type="text"
                        value={profileForm.nickname}
                        onChange={handleProfileInputChange}
                        placeholder="Optional nickname"
                      />
                    </FormField>

                    <FormField label="Email" htmlFor="email" required>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileForm.email}
                        onChange={handleProfileInputChange}
                        required
                      />
                    </FormField>

                    <FormField label="Personnummer" htmlFor="personnummer">
                      <Input
                        id="personnummer"
                        name="personnummer"
                        type="text"
                        value={profileForm.personnummer}
                        onChange={handleProfileInputChange}
                        placeholder="YYYYMMDDXXXX"
                      />
                    </FormField>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={isSaving}>
                        <Save size={18} className="mr-2" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="bg-karspex-gold bg-opacity-10 border border-karspex-gold rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <Shield size={20} className="text-karspex-gold mr-3 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-karspex-black mb-1">Password Security</h3>
                          <p className="text-sm text-karspex-gray-800">
                            Choose a strong password with at least 8 characters.
                          </p>
                        </div>
                      </div>
                    </div>

                    <FormField label="Current Password" htmlFor="currentPassword" required>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordInputChange}
                        required
                      />
                    </FormField>

                    <FormField label="New Password" htmlFor="newPassword" required>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordInputChange}
                        required
                        minLength={8}
                      />
                    </FormField>

                    <FormField label="Confirm New Password" htmlFor="confirmPassword" required>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordInputChange}
                        required
                        minLength={8}
                      />
                    </FormField>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={isSaving}>
                        <Save size={18} className="mr-2" />
                        {isSaving ? 'Changing...' : 'Change Password'}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                    <FormField label="Food Preferences">
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Checkbox
                            label="Vegetarian"
                            checked={preferencesForm.foodPreferences.vegetarian}
                            onChange={handleFoodPreferenceChange('vegetarian')}
                          />
                          <Checkbox
                            label="Vegan"
                            checked={preferencesForm.foodPreferences.vegan}
                            onChange={handleFoodPreferenceChange('vegan')}
                          />
                          <Checkbox
                            label="Pescatarian"
                            checked={preferencesForm.foodPreferences.pescatarian}
                            onChange={handleFoodPreferenceChange('pescatarian')}
                          />
                          <Checkbox
                            label="Gluten Free"
                            checked={preferencesForm.foodPreferences.glutenFree}
                            onChange={handleFoodPreferenceChange('glutenFree')}
                          />
                          <Checkbox
                            label="Lactose Free"
                            checked={preferencesForm.foodPreferences.lactoseFree}
                            onChange={handleFoodPreferenceChange('lactoseFree')}
                          />
                          <Checkbox
                            label="Halal"
                            checked={preferencesForm.foodPreferences.halal}
                            onChange={handleFoodPreferenceChange('halal')}
                          />
                          <Checkbox
                            label="Kosher"
                            checked={preferencesForm.foodPreferences.kosher}
                            onChange={handleFoodPreferenceChange('kosher')}
                          />
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-karspex-black mb-2">
                            Other (one per line)
                          </label>
                          <Textarea
                            value={preferencesForm.foodPreferences.other}
                            onChange={handleFoodPreferenceOtherChange}
                            placeholder="Enter any other food preferences&#10;One per line"
                            rows={3}
                          />
                        </div>
                      </div>
                    </FormField>

                    <FormField label="Allergies">
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Checkbox
                            label="Gluten"
                            checked={preferencesForm.allergies.gluten}
                            onChange={handleAllergyChange('gluten')}
                          />
                          <Checkbox
                            label="Lactose"
                            checked={preferencesForm.allergies.lactose}
                            onChange={handleAllergyChange('lactose')}
                          />
                          <Checkbox
                            label="Nuts"
                            checked={preferencesForm.allergies.nuts}
                            onChange={handleAllergyChange('nuts')}
                          />
                          <Checkbox
                            label="Peanuts"
                            checked={preferencesForm.allergies.peanuts}
                            onChange={handleAllergyChange('peanuts')}
                          />
                          <Checkbox
                            label="Eggs"
                            checked={preferencesForm.allergies.eggs}
                            onChange={handleAllergyChange('eggs')}
                          />
                          <Checkbox
                            label="Fish"
                            checked={preferencesForm.allergies.fish}
                            onChange={handleAllergyChange('fish')}
                          />
                          <Checkbox
                            label="Shellfish"
                            checked={preferencesForm.allergies.shellfish}
                            onChange={handleAllergyChange('shellfish')}
                          />
                          <Checkbox
                            label="Soy"
                            checked={preferencesForm.allergies.soy}
                            onChange={handleAllergyChange('soy')}
                          />
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-karspex-black mb-2">
                            Other (one per line)
                          </label>
                          <Textarea
                            value={preferencesForm.allergies.other}
                            onChange={handleAllergyOtherChange}
                            placeholder="Enter any other allergies&#10;One per line"
                            rows={3}
                          />
                        </div>
                      </div>
                    </FormField>

                    <div className="bg-karspex-cream rounded-lg p-4">
                      <h3 className="font-medium text-karspex-black mb-2">Your Roles</h3>
                      <div className="flex flex-wrap gap-2">
                        {user?.roles.map((role) => (
                          <span
                            key={role}
                            className="px-3 py-1 text-sm font-medium rounded bg-karspex-burgundy text-white"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-karspex-gray-800 mt-2">
                        Contact an administrator to change your roles.
                      </p>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={isSaving}>
                        <Save size={18} className="mr-2" />
                        {isSaving ? 'Saving...' : 'Save Preferences'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default SettingsPage;
