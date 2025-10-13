import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BrandLayout } from '../components/BrandLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  DollarSign,
  Star,
  MessageSquare,
  Edit,
  Trash2,
  Plus,
  X,
  Save
} from 'lucide-react';

interface Mentee {
  id: string;
  mentee_name: string;
  mentee_email?: string;
  mentee_phone?: string;
  mentee_company?: string;
  mentee_title?: string;
  relationship_stage: string;
  first_contact_date?: string;
  last_contact_date?: string;
  next_followup_date?: string;
  relationship_score: number;
  total_sessions: number;
  total_revenue: number;
  notes?: string;
  tags?: string[];
}

interface Session {
  id: string;
  session_date: string;
  session_type: string;
  duration_minutes: number;
  amount_paid: number;
  notes?: string;
}

export function MenteeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mentee, setMentee] = useState<Mentee | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  const [formData, setFormData] = useState({
    mentee_name: '',
    mentee_email: '',
    mentee_phone: '',
    mentee_company: '',
    mentee_title: '',
    relationship_stage: 'prospect',
    first_contact_date: '',
    last_contact_date: '',
    next_followup_date: '',
    notes: ''
  });

  const [sessionData, setSessionData] = useState({
    session_date: new Date().toISOString().split('T')[0],
    session_type: 'consultation',
    duration_minutes: 60,
    amount_paid: 0,
    notes: ''
  });

  useEffect(() => {
    if (user && id) {
      loadMenteeDetails();
    }
  }, [user, id]);

  const loadMenteeDetails = async () => {
    setLoading(true);

    const { data: menteeData } = await supabase
      .from('mentee_relationships')
      .select('*')
      .eq('id', id)
      .eq('mentor_id', user!.id)
      .single();

    if (menteeData) {
      setMentee(menteeData);
      setFormData({
        mentee_name: menteeData.mentee_name,
        mentee_email: menteeData.mentee_email || '',
        mentee_phone: menteeData.mentee_phone || '',
        mentee_company: menteeData.mentee_company || '',
        mentee_title: menteeData.mentee_title || '',
        relationship_stage: menteeData.relationship_stage,
        first_contact_date: menteeData.first_contact_date || '',
        last_contact_date: menteeData.last_contact_date || '',
        next_followup_date: menteeData.next_followup_date || '',
        notes: menteeData.notes || ''
      });
    }

    setLoading(false);
  };

  const handleUpdate = async () => {
    const { error } = await supabase
      .from('mentee_relationships')
      .update(formData)
      .eq('id', id);

    if (!error) {
      loadMenteeDetails();
      setShowEditModal(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this mentee?')) return;

    const { error } = await supabase
      .from('mentee_relationships')
      .delete()
      .eq('id', id);

    if (!error) {
      navigate('/mentor/crm/all');
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prospect': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'active': return 'bg-green-100 text-green-700 border-green-300';
      case 'alumni': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'inactive': return 'bg-slate-100 text-slate-700 border-slate-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  if (loading) {
    return (
      <BrandLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </BrandLayout>
    );
  }

  if (!mentee) {
    return (
      <BrandLayout>
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">Mentee not found</p>
          <Link
            to="/mentor/crm/all"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to CRM
          </Link>
        </div>
      </BrandLayout>
    );
  }

  return (
    <BrandLayout>
      <div className="max-w-5xl">
        <Link
          to="/mentor/crm/all"
          className="text-blue-600 hover:text-blue-700 font-medium mb-6 inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Mentees
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mt-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{mentee.mentee_name}</h1>
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getStageColor(mentee.relationship_stage)}`}>
                {mentee.relationship_stage}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition inline-flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Contact Information</h2>

              {mentee.mentee_email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600">Email</p>
                    <a href={`mailto:${mentee.mentee_email}`} className="text-blue-600 hover:text-blue-700">
                      {mentee.mentee_email}
                    </a>
                  </div>
                </div>
              )}

              {mentee.mentee_phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600">Phone</p>
                    <a href={`tel:${mentee.mentee_phone}`} className="text-blue-600 hover:text-blue-700">
                      {mentee.mentee_phone}
                    </a>
                  </div>
                </div>
              )}

              {mentee.mentee_company && (
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600">Company</p>
                    <p className="text-slate-900">{mentee.mentee_company}</p>
                  </div>
                </div>
              )}

              {mentee.mentee_title && (
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-600">Title</p>
                    <p className="text-slate-900">{mentee.mentee_title}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Relationship Stats</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold text-slate-900">{mentee.relationship_score}</span>
                  </div>
                  <p className="text-sm text-slate-600">Score</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    <span className="text-2xl font-bold text-slate-900">{mentee.total_sessions}</span>
                  </div>
                  <p className="text-sm text-slate-600">Sessions</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span className="text-2xl font-bold text-slate-900">${mentee.total_revenue.toFixed(0)}</span>
                  </div>
                  <p className="text-sm text-slate-600">Total Revenue</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {mentee.first_contact_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">First Contact:</span>
                    <span className="font-medium text-slate-900">
                      {new Date(mentee.first_contact_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {mentee.last_contact_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Last Contact:</span>
                    <span className="font-medium text-slate-900">
                      {new Date(mentee.last_contact_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {mentee.next_followup_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Next Follow-up:</span>
                    <span className="font-medium text-blue-600">
                      {new Date(mentee.next_followup_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {mentee.notes && (
            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Notes</h2>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-700 whitespace-pre-wrap">{mentee.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Edit Mentee</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.mentee_name}
                    onChange={(e) => setFormData({ ...formData, mentee_name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.mentee_email}
                    onChange={(e) => setFormData({ ...formData, mentee_email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.mentee_phone}
                    onChange={(e) => setFormData({ ...formData, mentee_phone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.mentee_company}
                    onChange={(e) => setFormData({ ...formData, mentee_company: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.mentee_title}
                    onChange={(e) => setFormData({ ...formData, mentee_title: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Stage</label>
                  <select
                    value={formData.relationship_stage}
                    onChange={(e) => setFormData({ ...formData, relationship_stage: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="prospect">Prospect</option>
                    <option value="active">Active</option>
                    <option value="alumni">Alumni</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Contact</label>
                  <input
                    type="date"
                    value={formData.first_contact_date}
                    onChange={(e) => setFormData({ ...formData, first_contact_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Contact</label>
                  <input
                    type="date"
                    value={formData.last_contact_date}
                    onChange={(e) => setFormData({ ...formData, last_contact_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Next Follow-up</label>
                  <input
                    type="date"
                    value={formData.next_followup_date}
                    onChange={(e) => setFormData({ ...formData, next_followup_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={!formData.mentee_name}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Save className="w-5 h-5 inline mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </BrandLayout>
  );
}
