import { useState, useEffect } from 'react';
import { BrandLayout } from '../components/BrandLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  MessageSquare,
  Phone,
  Mail,
  Star,
  TrendingUp,
  Clock,
  X,
  Save
} from 'lucide-react';

interface Mentee {
  id: string;
  mentee_name: string;
  mentee_email?: string;
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

export function MenteeCRMPage() {
  const { user } = useAuth();
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [filteredMentees, setFilteredMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);

  const [formData, setFormData] = useState({
    mentee_name: '',
    mentee_email: '',
    mentee_company: '',
    mentee_title: '',
    relationship_stage: 'prospect',
    first_contact_date: '',
    next_followup_date: '',
    notes: '',
    tags: [] as string[]
  });

  useEffect(() => {
    if (user) {
      loadMentees();
    }
  }, [user]);

  useEffect(() => {
    filterMentees();
  }, [mentees, searchQuery, selectedStage]);

  const loadMentees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('mentee_relationships')
      .select('*')
      .eq('mentor_id', user!.id)
      .order('last_contact_date', { ascending: false, nullsFirst: false });

    if (data) {
      setMentees(data);
    }
    setLoading(false);
  };

  const filterMentees = () => {
    let filtered = [...mentees];

    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.mentee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.mentee_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.mentee_company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStage !== 'all') {
      filtered = filtered.filter(m => m.relationship_stage === selectedStage);
    }

    setFilteredMentees(filtered);
  };

  const handleSubmit = async () => {
    const menteeData = {
      mentor_id: user!.id,
      ...formData,
      tags: formData.tags.length > 0 ? formData.tags : null
    };

    if (selectedMentee) {
      const { error } = await supabase
        .from('mentee_relationships')
        .update(menteeData)
        .eq('id', selectedMentee.id);

      if (!error) {
        loadMentees();
        closeModal();
      }
    } else {
      const { error } = await supabase
        .from('mentee_relationships')
        .insert(menteeData);

      if (!error) {
        loadMentees();
        closeModal();
      }
    }
  };

  const deleteMentee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mentee?')) return;

    const { error } = await supabase
      .from('mentee_relationships')
      .delete()
      .eq('id', id);

    if (!error) {
      loadMentees();
    }
  };

  const openEditModal = (mentee: Mentee) => {
    setSelectedMentee(mentee);
    setFormData({
      mentee_name: mentee.mentee_name,
      mentee_email: mentee.mentee_email || '',
      mentee_company: mentee.mentee_company || '',
      mentee_title: mentee.mentee_title || '',
      relationship_stage: mentee.relationship_stage,
      first_contact_date: mentee.first_contact_date || '',
      next_followup_date: mentee.next_followup_date || '',
      notes: mentee.notes || '',
      tags: mentee.tags || []
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setSelectedMentee(null);
    setFormData({
      mentee_name: '',
      mentee_email: '',
      mentee_company: '',
      mentee_title: '',
      relationship_stage: 'prospect',
      first_contact_date: '',
      next_followup_date: '',
      notes: '',
      tags: []
    });
  };

  const stages = [
    { id: 'all', label: 'All', count: mentees.length, color: 'bg-slate-500' },
    { id: 'prospect', label: 'Prospect', count: mentees.filter(m => m.relationship_stage === 'prospect').length, color: 'bg-yellow-500' },
    { id: 'active', label: 'Active', count: mentees.filter(m => m.relationship_stage === 'active').length, color: 'bg-green-500' },
    { id: 'alumni', label: 'Alumni', count: mentees.filter(m => m.relationship_stage === 'alumni').length, color: 'bg-blue-500' },
    { id: 'inactive', label: 'Inactive', count: mentees.filter(m => m.relationship_stage === 'inactive').length, color: 'bg-slate-400' }
  ];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prospect': return 'bg-yellow-100 text-yellow-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'alumni': return 'bg-blue-100 text-blue-700';
      case 'inactive': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const isFollowupDue = (date?: string) => {
    if (!date) return false;
    return new Date(date) <= new Date();
  };

  if (loading) {
    return (
      <BrandLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading mentees...</p>
          </div>
        </div>
      </BrandLayout>
    );
  }

  return (
    <BrandLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Mentee Relationships</h1>
            <p className="text-slate-600">Track and manage your mentee relationships</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Mentee
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {stages.map(stage => (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={`p-4 rounded-xl transition ${
                selectedStage === stage.id
                  ? 'bg-white shadow-md border-2 border-blue-600'
                  : 'bg-white border border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`${stage.color} w-3 h-3 rounded-full`}></span>
                <span className="text-2xl font-bold text-slate-900">{stage.count}</span>
              </div>
              <p className="text-sm text-slate-600 font-medium">{stage.label}</p>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mentees by name, email, or company..."
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredMentees.length > 0 ? (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mentee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Follow-up</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sessions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredMentees.map(mentee => (
                    <tr key={mentee.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => window.location.href = `/mentor/crm/mentee/${mentee.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-semibold text-slate-900">{mentee.mentee_name}</div>
                          {mentee.mentee_company && (
                            <div className="text-sm text-slate-500">{mentee.mentee_title} at {mentee.mentee_company}</div>
                          )}
                          {mentee.mentee_email && (
                            <div className="text-sm text-slate-500">{mentee.mentee_email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStageColor(mentee.relationship_stage)}`}>
                          {mentee.relationship_stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="font-semibold text-slate-900">{mentee.relationship_score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {mentee.last_contact_date
                          ? new Date(mentee.last_contact_date).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {mentee.next_followup_date ? (
                          <span className={`text-sm ${
                            isFollowupDue(mentee.next_followup_date)
                              ? 'text-red-600 font-semibold'
                              : 'text-slate-600'
                          }`}>
                            {new Date(mentee.next_followup_date).toLocaleDateString()}
                            {isFollowupDue(mentee.next_followup_date) && (
                              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">Due</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">Not set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-semibold text-slate-900">{mentee.total_sessions}</div>
                          <div className="text-slate-500">${mentee.total_revenue.toFixed(0)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(mentee)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteMentee(mentee.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No mentees found</h3>
                <p className="text-slate-600 mb-6">Start building your mentee network</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Mentee
                </button>
              </div>
            )}
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedMentee ? 'Edit Mentee' : 'Add New Mentee'}
                </h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">Company</label>
                    <input
                      type="text"
                      value={formData.mentee_company}
                      onChange={(e) => setFormData({ ...formData, mentee_company: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.mentee_title}
                      onChange={(e) => setFormData({ ...formData, mentee_title: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    onClick={closeModal}
                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formData.mentee_name}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Save className="w-5 h-5 inline mr-2" />
                    {selectedMentee ? 'Update' : 'Add'} Mentee
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </BrandLayout>
  );
}
