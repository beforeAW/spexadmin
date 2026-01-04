import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Plus } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import FormField from '../components/FormField';
import Checkbox from '../components/Checkbox';
import Select from '../components/Select';
import { authAPI, eventAPI } from '../utils/api';

interface Event {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  location: string;
  groupId?: { _id: string; name: string };
  rsvps?: Array<{ userId: string; status: string }>;
  maxAttendees?: number;
  rsvpDeadline?: string;
  forceRSVP?: boolean;
  createdBy: string;
}

interface DisplayEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  group: string;
  attendees: number;
  maxAttendees?: number;
  isAttending: boolean;
  rsvpDeadline?: string;
  forceRSVP?: boolean;
  createdBy: string;
}

function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<DisplayEvent[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Form state for creating events
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    group: '',
    maxAttendees: '',
    rsvpDeadline: '',
    forceRSVP: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [userData, eventsData] = await Promise.all([
          authAPI.getCurrentUser(),
          eventAPI.getAll(),
        ]);

        setUserRoles(userData.roles || []);
        setCurrentUserId(userData._id);

        // Transform events to display format
        const displayEvents: DisplayEvent[] = eventsData.events.map((event: Event) => ({
          _id: event._id,
          title: event.name,
          description: event.description,
          date: event.startDate,
          location: event.location,
          group: event.groupId?.name || 'Alla',
          attendees: event.rsvps?.filter((r) => r.status === 'yes').length || 0,
          maxAttendees: event.maxAttendees,
          isAttending:
            event.rsvps?.some((r) => r.userId === userData._id && r.status === 'yes') || false,
          rsvpDeadline: event.rsvpDeadline,
          forceRSVP: event.forceRSVP,
          createdBy: event.createdBy,
        }));

        setEvents(displayEvents);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const canCreateEvent = userRoles.includes('groupmanager') || userRoles.includes('manager');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await eventAPI.create({
        name: formData.title,
        description: formData.description,
        startDate: new Date(formData.date).toISOString(),
        location: formData.location,
        groupId: formData.group || undefined,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        rsvpDeadline: formData.rsvpDeadline
          ? new Date(formData.rsvpDeadline).toISOString()
          : undefined,
        forceRSVP: formData.forceRSVP,
      });

      // Refresh events list
      const eventsData = await eventAPI.getAll();
      const displayEvents: DisplayEvent[] = eventsData.events.map((event: Event) => ({
        _id: event._id,
        title: event.name,
        description: event.description,
        date: event.startDate,
        location: event.location,
        group: event.groupId?.name || 'Alla',
        attendees: event.rsvps?.filter((r) => r.status === 'yes').length || 0,
        maxAttendees: event.maxAttendees,
        isAttending:
          event.rsvps?.some((r) => r.userId === currentUserId && r.status === 'yes') || false,
        rsvpDeadline: event.rsvpDeadline,
        forceRSVP: event.forceRSVP,
        createdBy: event.createdBy,
      }));
      setEvents(displayEvents);

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        group: '',
        maxAttendees: '',
        rsvpDeadline: '',
        forceRSVP: false,
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const handleAttendance = async (eventId: string) => {
    try {
      // Find current RSVP status
      const event = events.find((e) => e._id === eventId);
      if (!event) return;

      const newStatus = event.isAttending ? 'no' : 'yes';
      await eventAPI.rsvp(eventId, currentUserId, newStatus);

      // Refresh events list
      const eventsData = await eventAPI.getAll();
      const displayEvents: DisplayEvent[] = eventsData.events.map((event: Event) => ({
        _id: event._id,
        title: event.name,
        description: event.description,
        date: event.startDate,
        location: event.location,
        group: event.groupId?.name || 'Alla',
        attendees: event.rsvps?.filter((r) => r.status === 'yes').length || 0,
        maxAttendees: event.maxAttendees,
        isAttending:
          event.rsvps?.some((r) => r.userId === currentUserId && r.status === 'yes') || false,
        rsvpDeadline: event.rsvpDeadline,
        forceRSVP: event.forceRSVP,
        createdBy: event.createdBy,
      }));
      setEvents(displayEvents);
    } catch (error) {
      console.error('Failed to update attendance:', error);
      alert('Failed to update attendance. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isRsvpDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    return new Date() > new Date(deadline);
  };

  const filteredEvents = events.filter((event) => {
    const query = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query) ||
      event.group.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-karspex-burgundy">
      <Header />

      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Events</h1>

          {canCreateEvent && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="whitespace-nowrap flex items-center shrink-0"
            >
              <Plus size={20} className="mr-2" />
              Create Event
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="bg-karspex-cream rounded-lg shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-karspex-burgundy mb-4"></div>
            <p className="text-karspex-gray-800">Loading events...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Search events by title, description, location, or group..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-4">
              {filteredEvents.length === 0 ? (
                <div className="bg-karspex-cream rounded-lg shadow-md p-8 text-center">
                  <p className="text-karspex-gray-800 text-lg">
                    {searchQuery ? 'No events found matching your search.' : 'No events available.'}
                  </p>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <div
                    key={event._id}
                    className="bg-karspex-cream rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
                      <div className="grow">
                        <Link
                          to={`/events/${event._id}`}
                          className="text-2xl font-bold text-karspex-black hover:text-karspex-red transition-colors duration-200"
                        >
                          {event.title}
                        </Link>

                        <p className="text-karspex-gray-800 mt-2">{event.description}</p>

                        <div className="flex flex-wrap gap-4 mt-4">
                          <div className="flex items-center text-karspex-gray-800">
                            <Calendar size={18} className="mr-2" />
                            {formatDate(event.date)}
                          </div>

                          <div className="flex items-center text-karspex-gray-800">
                            <MapPin size={18} className="mr-2" />
                            {event.location}
                          </div>

                          {event.createdBy === currentUserId && (
                            <div className="flex items-center text-karspex-gray-800">
                              <Users size={18} className="mr-2" />
                              {event.attendees}
                              {event.maxAttendees && ` / ${event.maxAttendees}`}
                            </div>
                          )}
                        </div>

                        {event.rsvpDeadline && (
                          <div className="mt-3">
                            <span className="text-sm text-karspex-gray-800">
                              <span className="font-medium">RSVP by:</span>{' '}
                              {formatDate(event.rsvpDeadline)}
                            </span>
                          </div>
                        )}

                        <div className="mt-4">
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-karspex-burgundy text-karspex-cream">
                            {event.group}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 lg:mt-0 lg:ml-4 flex flex-col items-center lg:items-end gap-2">
                        {event.forceRSVP && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-karspex-red text-white">
                            Response Required
                          </span>
                        )}
                        {isRsvpDeadlinePassed(event.rsvpDeadline) ? (
                          <div className="px-4 py-2 rounded-lg bg-karspex-cream border-2 border-karspex-burgundy">
                            <span className="font-medium text-karspex-black">
                              Your choice: {event.isAttending ? 'Attending' : 'Not Attending'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <Button
                              variant={event.isAttending ? 'primary' : 'secondary'}
                              onClick={() => {
                                if (!event.isAttending) {
                                  handleAttendance(event._id);
                                }
                              }}
                              className={event.isAttending ? 'ring-2 ring-karspex-gold' : ''}
                            >
                              Attend
                            </Button>
                            <Button
                              variant={!event.isAttending ? 'primary' : 'secondary'}
                              onClick={() => {
                                if (event.isAttending) {
                                  handleAttendance(event._id);
                                }
                              }}
                              className={!event.isAttending ? 'ring-2 ring-karspex-gold' : ''}
                            >
                              Not Attending
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>

      <Footer />

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Event"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <FormField label="Event Title" htmlFor="title" required>
            <Input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </FormField>

          <FormField label="Description" htmlFor="description" required>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </FormField>

          <FormField label="Date & Time" htmlFor="date" required>
            <Input
              id="date"
              name="date"
              type="datetime-local"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </FormField>

          <FormField label="Location" htmlFor="location" required>
            <Input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
          </FormField>

          <FormField label="Group" htmlFor="group" required>
            <Select
              id="group"
              name="group"
              value={formData.group}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a group</option>
              {['Alla', 'Spex', 'Admin'].map((group: string) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Max Attendees (optional)" htmlFor="maxAttendees">
            <Input
              id="maxAttendees"
              name="maxAttendees"
              type="number"
              value={formData.maxAttendees}
              onChange={handleInputChange}
              min="1"
            />
          </FormField>

          <FormField label="RSVP Deadline (optional)" htmlFor="rsvpDeadline">
            <Input
              id="rsvpDeadline"
              name="rsvpDeadline"
              type="datetime-local"
              value={formData.rsvpDeadline}
              onChange={handleInputChange}
            />
          </FormField>

          <div className="flex items-center">
            <Checkbox
              id="forceRSVP"
              name="forceRSVP"
              checked={formData.forceRSVP}
              onChange={handleInputChange}
              label="deRSVP"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="submit">Create Event</Button>
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default EventsPage;
