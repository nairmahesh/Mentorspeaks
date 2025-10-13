import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ArrowRight, Plus, Trash2, User, Users, Mail, MessageCircle, Link as LinkIcon, Copy, Check, X } from 'lucide-react';

interface Mentor {
  id: string;
  full_name: string;
  professional_title: string;
}

interface Guest {
  type: 'registered' | 'external';
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  professional_title?: string;
  invitation_method?: 'link' | 'email' | 'whatsapp';
  invitation_token?: string;
}

interface Moderator {
  type: 'registered' | 'external' | 'self';
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  professional_title?: string;
  invitation_method?: 'link' | 'email' | 'whatsapp';
  invitation_token?: string;
}

export function CreatePodcastPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [podcastType, setPodcastType] = useState<'single' | 'series' | null>(null);

  const [seriesName, setSeriesName] = useState('');
  const [seriesDescription, setSeriesDescription] = useState('');

  const [episodeName, setEpisodeName] = useState('');
  const [episodeDescription, setEpisodeDescription] = useState('');
  const [selectedModerator, setSelectedModerator] = useState<Moderator | null>(null);
  const [showModeratorModal, setShowModeratorModal] = useState(false);
  const [addModeratorType, setAddModeratorType] = useState<'registered' | 'external'>('registered');
  const [selectedModeratorId, setSelectedModeratorId] = useState('');

  const [guestMode, setGuestMode] = useState<'single' | 'multiple' | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [addGuestType, setAddGuestType] = useState<'registered' | 'external'>('registered');
  const [selectedMentorId, setSelectedMentorId] = useState('');

  const [externalGuestForm, setExternalGuestForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    professional_title: '',
    invitation_method: 'link' as 'link' | 'email' | 'whatsapp'
  });

  const [externalModeratorForm, setExternalModeratorForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    professional_title: '',
    invitation_method: 'link' as 'link' | 'email' | 'whatsapp'
  });

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [moderators, setModerators] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedInviteGuest, setSelectedInviteGuest] = useState<Guest | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [mentorsResult, moderatorsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, professional_title')
        .eq('role', 'mentor'),
      supabase
        .from('podcast_moderators')
        .select('user_id, profiles(id, full_name, professional_title)')
    ]);

    if (mentorsResult.data) setMentors(mentorsResult.data);
    if (moderatorsResult.data) {
      const mods = moderatorsResult.data
        .map((m: any) => m.profiles)
        .filter(Boolean);
      setModerators(mods);
    }
  };

  const handleAddRegisteredModerator = () => {
    const moderator = moderators.find(m => m.id === selectedModeratorId);
    if (!moderator) return;

    setSelectedModerator({
      type: 'registered',
      id: moderator.id,
      full_name: moderator.full_name,
      professional_title: moderator.professional_title
    });

    setSelectedModeratorId('');
    setShowModeratorModal(false);
    setError('');
  };

  const handleAddExternalModerator = () => {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    setSelectedModerator({
      type: 'external',
      id: token,
      full_name: externalModeratorForm.full_name || 'Moderator',
      email: externalModeratorForm.email,
      phone: externalModeratorForm.phone,
      professional_title: externalModeratorForm.professional_title,
      invitation_method: externalModeratorForm.invitation_method,
      invitation_token: token
    });

    setExternalModeratorForm({
      full_name: '',
      email: '',
      phone: '',
      professional_title: '',
      invitation_method: 'link'
    });
    setShowModeratorModal(false);
    setError('');
  };

  const handleAddRegisteredGuest = () => {
    const mentor = mentors.find(m => m.id === selectedMentorId);
    if (!mentor) return;

    const guestExists = guests.some(g => g.id === mentor.id);
    if (guestExists) {
      setError('This guest has already been added');
      return;
    }

    setGuests([...guests, {
      type: 'registered',
      id: mentor.id,
      full_name: mentor.full_name,
      professional_title: mentor.professional_title
    }]);

    setSelectedMentorId('');
    setShowAddGuestModal(false);
    setError('');
  };

  const handleAddExternalGuest = () => {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    setGuests([...guests, {
      type: 'external',
      id: token,
      full_name: externalGuestForm.full_name || 'Guest',
      email: externalGuestForm.email,
      phone: externalGuestForm.phone,
      professional_title: externalGuestForm.professional_title,
      invitation_method: externalGuestForm.invitation_method,
      invitation_token: token
    }]);

    setExternalGuestForm({
      full_name: '',
      email: '',
      phone: '',
      professional_title: '',
      invitation_method: 'link'
    });
    setShowAddGuestModal(false);
    setError('');
  };

  const removeGuest = (guestId: string) => {
    setGuests(guests.filter(g => g.id !== guestId));
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/guest/respond/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      let seriesId = null;

      if (podcastType === 'series') {
        const { data: series, error: seriesError } = await supabase
          .from('podcast_series')
          .insert({
            title: seriesName,
            description: seriesDescription,
            status: 'active',
            created_by: user!.id
          })
          .select()
          .single();

        if (seriesError) throw seriesError;
        seriesId = series.id;
      }

      const primaryGuestId = guests.length > 0 && guests[0].type === 'registered' ? guests[0].id : null;
      const moderatorIdToUse = selectedModerator?.type === 'registered' ? selectedModerator.id : user!.id;

      const { data: episode, error: episodeError } = await supabase
        .from('podcast_episodes')
        .insert({
          series_id: seriesId,
          title: episodeName,
          description: episodeDescription,
          episode_number: 1,
          guest_id: primaryGuestId,
          moderator_id: moderatorIdToUse,
          status: 'draft',
          recording_type: 'video'
        })
        .select()
        .single();

      if (episodeError) throw episodeError;

      if (guests.length > 1) {
        const guestInserts = guests.map((guest, index) => ({
          episode_id: episode.id,
          guest_id: guest.type === 'registered' ? guest.id : null,
          external_guest_name: guest.type === 'external' ? guest.full_name : null,
          external_guest_email: guest.type === 'external' ? guest.email : null,
          external_guest_phone: guest.type === 'external' ? guest.phone : null,
          external_guest_title: guest.type === 'external' ? guest.professional_title : null,
          is_primary: index === 0,
          invitation_token: guest.type === 'external' ? guest.invitation_token : null,
          invitation_sent_via: guest.type === 'external' ? guest.invitation_method : null
        }));

        const { error: guestsError } = await supabase
          .from('podcast_episode_guests')
          .insert(guestInserts);

        if (guestsError) throw guestsError;
      }

      for (const guest of guests.filter(g => g.type === 'external')) {
        const { error: notificationError } = await supabase
          .from('guest_notifications')
          .insert({
            episode_id: episode.id,
            guest_email: guest.email,
            guest_name: guest.full_name,
            invitation_token: guest.invitation_token,
            notification_type: guest.invitation_method === 'email' ? 'email' :
                              guest.invitation_method === 'whatsapp' ? 'whatsapp' : 'link',
            status: guest.invitation_method === 'link' ? 'pending' : 'sent'
          });

        if (notificationError) console.error('Failed to create notification:', notificationError);
      }

      navigate('/podcasts/manage');
    } catch (err: any) {
      setError(err.message || 'Failed to create podcast');
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = podcastType !== null;
  const canProceedStep2 = podcastType === 'single' || (seriesName && seriesDescription);
  const canProceedStep3 = episodeName && episodeDescription;
  const canProceedStep4 = guestMode !== null;
  const canSubmit = guests.length > 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/podcasts/manage')}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Podcast Management</span>
        </button>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Podcast</h1>
        <p className="text-slate-600 mb-8">Follow the steps to create your podcast episode</p>

        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {s}
              </div>
              {s < 5 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Select Podcast Type</h2>
                <p className="text-slate-600 mb-6">Choose whether you want to create a single episode or a series</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPodcastType('single')}
                  className={`p-6 border-2 rounded-lg text-left transition ${
                    podcastType === 'single'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <User className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-1">Single Episode</h3>
                  <p className="text-sm text-slate-600">Create a standalone podcast episode</p>
                </button>

                <button
                  onClick={() => setPodcastType('series')}
                  className={`p-6 border-2 rounded-lg text-left transition ${
                    podcastType === 'series'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Users className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-1">Series</h3>
                  <p className="text-sm text-slate-600">Create a series with multiple episodes</p>
                </button>
              </div>
            </div>
          )}

          {step === 2 && podcastType === 'series' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Series Information</h2>
                <p className="text-slate-600 mb-6">Provide details about your podcast series</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Series Name *
                </label>
                <input
                  type="text"
                  value={seriesName}
                  onChange={(e) => setSeriesName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Tech Leaders Insights"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Series Description *
                </label>
                <textarea
                  value={seriesDescription}
                  onChange={(e) => setSeriesDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe what this series is about..."
                />
              </div>
            </div>
          )}

          {((step === 2 && podcastType === 'single') || (step === 3 && podcastType === 'series')) && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Episode Details</h2>
                <p className="text-slate-600 mb-6">Provide details about your episode</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Episode Name *
                </label>
                <input
                  type="text"
                  value={episodeName}
                  onChange={(e) => setEpisodeName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Building Scalable Startups"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Episode Description *
                </label>
                <textarea
                  value={episodeDescription}
                  onChange={(e) => setEpisodeDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe what this episode is about..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Moderator
                </label>
                {selectedModerator ? (
                  <div className="flex items-start justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{selectedModerator.full_name}</h3>
                        {selectedModerator.type === 'external' && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                            External
                          </span>
                        )}
                      </div>
                      {selectedModerator.professional_title && (
                        <p className="text-sm text-slate-600">{selectedModerator.professional_title}</p>
                      )}
                      {selectedModerator.email && (
                        <p className="text-sm text-slate-500 mt-1">{selectedModerator.email}</p>
                      )}
                      {selectedModerator.type === 'external' && selectedModerator.invitation_token && (
                        <button
                          onClick={() => {
                            setSelectedInviteGuest(selectedModerator as any);
                            setShowInviteModal(true);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 mt-2 flex items-center space-x-1"
                        >
                          <LinkIcon className="w-4 h-4" />
                          <span>View Invitation</span>
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedModerator(null)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowModeratorModal(true)}
                    className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-slate-400 hover:text-slate-900 transition flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Select or Invite Moderator (Default: You)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {((step === 3 && podcastType === 'single') || (step === 4 && podcastType === 'series')) && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Guest Configuration</h2>
                <p className="text-slate-600 mb-6">Choose whether you want single or multiple guests</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setGuestMode('single')}
                  className={`p-6 border-2 rounded-lg text-left transition ${
                    guestMode === 'single'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <User className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-1">Single Guest</h3>
                  <p className="text-sm text-slate-600">One guest for this episode</p>
                </button>

                <button
                  onClick={() => setGuestMode('multiple')}
                  className={`p-6 border-2 rounded-lg text-left transition ${
                    guestMode === 'multiple'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Users className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-1">Multiple Guests</h3>
                  <p className="text-sm text-slate-600">Panel discussion with multiple guests</p>
                </button>
              </div>
            </div>
          )}

          {((step === 4 && podcastType === 'single') || (step === 5 && podcastType === 'series')) && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Add Guests</h2>
                <p className="text-slate-600 mb-6">
                  Add {guestMode === 'single' ? 'a guest' : 'guests'} from your network or invite external guests
                </p>
              </div>

              <div className="space-y-3">
                {guests.map((guest, index) => (
                  <div key={guest.id} className="flex items-start justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{guest.full_name}</h3>
                        {index === 0 && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                            Primary
                          </span>
                        )}
                        {guest.type === 'external' && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                            External
                          </span>
                        )}
                      </div>
                      {guest.professional_title && (
                        <p className="text-sm text-slate-600">{guest.professional_title}</p>
                      )}
                      {guest.email && (
                        <p className="text-sm text-slate-500 mt-1">{guest.email}</p>
                      )}
                      {guest.type === 'external' && guest.invitation_token && (
                        <button
                          onClick={() => {
                            setSelectedInviteGuest(guest);
                            setShowInviteModal(true);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 mt-2 flex items-center space-x-1"
                        >
                          <LinkIcon className="w-4 h-4" />
                          <span>View Invitation</span>
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => removeGuest(guest.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {(guestMode === 'multiple' || guests.length === 0) && (
                  <button
                    onClick={() => setShowAddGuestModal(true)}
                    className="w-full p-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-slate-400 hover:text-slate-900 transition flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add {guests.length > 0 ? 'Another' : ''} Guest</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => {
              if (step > 1) {
                if (podcastType === 'single' && step === 3) {
                  setStep(2);
                } else if (podcastType === 'series' && step === 3) {
                  setStep(2);
                } else {
                  setStep(step - 1);
                }
              }
            }}
            disabled={step === 1}
            className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {step < (podcastType === 'single' ? 4 : 5) ? (
            <button
              onClick={() => {
                if (step === 1 && canProceedStep1) {
                  setStep(2);
                } else if (step === 2 && canProceedStep2) {
                  if (podcastType === 'single') {
                    setStep(3);
                  } else {
                    setStep(3);
                  }
                } else if (step === 3 && canProceedStep3) {
                  setStep(4);
                } else if (step === 4 && canProceedStep4) {
                  setStep(5);
                }
              }}
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2) ||
                (step === 3 && !canProceedStep3) ||
                (step === 4 && !canProceedStep4)
              }
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !canSubmit}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Podcast'}
            </button>
          )}
        </div>

        {showAddGuestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Add Guest</h2>
                <button
                  onClick={() => {
                    setShowAddGuestModal(false);
                    setError('');
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex space-x-2 mb-6 border-b border-slate-200">
                <button
                  onClick={() => setAddGuestType('registered')}
                  className={`px-4 py-2 font-medium transition ${
                    addGuestType === 'registered'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  From List
                </button>
                <button
                  onClick={() => setAddGuestType('external')}
                  className={`px-4 py-2 font-medium transition ${
                    addGuestType === 'external'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  External Guest
                </button>
              </div>

              {addGuestType === 'registered' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Select Mentor
                    </label>
                    <select
                      value={selectedMentorId}
                      onChange={(e) => setSelectedMentorId(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose a mentor...</option>
                      {mentors.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.full_name} - {m.professional_title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleAddRegisteredGuest}
                    disabled={!selectedMentorId}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    Add Guest
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name (Optional - for personalized invite)
                    </label>
                    <input
                      type="text"
                      value={externalGuestForm.full_name}
                      onChange={(e) => setExternalGuestForm({ ...externalGuestForm, full_name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={externalGuestForm.email}
                      onChange={(e) => setExternalGuestForm({ ...externalGuestForm, email: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={externalGuestForm.phone}
                      onChange={(e) => setExternalGuestForm({ ...externalGuestForm, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Professional Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={externalGuestForm.professional_title}
                      onChange={(e) => setExternalGuestForm({ ...externalGuestForm, professional_title: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Send Invitation Via
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setExternalGuestForm({ ...externalGuestForm, invitation_method: 'link' })}
                        className={`p-3 border-2 rounded-lg text-center transition ${
                          externalGuestForm.invitation_method === 'link'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <LinkIcon className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                        <p className="text-sm font-medium">Link</p>
                      </button>
                      <button
                        onClick={() => setExternalGuestForm({ ...externalGuestForm, invitation_method: 'email' })}
                        className={`p-3 border-2 rounded-lg text-center transition ${
                          externalGuestForm.invitation_method === 'email'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Mail className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                        <p className="text-sm font-medium">Email</p>
                      </button>
                      <button
                        onClick={() => setExternalGuestForm({ ...externalGuestForm, invitation_method: 'whatsapp' })}
                        className={`p-3 border-2 rounded-lg text-center transition ${
                          externalGuestForm.invitation_method === 'whatsapp'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <MessageCircle className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                        <p className="text-sm font-medium">WhatsApp</p>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddExternalGuest}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    Add External Guest
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {showModeratorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Select Moderator</h2>
                <button
                  onClick={() => {
                    setShowModeratorModal(false);
                    setError('');
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex space-x-2 mb-6 border-b border-slate-200">
                <button
                  onClick={() => setAddModeratorType('registered')}
                  className={`px-4 py-2 font-medium transition ${
                    addModeratorType === 'registered'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  From List
                </button>
                <button
                  onClick={() => setAddModeratorType('external')}
                  className={`px-4 py-2 font-medium transition ${
                    addModeratorType === 'external'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  External Moderator
                </button>
              </div>

              {addModeratorType === 'registered' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Select Moderator
                    </label>
                    <select
                      value={selectedModeratorId}
                      onChange={(e) => setSelectedModeratorId(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose a moderator...</option>
                      {moderators.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.full_name} - {m.professional_title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleAddRegisteredModerator}
                    disabled={!selectedModeratorId}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    Select Moderator
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name (Optional - for personalized invite)
                    </label>
                    <input
                      type="text"
                      value={externalModeratorForm.full_name}
                      onChange={(e) => setExternalModeratorForm({ ...externalModeratorForm, full_name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Jane Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={externalModeratorForm.email}
                      onChange={(e) => setExternalModeratorForm({ ...externalModeratorForm, email: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., jane@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={externalModeratorForm.phone}
                      onChange={(e) => setExternalModeratorForm({ ...externalModeratorForm, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Professional Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={externalModeratorForm.professional_title}
                      onChange={(e) => setExternalModeratorForm({ ...externalModeratorForm, professional_title: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Send Invitation Via
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setExternalModeratorForm({ ...externalModeratorForm, invitation_method: 'link' })}
                        className={`p-3 border-2 rounded-lg text-center transition ${
                          externalModeratorForm.invitation_method === 'link'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <LinkIcon className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                        <p className="text-sm font-medium">Link</p>
                      </button>
                      <button
                        onClick={() => setExternalModeratorForm({ ...externalModeratorForm, invitation_method: 'email' })}
                        className={`p-3 border-2 rounded-lg text-center transition ${
                          externalModeratorForm.invitation_method === 'email'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Mail className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                        <p className="text-sm font-medium">Email</p>
                      </button>
                      <button
                        onClick={() => setExternalModeratorForm({ ...externalModeratorForm, invitation_method: 'whatsapp' })}
                        className={`p-3 border-2 rounded-lg text-center transition ${
                          externalModeratorForm.invitation_method === 'whatsapp'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <MessageCircle className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                        <p className="text-sm font-medium">WhatsApp</p>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddExternalModerator}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    Add External Moderator
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {showInviteModal && selectedInviteGuest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Invitation Details</h2>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setSelectedInviteGuest(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Name: <span className="font-semibold text-slate-900">{selectedInviteGuest.full_name}</span></p>
                  <p className="text-sm text-slate-600">Method: <span className="font-semibold text-slate-900 capitalize">{selectedInviteGuest.invitation_method}</span></p>
                </div>

                {selectedInviteGuest.invitation_method === 'link' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-slate-900 mb-3">Invitation Message:</p>
                      <div className="p-4 bg-white rounded border border-blue-200 text-sm text-slate-900 whitespace-pre-line">
                        {selectedInviteGuest.full_name && selectedInviteGuest.full_name !== 'Guest'
                          ? `Hello ${selectedInviteGuest.full_name},\n\nYou've been invited to join a podcast episode! Please click the link below to respond to the invitation.\n\n${window.location.origin}/guest/respond/${selectedInviteGuest.invitation_token}`
                          : `Hello,\n\nYou've been invited to join a podcast episode! Please click the link below to respond to the invitation.\n\n${window.location.origin}/guest/respond/${selectedInviteGuest.invitation_token}`
                        }
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          onClick={() => {
                            const message = selectedInviteGuest.full_name && selectedInviteGuest.full_name !== 'Guest'
                              ? `Hello ${selectedInviteGuest.full_name},\n\nYou've been invited to join a podcast episode! Please click the link below to respond to the invitation.\n\n${window.location.origin}/guest/respond/${selectedInviteGuest.invitation_token}`
                              : `Hello,\n\nYou've been invited to join a podcast episode! Please click the link below to respond to the invitation.\n\n${window.location.origin}/guest/respond/${selectedInviteGuest.invitation_token}`;
                            navigator.clipboard.writeText(message);
                            setCopiedToken(selectedInviteGuest.invitation_token!);
                            setTimeout(() => setCopiedToken(null), 2000);
                          }}
                          className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                          {copiedToken === selectedInviteGuest.invitation_token ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy Full Message</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm font-medium text-slate-700 mb-2">Invitation Link Only:</p>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={`${window.location.origin}/guest/respond/${selectedInviteGuest.invitation_token}`}
                          readOnly
                          className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded bg-white"
                        />
                        <button
                          onClick={() => copyInviteLink(selectedInviteGuest.invitation_token!)}
                          className="p-2 bg-slate-600 text-white rounded hover:bg-slate-700 transition"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Copy just the link if needed</p>
                    </div>
                  </div>
                )}

                {selectedInviteGuest.invitation_method === 'email' && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                      An email invitation will be sent to <span className="font-semibold">{selectedInviteGuest.email}</span> after you create the podcast.
                    </p>
                  </div>
                )}

                {selectedInviteGuest.invitation_method === 'whatsapp' && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-900 mb-3">
                      Send this message via WhatsApp to <span className="font-semibold">{selectedInviteGuest.phone || selectedInviteGuest.email}</span>:
                    </p>
                    <div className="p-3 bg-white rounded border border-green-200 text-sm">
                      You've been invited to join a podcast! Click here to respond: {window.location.origin}/guest/respond/{selectedInviteGuest.invitation_token}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
