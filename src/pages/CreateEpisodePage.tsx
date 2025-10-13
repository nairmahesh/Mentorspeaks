import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Sparkles, Plus, Trash2, ArrowLeft, Users, User, UserPlus, Mail, MessageCircle, Copy, Check, Link } from 'lucide-react';

interface Series {
  id: string;
  title: string;
}

interface Mentor {
  id: string;
  full_name: string;
  professional_title: string;
  bio: string;
  linkedin_url: string;
  years_of_experience: number;
}

interface Question {
  question_text: string;
  answer_text: string;
  is_ai_generated: boolean;
}

export function CreateEpisodePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [series, setSeries] = useState<Series[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [moderators, setModerators] = useState<Mentor[]>([]);

  const [seriesId, setSeriesId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [guestMode, setGuestMode] = useState<'single' | 'multiple'>('single');
  const [guestId, setGuestId] = useState('');
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [externalGuests, setExternalGuests] = useState<Array<{
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    professional_title?: string;
    invitation_method: 'link' | 'email' | 'whatsapp' | 'both';
  }>>([]);
  const [primaryGuestId, setPrimaryGuestId] = useState('');
  const [showExternalGuestForm, setShowExternalGuestForm] = useState(false);
  const [externalGuestForm, setExternalGuestForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    professional_title: '',
    invitation_method: 'link' as 'link' | 'email' | 'whatsapp' | 'both'
  });
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [visibleInviteLink, setVisibleInviteLink] = useState<string | null>(null);
  const [invitationModalGuest, setInvitationModalGuest] = useState<{
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    professional_title?: string;
    invitation_method: 'link' | 'email' | 'whatsapp' | 'both';
  } | null>(null);
  const [moderatorId, setModeratorId] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState('1');
  const [recordingType, setRecordingType] = useState<'video' | 'audio'>('video');
  const [scheduledAt, setScheduledAt] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [seriesResult, mentorsResult, moderatorsResult] = await Promise.all([
      supabase.from('podcast_series').select('id, title').eq('status', 'active'),
      supabase.from('profiles').select('id, full_name, professional_title, bio, linkedin_url, years_of_experience').eq('role', 'mentor'),
      supabase
        .from('podcast_moderators')
        .select('user_id, profiles(id, full_name, professional_title)')
    ]);

    if (seriesResult.data) setSeries(seriesResult.data);
    if (mentorsResult.data) setMentors(mentorsResult.data);
    if (moderatorsResult.data) {
      const mods = moderatorsResult.data
        .map((m: any) => m.profiles)
        .filter(Boolean);
      setModerators(mods);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { question_text: '', answer_text: '', is_ai_generated: false }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | boolean) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const generateAIQuestions = async () => {
    const aiQuestions: Question[] = [
      {
        question_text: 'Can you tell us about your professional journey and what led you to your current role?',
        answer_text: '',
        is_ai_generated: true
      },
      {
        question_text: 'What are some of the biggest challenges you\'ve faced in your career, and how did you overcome them?',
        answer_text: '',
        is_ai_generated: true
      },
      {
        question_text: 'What advice would you give to someone just starting out in your industry?',
        answer_text: '',
        is_ai_generated: true
      },
      {
        question_text: 'How do you stay current with the latest trends and developments in your field?',
        answer_text: '',
        is_ai_generated: true
      },
      {
        question_text: 'What do you think is the most important skill for success in your profession?',
        answer_text: '',
        is_ai_generated: true
      }
    ];

    setQuestions([...questions, ...aiQuestions]);
  };

  const toggleGuestSelection = (guestId: string) => {
    if (selectedGuests.includes(guestId)) {
      setSelectedGuests(selectedGuests.filter(id => id !== guestId));
      if (primaryGuestId === guestId) {
        setPrimaryGuestId('');
      }
    } else {
      setSelectedGuests([...selectedGuests, guestId]);
      if (!primaryGuestId) {
        setPrimaryGuestId(guestId);
      }
    }
  };

  const addExternalGuest = () => {
    if (!externalGuestForm.full_name) {
      alert('Please provide guest name');
      return;
    }

    // Only require email if invitation method needs it
    if (externalGuestForm.invitation_method !== 'link' && !externalGuestForm.email) {
      alert('Please provide guest email');
      return;
    }

    // Only require phone if WhatsApp is needed
    if ((externalGuestForm.invitation_method === 'whatsapp' || externalGuestForm.invitation_method === 'both') && !externalGuestForm.phone) {
      alert('Please provide guest phone number for WhatsApp');
      return;
    }

    const newGuest = {
      id: `temp-${Date.now()}`,
      ...externalGuestForm
    };

    setExternalGuests([...externalGuests, newGuest]);
    setExternalGuestForm({
      full_name: '',
      email: '',
      phone: '',
      professional_title: '',
      invitation_method: 'link'
    });
    setShowExternalGuestForm(false);

    // Set as primary if first guest
    if (!primaryGuestId && selectedGuests.length === 0) {
      setPrimaryGuestId(newGuest.id);
    }
  };

  const removeExternalGuest = (guestId: string) => {
    setExternalGuests(externalGuests.filter(g => g.id !== guestId));
    if (primaryGuestId === guestId) {
      setPrimaryGuestId('');
    }
  };

  const generateInvitationLink = (guest: { id: string; full_name: string }) => {
    const nameSlug = guest.full_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `https://effymentor.com/podcasts/invitation/${nameSlug}-${guest.id.split('-').pop()}`;
  };

  const sendInvitation = async (guestId: string, method: 'email' | 'whatsapp' | 'both') => {
    const guest = externalGuests.find(g => g.id === guestId);
    if (!guest) return;

    // Get invitation message from database function
    const { data: message } = await supabase.rpc('get_invitation_message', {
      episode_title: title || 'Podcast Episode',
      episode_description: description,
      moderator_name: moderators.find(m => m.id === moderatorId)?.full_name || 'Our Team',
      invitation_token: 'will-be-generated',
      message_type: method === 'email' ? 'email' : 'whatsapp'
    });

    if (method === 'email' || method === 'both') {
      const subject = encodeURIComponent(`Podcast Invitation: ${title || 'Our Show'}`);
      const body = encodeURIComponent(message || '');
      window.open(`mailto:${guest.email}?subject=${subject}&body=${body}`, '_blank');
    }

    if (method === 'whatsapp' || method === 'both') {
      const whatsappMessage = encodeURIComponent(message || '');
      const phone = guest.phone?.replace(/\D/g, '') || '';
      window.open(`https://wa.me/${phone}?text=${whatsappMessage}`, '_blank');
    }
  };

  const copyInvitationMessage = async (guestId: string, method: 'email' | 'whatsapp') => {
    const guest = externalGuests.find(g => g.id === guestId);
    if (!guest) return;

    const invitationUrl = generateInvitationLink(guest);

    let message = '';
    if (method === 'email') {
      message = `Hi ${guest.full_name},

We'd love to have you as a guest on our podcast "${title || 'Our Show'}"!

${description ? `About this episode: ${description}\n\n` : ''}Click here to view details and confirm your participation:
${invitationUrl}

Looking forward to hearing from you!`;
    } else {
      message = `Hi ${guest.full_name}! We'd love to have you as a guest on our podcast "${title || 'Our Show'}"! Click here to view details: ${invitationUrl}`;
    }

    await navigator.clipboard.writeText(message);
    setCopiedInviteId(`${guestId}-${method}`);
    setTimeout(() => setCopiedInviteId(null), 2000);
  };

  const showInvitationModal = (guestId: string) => {
    const guest = externalGuests.find(g => g.id === guestId);
    if (guest) {
      setInvitationModalGuest(guest);
    }
  };

  const copyInvitationLink = async (guestId: string) => {
    const guest = externalGuests.find(g => g.id === guestId);
    if (!guest) return;

    const invitationUrl = generateInvitationLink(guest);

    await navigator.clipboard.writeText(invitationUrl);
    setCopiedInviteId(`${guestId}-link`);
    setVisibleInviteLink(invitationUrl);
    setTimeout(() => setCopiedInviteId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create episode
      const { data: episode, error: episodeError } = await supabase
        .from('podcast_episodes')
        .insert({
          series_id: seriesId || null,
          title,
          description,
          guest_id: (guestMode === 'single' && guestId) ? guestId : null,
          moderator_id: moderatorId || user!.id,
          episode_number: parseInt(episodeNumber),
          recording_type: recordingType,
          scheduled_at: scheduledAt || null,
          status: 'draft'
        })
        .select()
        .single();

      if (episodeError) throw episodeError;

      // Handle single guest mode with external guest
      if (guestMode === 'single' && externalGuests.length > 0 && episode) {
        const extGuest = externalGuests[0];

        // Create external guest record
        const { data: externalGuestData, error: externalError } = await supabase
          .from('podcast_external_guests')
          .insert({
            full_name: extGuest.full_name,
            email: extGuest.email,
            phone: extGuest.phone || null,
            professional_title: extGuest.professional_title || null
          })
          .select()
          .single();

        if (externalError) throw externalError;

        // Add to guests table
        const { error: guestError } = await supabase
          .from('podcast_episode_guests')
          .insert({
            episode_id: episode.id,
            guest_id: null,
            external_guest_id: externalGuestData.id,
            guest_order: 1,
            is_primary_guest: true
          });

        if (guestError) throw guestError;

        // Create invitation
        const { data: invitation, error: inviteError } = await supabase
          .from('podcast_guest_invitations')
          .insert({
            episode_id: episode.id,
            external_guest_id: externalGuestData.id,
            invitation_method: extGuest.invitation_method,
            guest_order: 1,
            is_primary_guest: true
          })
          .select()
          .single();

        if (inviteError) throw inviteError;

        // Send invitation
        if (invitation) {
          sendInvitation(extGuest.id, extGuest.invitation_method);
        }
      }

      // If multiple guests, insert into podcast_episode_guests
      if (guestMode === 'multiple' && (selectedGuests.length > 0 || externalGuests.length > 0) && episode) {
        let guestOrder = 1;
        const guestsData = [];

        // Add internal guests
        for (const gId of selectedGuests) {
          guestsData.push({
            episode_id: episode.id,
            guest_id: gId,
            external_guest_id: null,
            guest_order: guestOrder++,
            is_primary_guest: gId === primaryGuestId
          });
        }

        // Add external guests
        for (const extGuest of externalGuests) {
          // Create external guest record
          const { data: externalGuestData, error: externalError } = await supabase
            .from('podcast_external_guests')
            .insert({
              full_name: extGuest.full_name,
              email: extGuest.email,
              phone: extGuest.phone || null,
              professional_title: extGuest.professional_title || null
            })
            .select()
            .single();

          if (externalError) throw externalError;

          // Add to guests list
          guestsData.push({
            episode_id: episode.id,
            guest_id: null,
            external_guest_id: externalGuestData.id,
            guest_order: guestOrder++,
            is_primary_guest: extGuest.id === primaryGuestId
          });

          // Create invitation
          const { data: invitation, error: inviteError } = await supabase
            .from('podcast_guest_invitations')
            .insert({
              episode_id: episode.id,
              external_guest_id: externalGuestData.id,
              invitation_method: extGuest.invitation_method,
              guest_order: guestOrder - 1,
              is_primary_guest: extGuest.id === primaryGuestId
            })
            .select()
            .single();

          if (inviteError) throw inviteError;

          // Send invitation
          if (invitation) {
            sendInvitation(extGuest.id, extGuest.invitation_method);
          }
        }

        if (guestsData.length > 0) {
          const { error: guestsError } = await supabase
            .from('podcast_episode_guests')
            .insert(guestsData);

          if (guestsError) throw guestsError;
        }
      }

      if (questions.length > 0 && episode) {
        const questionsData = questions.map((q, index) => ({
          episode_id: episode.id,
          question_text: q.question_text,
          answer_text: q.answer_text || null,
          question_order: index + 1,
          is_ai_generated: q.is_ai_generated,
          created_by: user!.id
        }));

        const { error: questionsError } = await supabase
          .from('podcast_questions')
          .insert(questionsData);

        if (questionsError) throw questionsError;
      }

      navigate(`/podcasts/episode/${episode.id}/share`);
    } catch (err: any) {
      setError(err.message || 'Failed to create episode');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Create New Podcast Episode</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Episode Details</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Podcast Series (Optional)
              </label>
              <select
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Standalone Episode</option>
                {series.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Episode Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="e.g., Journey from Developer to CTO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Episode description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Podcast Format *
              </label>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setGuestMode('single');
                    setSelectedGuests([]);
                    setPrimaryGuestId('');
                  }}
                  className={`p-4 rounded-xl border-2 transition ${
                    guestMode === 'single'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <User className={`w-8 h-8 mx-auto mb-2 ${guestMode === 'single' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="font-semibold text-slate-900">Single Guest</div>
                  <div className="text-xs text-slate-600 mt-1">One-on-one interview</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGuestMode('multiple');
                    setGuestId('');
                  }}
                  className={`p-4 rounded-xl border-2 transition ${
                    guestMode === 'multiple'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Users className={`w-8 h-8 mx-auto mb-2 ${guestMode === 'multiple' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className="font-semibold text-slate-900">Multiple Guests</div>
                  <div className="text-xs text-slate-600 mt-1">Panel discussion</div>
                </button>
              </div>

              {guestMode === 'single' ? (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-slate-700">
                        Select Guest *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowExternalGuestForm(true)}
                        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Invite External Guest</span>
                      </button>
                    </div>

                    {externalGuests.length === 0 ? (
                      <>
                        <select
                          value={guestId}
                          onChange={(e) => setGuestId(e.target.value)}
                          required={externalGuests.length === 0}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        >
                          <option value="">Select a mentor</option>
                          {mentors.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.full_name} {m.professional_title && `- ${m.professional_title}`}
                            </option>
                          ))}
                        </select>

                        {guestId && mentors.find(m => m.id === guestId) && (
                          <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <h3 className="font-semibold text-slate-900 mb-2">Guest Profile</h3>
                            {(() => {
                              const guest = mentors.find(m => m.id === guestId);
                              return guest ? (
                                <div className="space-y-2 text-sm">
                                  <p className="text-slate-700">
                                    <span className="font-medium">Name:</span> {guest.full_name}
                                  </p>
                                  {guest.professional_title && (
                                    <p className="text-slate-700">
                                      <span className="font-medium">Title:</span> {guest.professional_title}
                                    </p>
                                  )}
                                  {guest.years_of_experience && (
                                    <p className="text-slate-700">
                                      <span className="font-medium">Experience:</span> {guest.years_of_experience} years
                                    </p>
                                  )}
                                  {guest.bio && (
                                    <p className="text-slate-600 mt-2">{guest.bio}</p>
                                  )}
                                  {guest.linkedin_url && (
                                    <a
                                      href={guest.linkedin_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-700 inline-block mt-2"
                                    >
                                      View LinkedIn Profile →
                                    </a>
                                  )}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-slate-900">{externalGuests[0].full_name}</span>
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                External Guest
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">{externalGuests[0].email}</p>
                            {externalGuests[0].professional_title && (
                              <p className="text-sm text-slate-600">{externalGuests[0].professional_title}</p>
                            )}
                            <div className="flex items-center space-x-2 mt-3">
                              <span className="text-xs text-slate-500">Will be invited via:</span>
                              {externalGuests[0].invitation_method === 'link' && (
                                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded flex items-center space-x-1">
                                  <Link className="w-3 h-3" />
                                  <span>Link Only</span>
                                </span>
                              )}
                              {externalGuests[0].invitation_method === 'email' && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center space-x-1">
                                  <Mail className="w-3 h-3" />
                                  <span>Email</span>
                                </span>
                              )}
                              {externalGuests[0].invitation_method === 'whatsapp' && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center space-x-1">
                                  <MessageCircle className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </span>
                              )}
                              {externalGuests[0].invitation_method === 'both' && (
                                <>
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center space-x-1">
                                    <Mail className="w-3 h-3" />
                                    <span>Email</span>
                                  </span>
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center space-x-1">
                                    <MessageCircle className="w-3 h-3" />
                                    <span>WhatsApp</span>
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <button
                                type="button"
                                onClick={() => showInvitationModal(externalGuests[0].id)}
                                className="flex items-center space-x-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition"
                              >
                                <Mail className="w-3 h-3" />
                                <span>View Invitation</span>
                              </button>
                              {externalGuests[0].phone && (
                                <button
                                  type="button"
                                  onClick={() => copyInvitationMessage(externalGuests[0].id, 'whatsapp')}
                                  className="flex items-center space-x-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition"
                                >
                                  {copiedInviteId === `${externalGuests[0].id}-whatsapp` ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <MessageCircle className="w-3 h-3" />
                                      <span>WhatsApp</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setExternalGuests([])}
                            className="text-red-600 hover:text-red-700 p-1 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* External Guest Form Modal - same as multiple mode */}
                    {showExternalGuestForm && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                          <h3 className="text-lg font-semibold text-slate-900 mb-4">Invite External Guest</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Full Name *
                              </label>
                              <input
                                type="text"
                                value={externalGuestForm.full_name}
                                onChange={(e) => setExternalGuestForm({ ...externalGuestForm, full_name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="John Doe"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Email {externalGuestForm.invitation_method === 'link' ? '(Optional)' : '*'}
                              </label>
                              <input
                                type="email"
                                value={externalGuestForm.email}
                                onChange={(e) => setExternalGuestForm({ ...externalGuestForm, email: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="john@example.com"
                                required={externalGuestForm.invitation_method !== 'link'}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Phone (Optional, for WhatsApp)
                              </label>
                              <input
                                type="tel"
                                value={externalGuestForm.phone}
                                onChange={(e) => setExternalGuestForm({ ...externalGuestForm, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="+1234567890"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Professional Title (Optional)
                              </label>
                              <input
                                type="text"
                                value={externalGuestForm.professional_title}
                                onChange={(e) => setExternalGuestForm({ ...externalGuestForm, professional_title: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="CEO, Tech Company"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Send Invitation Via
                              </label>
                              <div className="space-y-2">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    checked={externalGuestForm.invitation_method === 'link'}
                                    onChange={() => setExternalGuestForm({ ...externalGuestForm, invitation_method: 'link' })}
                                    className="text-blue-600"
                                  />
                                  <Link className="w-4 h-4 text-slate-600" />
                                  <span className="text-sm">Link Only (No contact needed)</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    checked={externalGuestForm.invitation_method === 'email'}
                                    onChange={() => setExternalGuestForm({ ...externalGuestForm, invitation_method: 'email' })}
                                    className="text-blue-600"
                                  />
                                  <Mail className="w-4 h-4 text-slate-600" />
                                  <span className="text-sm">Email Only</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    checked={externalGuestForm.invitation_method === 'whatsapp'}
                                    onChange={() => setExternalGuestForm({ ...externalGuestForm, invitation_method: 'whatsapp' })}
                                    className="text-blue-600"
                                  />
                                  <MessageCircle className="w-4 h-4 text-slate-600" />
                                  <span className="text-sm">WhatsApp Only</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    checked={externalGuestForm.invitation_method === 'both'}
                                    onChange={() => setExternalGuestForm({ ...externalGuestForm, invitation_method: 'both' })}
                                    className="text-blue-600"
                                  />
                                  <span className="text-sm">Both Email & WhatsApp</span>
                                </label>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-3 mt-6">
                            <button
                              type="button"
                              onClick={() => {
                                addExternalGuest();
                                if (guestMode === 'single') {
                                  setGuestId(''); // Clear internal guest selection
                                }
                              }}
                              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                            >
                              Add Guest
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowExternalGuestForm(false)}
                              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-slate-700">
                        Select Guests
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowExternalGuestForm(true)}
                        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Invite External Guest</span>
                      </button>
                    </div>

                    {/* Internal Guests */}
                    {mentors.length > 0 && (
                      <>
                        <p className="text-xs text-slate-600 font-medium">Platform Mentors</p>
                        <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-3">
                          {mentors.map((mentor) => (
                            <div
                              key={mentor.id}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                                selectedGuests.includes(mentor.id)
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                              onClick={() => toggleGuestSelection(mentor.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedGuests.includes(mentor.id)}
                                      onChange={() => toggleGuestSelection(mentor.id)}
                                      className="rounded text-blue-600"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className="font-medium text-slate-900">{mentor.full_name}</span>
                                    {primaryGuestId === mentor.id && (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                        Primary
                                      </span>
                                    )}
                                  </div>
                                  {mentor.professional_title && (
                                    <p className="text-sm text-slate-600 ml-6">{mentor.professional_title}</p>
                                  )}
                                </div>
                                {selectedGuests.includes(mentor.id) && primaryGuestId !== mentor.id && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPrimaryGuestId(mentor.id);
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-700 underline ml-2"
                                  >
                                    Set as Primary
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* External Guests */}
                    {externalGuests.length > 0 && (
                      <>
                        <p className="text-xs text-slate-600 font-medium mt-4">External Guests (Will be invited)</p>
                        <div className="space-y-2">
                          {externalGuests.map((guest) => (
                            <div
                              key={guest.id}
                              className="p-3 rounded-lg border-2 border-green-200 bg-green-50"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-slate-900">{guest.full_name}</span>
                                    {primaryGuestId === guest.id && (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                        Primary
                                      </span>
                                    )}
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                      External
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-600 mt-1">{guest.email}</p>
                                  {guest.professional_title && (
                                    <p className="text-sm text-slate-600">{guest.professional_title}</p>
                                  )}
                                  <div className="flex items-center space-x-2 mt-2">
                                    <span className="text-xs text-slate-500">Will be invited via:</span>
                                    {guest.invitation_method === 'link' && (
                                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded flex items-center space-x-1">
                                        <Link className="w-3 h-3" />
                                        <span>Link Only</span>
                                      </span>
                                    )}
                                    {guest.invitation_method === 'email' && (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center space-x-1">
                                        <Mail className="w-3 h-3" />
                                        <span>Email</span>
                                      </span>
                                    )}
                                    {guest.invitation_method === 'whatsapp' && (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center space-x-1">
                                        <MessageCircle className="w-3 h-3" />
                                        <span>WhatsApp</span>
                                      </span>
                                    )}
                                    {guest.invitation_method === 'both' && (
                                      <>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center space-x-1">
                                          <Mail className="w-3 h-3" />
                                          <span>Email</span>
                                        </span>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center space-x-1">
                                          <MessageCircle className="w-3 h-3" />
                                          <span>WhatsApp</span>
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 mt-3">
                                    <button
                                      type="button"
                                      onClick={() => showInvitationModal(guest.id)}
                                      className="flex items-center space-x-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                                    >
                                      <Mail className="w-3 h-3" />
                                      <span>View Invitation</span>
                                    </button>
                                  </div>

                                  <div className="mt-4 space-y-3 hidden">
                                    {/* Invitation Link Box */}
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                      <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-semibold text-blue-900">Invitation Link</p>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const url = `https://effymentor.com/podcasts/invitation/will-be-generated-${guest.id}`;
                                            navigator.clipboard.writeText(url);
                                            setCopiedInviteId(`${guest.id}-main-link`);
                                            setTimeout(() => setCopiedInviteId(null), 2000);
                                          }}
                                          className="flex items-center space-x-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                                        >
                                          {copiedInviteId === `${guest.id}-main-link` ? (
                                            <>
                                              <Check className="w-3 h-3" />
                                              <span>Copied!</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="w-3 h-3" />
                                              <span>Copy Link</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                      <input
                                        type="text"
                                        value={`https://effymentor.com/podcasts/invitation/will-be-generated-${guest.id}`}
                                        readOnly
                                        className="w-full text-xs px-2 py-1.5 bg-white border border-blue-300 rounded font-mono text-slate-700"
                                        onClick={(e) => e.currentTarget.select()}
                                      />
                                    </div>

                                    {/* Invitation Message Box */}
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                      <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-semibold text-slate-900">Invitation Message</p>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const message = `Hi ${guest.full_name},\n\nYou've been invited to join an upcoming podcast episode on effyMentor!\n\nPlease use this link to respond to the invitation and share your availability:\n\nhttps://effymentor.com/podcasts/invitation/will-be-generated-${guest.id}\n\nLooking forward to having you on the show!\n\nBest regards,\neffyMentor Team`;
                                            navigator.clipboard.writeText(message);
                                            setCopiedInviteId(`${guest.id}-main-message`);
                                            setTimeout(() => setCopiedInviteId(null), 2000);
                                          }}
                                          className="flex items-center space-x-1 text-xs bg-slate-700 text-white px-2 py-1 rounded hover:bg-slate-800 transition"
                                        >
                                          {copiedInviteId === `${guest.id}-main-message` ? (
                                            <>
                                              <Check className="w-3 h-3" />
                                              <span>Copied!</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="w-3 h-3" />
                                              <span>Copy Message</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                      <textarea
                                        value={`Hi ${guest.full_name},\n\nYou've been invited to join an upcoming podcast episode on effyMentor!\n\nPlease use this link to respond to the invitation and share your availability:\n\nhttps://effymentor.com/podcasts/invitation/will-be-generated-${guest.id}\n\nLooking forward to having you on the show!\n\nBest regards,\neffyMentor Team`}
                                        readOnly
                                        rows={8}
                                        className="w-full text-xs px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-700 resize-none"
                                        onClick={(e) => e.currentTarget.select()}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                  {primaryGuestId !== guest.id && (
                                    <button
                                      type="button"
                                      onClick={() => setPrimaryGuestId(guest.id)}
                                      className="text-xs text-blue-600 hover:text-blue-700 underline"
                                    >
                                      Set as Primary
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeExternalGuest(guest.id)}
                                    className="text-red-600 hover:text-red-700 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* External Guest Form Modal */}
                    {showExternalGuestForm && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                          <h3 className="text-lg font-semibold text-slate-900 mb-4">Invite External Guest</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Full Name *
                              </label>
                              <input
                                type="text"
                                value={externalGuestForm.full_name}
                                onChange={(e) => setExternalGuestForm({ ...externalGuestForm, full_name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="John Doe"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Email {externalGuestForm.invitation_method === 'link' ? '(Optional)' : '*'}
                              </label>
                              <input
                                type="email"
                                value={externalGuestForm.email}
                                onChange={(e) => setExternalGuestForm({ ...externalGuestForm, email: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="john@example.com"
                                required={externalGuestForm.invitation_method !== 'link'}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Phone (Optional, for WhatsApp)
                              </label>
                              <input
                                type="tel"
                                value={externalGuestForm.phone}
                                onChange={(e) => setExternalGuestForm({ ...externalGuestForm, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="+1234567890"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Professional Title (Optional)
                              </label>
                              <input
                                type="text"
                                value={externalGuestForm.professional_title}
                                onChange={(e) => setExternalGuestForm({ ...externalGuestForm, professional_title: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="CEO, Tech Company"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Send Invitation Via
                              </label>
                              <div className="space-y-2">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    checked={externalGuestForm.invitation_method === 'link'}
                                    onChange={() => setExternalGuestForm({ ...externalGuestForm, invitation_method: 'link' })}
                                    className="text-blue-600"
                                  />
                                  <Link className="w-4 h-4 text-slate-600" />
                                  <span className="text-sm">Link Only (No contact needed)</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    checked={externalGuestForm.invitation_method === 'email'}
                                    onChange={() => setExternalGuestForm({ ...externalGuestForm, invitation_method: 'email' })}
                                    className="text-blue-600"
                                  />
                                  <Mail className="w-4 h-4 text-slate-600" />
                                  <span className="text-sm">Email Only</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    checked={externalGuestForm.invitation_method === 'whatsapp'}
                                    onChange={() => setExternalGuestForm({ ...externalGuestForm, invitation_method: 'whatsapp' })}
                                    className="text-blue-600"
                                  />
                                  <MessageCircle className="w-4 h-4 text-slate-600" />
                                  <span className="text-sm">WhatsApp Only</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    checked={externalGuestForm.invitation_method === 'both'}
                                    onChange={() => setExternalGuestForm({ ...externalGuestForm, invitation_method: 'both' })}
                                    className="text-blue-600"
                                  />
                                  <span className="text-sm">Both Email & WhatsApp</span>
                                </label>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-3 mt-6">
                            <button
                              type="button"
                              onClick={addExternalGuest}
                              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                            >
                              Add Guest
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowExternalGuestForm(false)}
                              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {(selectedGuests.length > 0 || externalGuests.length > 0) && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">
                            {selectedGuests.length + externalGuests.length} guest{selectedGuests.length + externalGuests.length > 1 ? 's' : ''} selected
                          </span>
                          {primaryGuestId && (
                            <span className="text-blue-600">
                              {' • Primary: '}
                              {mentors.find(m => m.id === primaryGuestId)?.full_name ||
                               externalGuests.find(g => g.id === primaryGuestId)?.full_name}
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Moderator
              </label>
              <select
                value={moderatorId}
                onChange={(e) => setModeratorId(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Me (Current User)</option>
                {moderators.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Episode Number
                </label>
                <input
                  type="number"
                  value={episodeNumber}
                  onChange={(e) => setEpisodeNumber(e.target.value)}
                  min="1"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Recording Type
                </label>
                <select
                  value={recordingType}
                  onChange={(e) => setRecordingType(e.target.value as 'video' | 'audio')}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="video">Video</option>
                  <option value="audio">Audio Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Scheduled Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">Leave empty if not going live</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Questions</h2>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={generateAIQuestions}
                  className="flex items-center space-x-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-cyan-600 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Questions</span>
                </button>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center space-x-2 text-sm bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Question {index + 1}
                          {q.is_ai_generated && (
                            <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              AI Generated
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={q.question_text}
                          onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Enter question..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Pre-filled Answer (Teleprompter)
                        </label>
                        <textarea
                          value={q.answer_text}
                          onChange={(e) => updateQuestion(index, 'answer_text', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Optional: Add answer text that will appear in the teleprompter..."
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="ml-3 text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                  <p className="text-slate-600">
                    No questions added yet. Add questions manually or generate them with AI.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Episode'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/podcasts/manage')}
              className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Invitation Modal */}
      {invitationModalGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Invitation for {invitationModalGuest.full_name}
                </h3>
                <button
                  onClick={() => setInvitationModalGuest(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Invitation Link */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-blue-900">Invitation Link</p>
                    <button
                      type="button"
                      onClick={() => {
                        const url = generateInvitationLink(invitationModalGuest);
                        navigator.clipboard.writeText(url);
                        setCopiedInviteId('modal-link');
                        setTimeout(() => setCopiedInviteId(null), 2000);
                      }}
                      className="flex items-center space-x-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition"
                    >
                      {copiedInviteId === 'modal-link' ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-blue-800 break-all font-mono bg-white p-2 rounded border border-blue-300">
                    {generateInvitationLink(invitationModalGuest)}
                  </p>
                </div>

                {/* Email Message */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-slate-900">Email Message</p>
                    <button
                      type="button"
                      onClick={() => copyInvitationMessage(invitationModalGuest.id, 'email')}
                      className="flex items-center space-x-1 text-sm bg-slate-700 text-white px-3 py-1.5 rounded hover:bg-slate-800 transition"
                    >
                      {copiedInviteId === `${invitationModalGuest.id}-email` ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Message</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-300 whitespace-pre-wrap">
                    Hi {invitationModalGuest.full_name},

We'd love to have you as a guest on our podcast "{title || 'Our Show'}"!

{description && `About this episode: ${description}\n\n`}Click here to view details and confirm your participation:
{generateInvitationLink(invitationModalGuest)}

Looking forward to hearing from you!
                  </div>
                </div>

                {/* WhatsApp Message */}
                {invitationModalGuest.phone && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-green-900">WhatsApp Message</p>
                      <button
                        type="button"
                        onClick={() => copyInvitationMessage(invitationModalGuest.id, 'whatsapp')}
                        className="flex items-center space-x-1 text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition"
                      >
                        {copiedInviteId === `${invitationModalGuest.id}-whatsapp` ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy Message</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-sm text-green-800 bg-white p-3 rounded border border-green-300 whitespace-pre-wrap">
                      Hi {invitationModalGuest.full_name}! We'd love to have you as a guest on our podcast "{title || 'Our Show'}"! Click here to view details: {generateInvitationLink(invitationModalGuest)}
                    </div>
                  </div>
                )}

                {/* Send Buttons */}
                <div className="flex gap-3 pt-4">
                  {(invitationModalGuest.invitation_method === 'email' || invitationModalGuest.invitation_method === 'both') && invitationModalGuest.email && (
                    <button
                      type="button"
                      onClick={() => sendInvitation(invitationModalGuest.id, 'email')}
                      className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Send via Email</span>
                    </button>
                  )}
                  {(invitationModalGuest.invitation_method === 'whatsapp' || invitationModalGuest.invitation_method === 'both') && invitationModalGuest.phone && (
                    <button
                      type="button"
                      onClick={() => sendInvitation(invitationModalGuest.id, 'whatsapp')}
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Send via WhatsApp</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setInvitationModalGuest(null)}
                  className="w-full py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
