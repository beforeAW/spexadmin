import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import FormField from '../components/FormField';
import { authAPI, eventAPI } from '../utils/api';

interface Attendee {
  name: string;
  allergies?: string;
  foodPreference?: string;
}

type RSVP = {
  userId: {
    _id: string;
    firstname: string;
    lastname: string;
    allergys?: string;
    foodpreference?: string;
  };
  status: string;
};

interface Event {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  location: string;
  groupId?: { _id: string; name: string };
  rsvps?: Array<RSVP>;
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
  attendeesList?: Attendee[];
  createdBy?: string;
  rsvpDeadline?: string;
  forceRSVP?: boolean;
}

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  nickname?: string;
  roles: string[];
}

function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<DisplayEvent | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state for editing events
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    group: '',
    maxAttendees: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        navigate('/events');
        return;
      }

      try {
        setIsLoading(true);
        const [userData, eventData] = await Promise.all([
          authAPI.getCurrentUser(),
          eventAPI.getById(id) as Promise<Event>,
        ]);

        setUser(userData);

        // Transform event to display format
        const displayEvent: DisplayEvent = {
          _id: eventData._id,
          title: eventData.name,
          description: eventData.description,
          date: eventData.startDate,
          location: eventData.location,
          group: eventData.groupId?.name || 'Alla',
          attendees: eventData.rsvps?.filter((r: RSVP) => r.status === 'yes').length || 0,
          maxAttendees: eventData.maxAttendees,
          isAttending:
            eventData.rsvps?.some(
              (r: RSVP) => r.userId._id === userData._id && r.status === 'yes'
            ) || false,
          attendeesList: eventData.rsvps
            ?.filter((r: RSVP) => r.status === 'yes')
            .map((r: RSVP) => ({
              name: `${r.userId.firstname} ${r.userId.lastname}`,
              allergies: r.userId.allergys,
              foodPreference: r.userId.foodpreference,
            })),
          createdBy: eventData.createdBy,
          rsvpDeadline: eventData.rsvpDeadline,
          forceRSVP: eventData.forceRSVP,
        };

        setEvent(displayEvent);

        // Pre-fill form with event data
        setFormData({
          title: displayEvent.title,
          description: displayEvent.description,
          date: new Date(displayEvent.date).toISOString().slice(0, 16),
          location: displayEvent.location,
          group: displayEvent.group,
          maxAttendees: displayEvent.maxAttendees ? String(displayEvent.maxAttendees) : '',
        });
      } catch (error) {
        console.error('Failed to fetch event:', error);
        navigate('/events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const canEditEvent =
    user?.roles.includes('groupmanager') || user?.roles.includes('manager') || false;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!event || !id) return;

    try {
      await eventAPI.update(id, {
        name: formData.title,
        description: formData.description,
        startDate: new Date(formData.date).toISOString(),
        location: formData.location,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
      });

      // Refresh event
      const eventData = await eventAPI.getById(id);
      const displayEvent: DisplayEvent = {
        _id: eventData._id,
        title: eventData.name,
        description: eventData.description,
        date: eventData.startDate,
        location: eventData.location,
        group: eventData.groupId?.name || 'Alla',
        attendees: eventData.rsvps?.filter((r: any) => r.status === 'yes').length || 0,
        maxAttendees: eventData.maxAttendees,
        isAttending:
          eventData.rsvps?.some((r: any) => r.userId._id === user?._id && r.status === 'yes') ||
          false,
        attendeesList: eventData.rsvps
          ?.filter((r: any) => r.status === 'yes')
          .map((r: any) => ({
            name: `${r.userId.firstname} ${r.userId.lastname}`,
            allergies: r.userId.allergys,
            foodPreference: r.userId.foodpreference,
          })),
        createdBy: eventData.createdBy,
        rsvpDeadline: eventData.rsvpDeadline,
        forceRSVP: eventData.forceRSVP,
      };
      setEvent(displayEvent);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update event:', error);
      alert('Failed to update event. Please try again.');
    }
  };

  const handleDeleteEvent = async () => {
    if (!id) return;

    try {
      await eventAPI.delete(id);
      navigate('/events');
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleAttendance = async () => {
    if (!event || !id || !user) return;

    try {
      const newStatus = event.isAttending ? 'no' : 'yes';
      await eventAPI.rsvp(id, user._id, newStatus);

      // Refresh event
      const eventData: Event = await eventAPI.getById(id);
      const displayEvent: DisplayEvent = {
        _id: eventData._id,
        title: eventData.name,
        description: eventData.description,
        date: eventData.startDate,
        location: eventData.location,
        group: eventData.groupId?.name || 'Alla',
        attendees: eventData.rsvps?.filter((r: RSVP) => r.status === 'yes').length || 0,
        maxAttendees: eventData.maxAttendees,
        isAttending:
          eventData.rsvps?.some((r: RSVP) => r.userId._id === user?._id && r.status === 'yes') ||
          false,
        attendeesList: eventData.rsvps
          ?.filter((r: RSVP) => r.status === 'yes')
          .map((r: RSVP) => ({
            name: `${r.userId.firstname} ${r.userId.lastname}`,
            allergies: r.userId.allergys,
            foodPreference: r.userId.foodpreference,
          })),
        createdBy: eventData.createdBy,
        rsvpDeadline: eventData.rsvpDeadline,
        forceRSVP: eventData.forceRSVP,
      };
      setEvent(displayEvent);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-karspex-burgundy">
        <Header />
        <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-karspex-cream rounded-lg shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-karspex-burgundy mb-4"></div>
            <p className="text-karspex-gray-800">Loading event...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-karspex-burgundy">
        <Header />
        <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-karspex-cream rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-karspex-black mb-4">Event Not Found</h2>
            <p className="text-karspex-gray-800 mb-6">
              The event you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate('/events')}>
              <ArrowLeft size={20} className="mr-2" />
              Back to Events
            </Button>
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
        <div className="mb-6 flex justify-center lg:justify-start">
          <Button variant="secondary" onClick={() => navigate('/events')}>
            <ArrowLeft size={20} className="mr-2" />
            Back to Events
          </Button>
        </div>

        <div className="bg-karspex-cream rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-karspex-black">{event.title}</h1>

            {canEditEvent && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 text-karspex-gray-800 hover:text-karspex-gold transition-colors duration-200"
                  title="Edit Event"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="p-2 text-karspex-gray-800 hover:text-karspex-red transition-colors duration-200"
                  title="Delete Event"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start text-karspex-gray-800">
              <Calendar size={20} className="mr-3 mt-1 shrink-0" />
              <span className="text-lg">{formatDate(event.date)}</span>
            </div>

            <div className="flex items-start text-karspex-gray-800">
              <MapPin size={20} className="mr-3 mt-1 shrink-0" />
              <span className="text-lg">{event.location}</span>
            </div>

            {user?._id === event.createdBy && (
              <div className="flex items-start text-karspex-gray-800">
                <Users size={20} className="mr-3 mt-1 shrink-0" />
                <span className="text-lg">
                  {event.attendees} attendees
                  {event.maxAttendees && ` (max ${event.maxAttendees})`}
                </span>
              </div>
            )}

            {event.rsvpDeadline && (
              <div className="mt-4 p-4 bg-karspex-burgundy bg-opacity-10 rounded-lg">
                <p className="text-white">
                  <span className="font-medium">RSVP Deadline:</span>{' '}
                  {formatDate(event.rsvpDeadline)}
                </p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-karspex-burgundy text-karspex-cream">
              {event.group}
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-karspex-black mb-3">Description</h2>
            <p className="text-karspex-gray-800 text-lg whitespace-pre-line">{event.description}</p>
          </div>

          {event.createdBy && (
            <div className="mb-8 pb-8 border-b border-karspex-gray-100">
              <p className="text-sm text-karspex-gray-800">
                <span className="font-medium">Created by event manager</span>
              </p>
            </div>
          )}

          {user?._id === event.createdBy &&
            event.attendeesList &&
            event.attendeesList.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-karspex-black mb-3">
                  Attendees ({event.attendees})
                </h2>
                <ul className="space-y-2">
                  {event.attendeesList.slice(0, 10).map((attendee, index) => (
                    <li key={index} className="text-karspex-gray-800 font-medium">
                      {attendee.name}
                    </li>
                  ))}
                  {event.attendeesList.length > 10 && (
                    <li className="text-karspex-gray-800 italic">
                      And {event.attendeesList.length - 10} more...
                    </li>
                  )}
                </ul>

                {/* Summary Section */}
                <div className="mt-6 p-4 bg-karspex-burgundy rounded-lg">
                  <h3 className="text-lg font-bold text-white mb-3">Dietary Summary</h3>

                  {/* Quick Count Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mb-4">
                    {(() => {
                      const dietaryMap: Record<
                        string,
                        { count: number; type: 'allergy' | 'preference' }
                      > = {};

                      event.attendeesList?.forEach((attendee) => {
                        if (attendee.allergies) {
                          attendee.allergies.split(',').forEach((allergy) => {
                            const trimmed = allergy.trim();
                            if (!dietaryMap[trimmed]) {
                              dietaryMap[trimmed] = { count: 0, type: 'allergy' };
                            }
                            dietaryMap[trimmed].count++;
                          });
                        }
                        if (attendee.foodPreference) {
                          const pref = attendee.foodPreference;
                          if (!dietaryMap[pref]) {
                            dietaryMap[pref] = { count: 0, type: 'preference' };
                          }
                          dietaryMap[pref].count++;
                        }
                      });

                      // Sort by count (descending) then alphabetically
                      const sortedEntries = Object.entries(dietaryMap).sort((a, b) => {
                        if (b[1].count !== a[1].count) {
                          return b[1].count - a[1].count;
                        }
                        return a[0].localeCompare(b[0]);
                      });

                      return (
                        <>
                          {sortedEntries.map(([item, data]) => (
                            <div
                              key={item}
                              className="flex items-center justify-between text-sm text-white py-1"
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className={
                                    data.type === 'allergy'
                                      ? 'text-karspex-gold font-medium'
                                      : 'text-white'
                                  }
                                >
                                  {data.type === 'allergy' ? '⚠' : '🍴'}
                                </span>
                                <span>{item}</span>
                              </span>
                              <span className="text-karspex-gold font-medium">
                                {data.count} {data.count === 1 ? 'person' : 'personer'}
                              </span>
                            </div>
                          ))}
                        </>
                      );
                    })()}
                  </div>

                  {/* Detailed Breakdown by Person */}
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <h4 className="text-sm font-bold text-white mb-2">Detailed Breakdown:</h4>
                    <div className="space-y-2">
                      {event.attendeesList
                        ?.filter((attendee) => attendee.allergies || attendee.foodPreference)
                        .map((attendee, index) => (
                          <div
                            key={index}
                            className="text-sm text-white bg-white/10 rounded px-3 py-2"
                          >
                            <div className="font-medium text-karspex-gold">{attendee.name}</div>
                            <div className="ml-2 mt-1 space-y-0.5">
                              {attendee.foodPreference && (
                                <div className="flex items-center gap-1">
                                  <span>🍴</span>
                                  <span>{attendee.foodPreference}</span>
                                </div>
                              )}
                              {attendee.allergies && (
                                <div className="flex items-center gap-1">
                                  <span className="text-karspex-gold">⚠</span>
                                  <span>{attendee.allergies}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>

        <div className="flex flex-col items-center lg:items-start gap-3 mt-6">
          {event.forceRSVP && (
            <span className="px-4 py-1 rounded-full text-sm font-medium bg-karspex-red text-white">
              Response Required
            </span>
          )}
          {isRsvpDeadlinePassed(event.rsvpDeadline) ? (
            <div className="px-6 py-3 rounded-lg bg-karspex-cream border-2 border-karspex-burgundy">
              <span className="font-medium text-karspex-black text-lg">
                Your choice: {event.isAttending ? 'Attending' : 'Not Attending'}
              </span>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                variant={event.isAttending ? 'primary' : 'secondary'}
                onClick={() => {
                  if (!event.isAttending) {
                    handleAttendance();
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
                    handleAttendance();
                  }
                }}
                className={!event.isAttending ? 'ring-2 ring-karspex-gold' : ''}
              >
                Not Attending
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Edit Event Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Event">
        <form onSubmit={handleEditEvent} className="space-y-4">
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
            <Input
              id="group"
              name="group"
              type="text"
              value={formData.group}
              onChange={handleInputChange}
              required
            />
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

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Event"
      >
        <div className="space-y-4">
          <p className="text-karspex-gray-800">
            Are you sure you want to delete this event? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteEvent}
              className="bg-karspex-red hover:bg-red-700"
            >
              Delete Event
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default EventDetailPage;
