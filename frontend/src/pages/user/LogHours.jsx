import React from 'react';
import { useThemeStore } from '../../store/index.js';
import { hoursAPI, clientAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';
import { Plus } from 'lucide-react';

export const LogHours = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const [clients, setClients] = React.useState([]);
  const [formData, setFormData] = React.useState({
    date: new Date().toISOString().split('T')[0],
    hoursWorked: '',
    taskDescription: '',
    category: 'Development',
    clientId: ''
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await clientAPI.getAll({ limit: 100 });
      setClients(response.data.clients);
    } catch (error) {
      console.log('Could not fetch clients');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.hoursWorked || isNaN(formData.hoursWorked)) {
      toast.error('Please enter valid hours');
      setLoading(false);
      return;
    }

    if (formData.hoursWorked > 24) {
      toast.error('Hours cannot exceed 24');
      setLoading(false);
      return;
    }

    // Confirmation modal
    const confirm = window.confirm(
      `Log ${formData.hoursWorked} hours for ${formData.date}?\n\nCategory: ${formData.category}\n${formData.taskDescription ? `Task: ${formData.taskDescription}` : ''}`
    );

    if (!confirm) {
      setLoading(false);
      return;
    }

    try {
      await hoursAPI.create({
        ...formData,
        hoursWorked: parseFloat(formData.hoursWorked),
        clientId: formData.clientId || undefined
      });

      toast.success('Hours logged successfully!');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        hoursWorked: '',
        taskDescription: '',
        category: 'Development',
        clientId: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to log hours');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isDark ? 'bg-gray-950' : 'bg-gray-50'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
          <Plus className="w-10 h-10 text-secondary" />
          Log Your Hours
        </h1>

        <div className={`${isDark ? 'card-dark' : 'card'} p-8`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={isDark ? 'input-field-dark' : 'input-field'}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hours Worked (0-24) *</label>
                <input
                  type="number"
                  name="hoursWorked"
                  value={formData.hoursWorked}
                  onChange={handleChange}
                  className={isDark ? 'input-field-dark' : 'input-field'}
                  placeholder="8"
                  min="0"
                  max="24"
                  step="0.5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={isDark ? 'input-field-dark' : 'input-field'}
                >
                  <option>Development</option>
                  <option>Testing</option>
                  <option>Meeting</option>
                  <option>Documentation</option>
                  <option>Support</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Client (Optional)</label>
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  className={isDark ? 'input-field-dark' : 'input-field'}
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Task Description (Optional)</label>
              <textarea
                name="taskDescription"
                value={formData.taskDescription}
                onChange={handleChange}
                rows="4"
                className={isDark ? 'input-field-dark' : 'input-field'}
                placeholder="What did you work on?"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 text-lg py-3"
            >
              {loading ? 'Logging...' : 'Log Hours'}
            </button>
          </form>

          <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-blue-50'} border ${isDark ? 'border-gray-700' : 'border-blue-200'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              💡 <strong>Tip:</strong> You can log past dates but not future dates. Hours are rounded to 0.5 hour increments for easier tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
