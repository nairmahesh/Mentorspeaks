import { useState } from 'react';
import { X, Calendar, Clock, DollarSign, Check } from 'lucide-react';
import { Profile } from '../lib/supabase';

interface CallBookingModalProps {
  mentor: Profile;
  isOpen: boolean;
  onClose: () => void;
}

export function CallBookingModal({ mentor, isOpen, onClose }: CallBookingModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [topic, setTopic] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
      setSelectedDate('');
      setSelectedTime('');
      setTopic('');
    }, 2000);
  };

  const getConsultingInfo = () => {
    if (!mentor.offers_consulting) {
      return { available: false, text: 'Not Available', color: 'text-slate-600' };
    }
    if (mentor.consulting_type === 'free') {
      return { available: true, text: 'Free Consultation', color: 'text-green-600' };
    }
    if (mentor.consulting_type === 'paid') {
      return {
        available: true,
        text: `₹${mentor.consulting_rate_inr?.toLocaleString()}/hour`,
        color: 'text-orange-600'
      };
    }
    return {
      available: true,
      text: `Free & Paid (₹${mentor.consulting_rate_inr?.toLocaleString()}/hour)`,
      color: 'text-orange-600'
    };
  };

  const consultingInfo = getConsultingInfo();

  if (!consultingInfo.available) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">Book a Call</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-slate-600 text-center py-8">
            {mentor.full_name} is not currently offering consulting calls.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Sent!</h3>
          <p className="text-slate-600">
            {mentor.full_name} will receive your call request and get back to you shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-lg w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-bold text-slate-900">Book a Call</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-slate-600">Schedule a consultation with {mentor.full_name}</p>
        </div>

        <div className="p-6">
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-slate-900">{mentor.full_name}</h4>
                {mentor.professional_title && (
                  <p className="text-sm text-slate-600">{mentor.professional_title}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <span className={`font-semibold ${consultingInfo.color}`}>
                {consultingInfo.text}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Preferred Date</span>
                </div>
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Preferred Time</span>
                </div>
              </label>
              <select
                required
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select a time</option>
                <option value="09:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="17:00">5:00 PM</option>
                <option value="18:00">6:00 PM</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                What would you like to discuss?
              </label>
              <textarea
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Brief description of what you'd like help with..."
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> This is a call request. {mentor.full_name} will review your request and confirm the meeting time via email.
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
              >
                Send Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
