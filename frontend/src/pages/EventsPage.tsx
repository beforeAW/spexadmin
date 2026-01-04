import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

interface Event {
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

// Mock events data
const mockEvents: Event[] = [
  {
    _id: '1',
    title: 'Kör Repetition',
    description: 'Veckorepetition för kören. Vi repeterar nya stycken inför uppträdandet.',
    date: '2026-01-10T18:00:00Z',
    location: 'Musiksalen, Spexhuset',
    group: 'Kör',
    attendees: 24,
    maxAttendees: 30,
    isAttending: true,
    rsvpDeadline: '2026-01-09T12:00:00Z',
    createdBy: 'user1',
  },
  {
    _id: '2',
    title: 'Orkester Övning',
    description: 'Repetition av nya låtar med orkestern.',
    date: '2026-01-12T19:00:00Z',
    location: 'Stora salen, Spexhuset',
    group: 'Orkester',
    attendees: 18,
    maxAttendees: 25,
    isAttending: false,
    rsvpDeadline: '2026-01-11T12:00:00Z',
    createdBy: 'user1',
  },
  {
    _id: '3',
    title: 'Teatergruppen Workshop',
    description: 'Improvisationsworkshop och scenisk gestaltning.',
    date: '2026-01-15T17:30:00Z',
    location: 'Teatersalen',
    group: 'Teatergruppen',
    attendees: 15,
    maxAttendees: 20,
    isAttending: true,
    rsvpDeadline: '2026-01-14T12:00:00Z',
    createdBy: 'user1',
  },
  {
    _id: '4',
    title: 'Årsmöte',
    description: 'Årsmöte för alla medlemmar. Viktig information om kommande säsong.',
    date: '2026-01-20T18:00:00Z',
    location: 'Stora salen, Spexhuset',
    group: 'Alla',
    attendees: 67,
    isAttending: false,
    rsvpDeadline: '2026-01-18T23:59:00Z',
    createdBy: 'user2',
  },
  {
    _id: '5',
    title: 'Spexfest',
    description: 'Middag och mingel för alla medlemmar. Ta med egen dryck!',
    date: '2026-01-25T19:00:00Z',
    location: 'Spexhuset',
    group: 'Alla',
    attendees: 43,
    maxAttendees: 60,
    isAttending: true,
    rsvpDeadline: '2026-01-23T23:59:00Z',
    createdBy: 'user2',
  },
  {
    _id: '6',
    title: 'Nybörjarträning',
    description: 'Introduktionsträning för nya medlemmar. Vi går igenom grunderna.',
    date: '2026-01-06T18:00:00Z',
    location: 'Träningslokalen, Spexhuset',
    group: 'Alla',
    attendees: 12,
    maxAttendees: 15,
    isAttending: true,
    rsvpDeadline: '2026-01-03T23:59:00Z',
    createdBy: 'user2',
  },
  {
    _id: '7',
    title: 'Obligatoriskt säkerhetsmöte',
    description:
      'Obligatoriskt möte för alla medlemmar. Vi går igenom säkerhetsrutiner och viktig information.',
    date: '2026-01-08T19:00:00Z',
    location: 'Stora salen, Spexhuset',
    group: 'Alla',
    attendees: 1,
    isAttending: true,
    rsvpDeadline: '2026-01-07T12:00:00Z',
    forceRSVP: true,
    createdBy: 'user2',
  },
];

function EventsPage() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

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
    // Check user roles from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRoles(user.roles || []);
      setUserGroups(user.groups || []);
      setCurrentUserId(user._id || user.id || '');
    } else {
      // Use mock roles and groups for testing
      setUserRoles(['user', 'groupmanager']);
      setUserGroups(['Kör', 'Orkester', 'Teatergruppen', 'Alla']);
      setCurrentUserId('user1'); // Mock user ID
    }
  }, []);

  const canCreateEvent = userRoles.includes('groupmanager') || userRoles.includes('manager');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();

    // Create new event
    const newEvent: Event = {
      _id: String(events.length + 1),
      title: formData.title,
      description: formData.description,
      date: new Date(formData.date).toISOString(),
      location: formData.location,
      group: formData.group,
      attendees: formData.forceRSVP ? 1 : 0,
      maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
      isAttending: formData.forceRSVP,
      rsvpDeadline: formData.rsvpDeadline
        ? new Date(formData.rsvpDeadline).toISOString()
        : undefined,
      forceRSVP: formData.forceRSVP,
      createdBy: currentUserId,
    };

    setEvents((prev) => [...prev, newEvent]);

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
  };

  const handleAttendance = (eventId: string) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event._id === eventId) {
          return {
            ...event,
            isAttending: !event.isAttending,
            attendees: event.isAttending ? event.attendees - 1 : event.attendees + 1,
          };
        }
        return event;
      })
    );
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

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                  <div className="flex-grow">
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
              {userGroups.map((group) => (
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
