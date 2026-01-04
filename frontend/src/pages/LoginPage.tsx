import { useState, FormEvent } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Input from '../components/Input';
import FormField from '../components/FormField';
import { authAPI } from '../utils/api';

interface LoginFormData {
  email: string;
  password: string;
}

function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.login(formData.email, formData.password);

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to profile
      window.location.href = '/profile';
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-karspex-burgundy flex flex-col">
      <Header />
      <div className="grow flex items-center justify-center py-12 px-4">
        <div className="bg-karspex-cream rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-karspex-black mb-6 text-center">
            Login to Spexadmin
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="space-y-4">
              <Button type="submit" variant="primary" disabled={loading} className="w-full">
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <div className="text-center">
                <span className="text-karspex-black">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => (window.location.href = '/register')}
                  className="text-karspex-red hover:underline font-semibold"
                >
                  Register here
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default LoginPage;
