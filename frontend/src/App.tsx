import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Button from './components/Button';
import Input from './components/Input';
import Textarea from './components/Textarea';
import Select from './components/Select';
import Checkbox from './components/Checkbox';
import Radio from './components/Radio';
import Switch from './components/Switch';
import FormField from './components/FormField';

function App() {
  const [checked, setChecked] = useState(false);

  return (
    <div className="min-h-screen bg-karspex-burgundy flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="bg-karspex-cream rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-karspex-red mb-6 text-center">Form Components</h1>

          <div className="space-y-6">
            {/* Buttons */}
            <div>
              <h2 className="text-xl font-semibold text-karspex-black mb-3">Buttons</h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>

            {/* Input */}
            <FormField label="Email" htmlFor="email" required helperText="Enter your email address">
              <Input id="email" type="email" placeholder="you@example.com" />
            </FormField>

            {/* Textarea */}
            <FormField label="Message" htmlFor="message">
              <Textarea id="message" placeholder="Enter your message..." rows={4} />
            </FormField>

            {/* Select */}
            <FormField label="Country" htmlFor="country">
              <Select id="country">
                <option value="">Select a country</option>
                <option value="se">Sweden</option>
                <option value="no">Norway</option>
                <option value="dk">Denmark</option>
              </Select>
            </FormField>

            {/* Checkboxes */}
            <div>
              <h3 className="text-sm font-medium text-karspex-black mb-2">Preferences</h3>
              <div className="space-y-2">
                <Checkbox label="Subscribe to newsletter" />
                <Checkbox label="Accept terms and conditions" />
              </div>
            </div>

            {/* Radio buttons */}
            <div>
              <h3 className="text-sm font-medium text-karspex-black mb-2">Membership</h3>
              <div className="space-y-2">
                <Radio name="membership" label="Free" value="free" />
                <Radio name="membership" label="Premium" value="premium" />
                <Radio name="membership" label="Enterprise" value="enterprise" />
              </div>
            </div>

            {/* Switch */}
            <div>
              <Switch
                label="Enable notifications"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
            </div>

            {/* Submit */}
            <div className="pt-4">
              <Button variant="primary" size="lg" className="w-full">
                Submit Form
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
