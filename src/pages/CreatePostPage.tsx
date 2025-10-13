import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  Save,
  Calendar,
  Send,
  Image as ImageIcon,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Hash,
  AtSign,
  X
} from 'lucide-react';

export function CreatePostPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    platform: 'linkedin',
    post_type: 'text',
    scheduled_for: '',
    campaign_tag: '',
    status: 'draft'
  });

  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [mentionInput, setMentionInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-sky-500' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-700' }
  ];

  const addHashtag = () => {
    if (hashtagInput && !hashtags.includes(hashtagInput)) {
      setHashtags([...hashtags, hashtagInput.replace(/^#/, '')]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const addMention = () => {
    if (mentionInput && !mentions.includes(mentionInput)) {
      setMentions([...mentions, mentionInput.replace(/^@/, '')]);
      setMentionInput('');
    }
  };

  const removeMention = (mention: string) => {
    setMentions(mentions.filter(m => m !== mention));
  };

  const handleSubmit = async (status: 'draft' | 'scheduled' | 'published') => {
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    if (status === 'scheduled' && !formData.scheduled_for) {
      setError('Please select a schedule time');
      return;
    }

    setLoading(true);
    setError('');

    const postData = {
      mentor_id: user!.id,
      title: formData.title || null,
      content: formData.content,
      platform: formData.platform,
      post_type: formData.post_type,
      hashtags: hashtags.length > 0 ? hashtags : null,
      mentions: mentions.length > 0 ? mentions : null,
      campaign_tag: formData.campaign_tag || null,
      status,
      scheduled_for: status === 'scheduled' ? formData.scheduled_for : null,
      published_at: status === 'published' ? new Date().toISOString() : null
    };

    const { error: insertError } = await supabase
      .from('social_media_posts')
      .insert(postData);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    navigate('/mentor/social-media');
  };

  const characterCount = formData.content.length;
  const maxChars = formData.platform === 'twitter' ? 280 : 3000;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Create New Post</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Select Platform
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {platforms.map(platform => (
                  <button
                    key={platform.id}
                    onClick={() => setFormData({ ...formData, platform: platform.id })}
                    className={`p-4 border-2 rounded-lg text-center transition ${
                      formData.platform === platform.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <platform.icon className={`w-8 h-8 mx-auto mb-2 ${platform.color}`} />
                    <p className="text-sm font-medium text-slate-900">{platform.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Give your post a title for easy reference"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Content *
                </label>
                <span className={`text-sm ${
                  characterCount > maxChars ? 'text-red-600' : 'text-slate-500'
                }`}>
                  {characterCount} / {maxChars}
                </span>
              </div>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="What do you want to share?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Hashtags
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter hashtag"
                  />
                  <button
                    onClick={addHashtag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Hash className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        onClick={() => removeHashtag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mentions
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={mentionInput}
                    onChange={(e) => setMentionInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMention())}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter username"
                  />
                  <button
                    onClick={addMention}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <AtSign className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mentions.map(mention => (
                    <span
                      key={mention}
                      className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      @{mention}
                      <button
                        onClick={() => removeMention(mention)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Schedule For (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_for}
                  onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Campaign Tag (Optional)
                </label>
                <input
                  type="text"
                  value={formData.campaign_tag}
                  onChange={(e) => setFormData({ ...formData, campaign_tag: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Q4 Campaign"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
              <button
                onClick={() => handleSubmit('draft')}
                disabled={loading}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 font-medium"
              >
                <Save className="w-5 h-5 inline mr-2" />
                Save as Draft
              </button>
              <button
                onClick={() => handleSubmit(formData.scheduled_for ? 'scheduled' : 'published')}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
              >
                {formData.scheduled_for ? (
                  <>
                    <Calendar className="w-5 h-5 inline mr-2" />
                    Schedule Post
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 inline mr-2" />
                    Publish Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
