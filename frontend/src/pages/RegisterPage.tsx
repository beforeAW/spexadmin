import { useState, FormEvent } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Input from '../components/Input';
import FormField from '../components/FormField';
import Checkbox from '../components/Checkbox';
import Textarea from '../components/Textarea';
import { authAPI } from '../utils/api';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstname: string;
  lastname: string;
  nickname?: string;
  personnummer?: string;
  foodPreferences: {
    vegetarian: boolean;
    vegan: boolean;
    pescatarian: boolean;
    glutenFree: boolean;
    lactoseFree: boolean;
    halal: boolean;
    kosher: boolean;
    other: string;
  };
  allergies: {
    gluten: boolean;
    lactose: boolean;
    nuts: boolean;
    peanuts: boolean;
    eggs: boolean;
    fish: boolean;
    shellfish: boolean;
    soy: boolean;
    other: string;
  };
}

function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstname: '',
    lastname: '',
    nickname: '',
    personnummer: '',
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

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFoodPreferenceChange =
    (key: keyof typeof formData.foodPreferences) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        foodPreferences: {
          ...formData.foodPreferences,
          [key]: e.target.checked,
        },
      });
    };

  const handleFoodPreferenceOtherChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      foodPreferences: {
        ...formData.foodPreferences,
        other: e.target.value,
      },
    });
  };

  const handleAllergyChange =
    (key: keyof typeof formData.allergies) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        allergies: {
          ...formData.allergies,
          [key]: e.target.checked,
        },
      });
    };

  const handleAllergyOtherChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      allergies: {
        ...formData.allergies,
        other: e.target.value,
      },
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    // Build food preferences array
    const foodPreferencesList: string[] = [];
    if (formData.foodPreferences.vegetarian) foodPreferencesList.push('Vegetarian');
    if (formData.foodPreferences.vegan) foodPreferencesList.push('Vegan');
    if (formData.foodPreferences.pescatarian) foodPreferencesList.push('Pescatarian');
    if (formData.foodPreferences.glutenFree) foodPreferencesList.push('Gluten Free');
    if (formData.foodPreferences.lactoseFree) foodPreferencesList.push('Lactose Free');
    if (formData.foodPreferences.halal) foodPreferencesList.push('Halal');
    if (formData.foodPreferences.kosher) foodPreferencesList.push('Kosher');
    if (formData.foodPreferences.other) {
      const otherPrefs = formData.foodPreferences.other
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p);
      foodPreferencesList.push(...otherPrefs);
    }

    // Build allergies array
    const allergiesList: string[] = [];
    if (formData.allergies.gluten) allergiesList.push('Gluten');
    if (formData.allergies.lactose) allergiesList.push('Lactose');
    if (formData.allergies.nuts) allergiesList.push('Nuts');
    if (formData.allergies.peanuts) allergiesList.push('Peanuts');
    if (formData.allergies.eggs) allergiesList.push('Eggs');
    if (formData.allergies.fish) allergiesList.push('Fish');
    if (formData.allergies.shellfish) allergiesList.push('Shellfish');
    if (formData.allergies.soy) allergiesList.push('Soy');
    if (formData.allergies.other) {
      const otherAllergies = formData.allergies.other
        .split('\n')
        .map((a) => a.trim())
        .filter((a) => a);
      allergiesList.push(...otherAllergies);
    }

    try {
      const data = await authAPI.register({
        email: formData.email,
        password: formData.password,
        firstname: formData.firstname,
        lastname: formData.lastname,
        nickname: formData.nickname || undefined,
        personnummer: formData.personnummer || undefined,
        foodpreference: foodPreferencesList.join('\n') || undefined,
        allergys: allergiesList.join('\n') || undefined,
      });

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess(true);

      // Redirect to dashboard or home page after successful registration
      setTimeout(() => {
        window.location.href = '/'; // Update this to your desired route
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-karspex-burgundy flex flex-col">
      <Header />
      <div className="grow flex items-center justify-center py-12 px-4">
        <div className="bg-karspex-cream rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-karspex-black mb-6 text-center">
            Register for Spexadmin
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              Registration successful! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Fields */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-karspex-black">Required Information</h2>

              <FormField label="Email" htmlFor="email" required>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </FormField>

              <FormField label="First Name" htmlFor="firstname" required>
                <Input
                  id="firstname"
                  name="firstname"
                  type="text"
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder="John"
                  required
                />
              </FormField>

              <FormField label="Last Name" htmlFor="lastname" required>
                <Input
                  id="lastname"
                  name="lastname"
                  type="text"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </FormField>

              <FormField label="Password" htmlFor="password" required>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </FormField>

              <FormField label="Confirm Password" htmlFor="confirmPassword" required>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </FormField>
            </div>

            {/* Optional Fields */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-karspex-black">Optional Information</h2>

              <FormField label="Nickname" htmlFor="nickname">
                <Input
                  id="nickname"
                  name="nickname"
                  type="text"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="Your preferred name"
                />
              </FormField>

              <FormField
                label="Swedish Social Security Number"
                htmlFor="personnummer"
                helperText="Format: YYYYMMDD-XXXX"
              >
                <Input
                  id="personnummer"
                  name="personnummer"
                  type="text"
                  value={formData.personnummer}
                  onChange={handleChange}
                  placeholder="19900101-1234"
                />
              </FormField>

              <FormField label="Food Preferences">
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Checkbox
                      label="Vegetarian"
                      checked={formData.foodPreferences.vegetarian}
                      onChange={handleFoodPreferenceChange('vegetarian')}
                    />
                    <Checkbox
                      label="Vegan"
                      checked={formData.foodPreferences.vegan}
                      onChange={handleFoodPreferenceChange('vegan')}
                    />
                    <Checkbox
                      label="Pescatarian"
                      checked={formData.foodPreferences.pescatarian}
                      onChange={handleFoodPreferenceChange('pescatarian')}
                    />
                    <Checkbox
                      label="Gluten Free"
                      checked={formData.foodPreferences.glutenFree}
                      onChange={handleFoodPreferenceChange('glutenFree')}
                    />
                    <Checkbox
                      label="Lactose Free"
                      checked={formData.foodPreferences.lactoseFree}
                      onChange={handleFoodPreferenceChange('lactoseFree')}
                    />
                    <Checkbox
                      label="Halal"
                      checked={formData.foodPreferences.halal}
                      onChange={handleFoodPreferenceChange('halal')}
                    />
                    <Checkbox
                      label="Kosher"
                      checked={formData.foodPreferences.kosher}
                      onChange={handleFoodPreferenceChange('kosher')}
                    />
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-karspex-black mb-2">
                      Other (one per line)
                    </label>
                    <Textarea
                      value={formData.foodPreferences.other}
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
                      checked={formData.allergies.gluten}
                      onChange={handleAllergyChange('gluten')}
                    />
                    <Checkbox
                      label="Lactose"
                      checked={formData.allergies.lactose}
                      onChange={handleAllergyChange('lactose')}
                    />
                    <Checkbox
                      label="Nuts"
                      checked={formData.allergies.nuts}
                      onChange={handleAllergyChange('nuts')}
                    />
                    <Checkbox
                      label="Peanuts"
                      checked={formData.allergies.peanuts}
                      onChange={handleAllergyChange('peanuts')}
                    />
                    <Checkbox
                      label="Eggs"
                      checked={formData.allergies.eggs}
                      onChange={handleAllergyChange('eggs')}
                    />
                    <Checkbox
                      label="Fish"
                      checked={formData.allergies.fish}
                      onChange={handleAllergyChange('fish')}
                    />
                    <Checkbox
                      label="Shellfish"
                      checked={formData.allergies.shellfish}
                      onChange={handleAllergyChange('shellfish')}
                    />
                    <Checkbox
                      label="Soy"
                      checked={formData.allergies.soy}
                      onChange={handleAllergyChange('soy')}
                    />
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-karspex-black mb-2">
                      Other (one per line)
                    </label>
                    <Textarea
                      value={formData.allergies.other}
                      onChange={handleAllergyOtherChange}
                      placeholder="Enter any other allergies&#10;One per line"
                      rows={3}
                    />
                  </div>
                </div>
              </FormField>
            </div>

            <div className="flex gap-4">
              <Button type="submit" variant="primary" disabled={loading} className="flex-1">
                {loading ? 'Registering...' : 'Register'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => (window.location.href = '/login')}
                className="flex-1"
              >
                Already have an account?
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RegisterPage;
