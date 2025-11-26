'use client';

import { useState } from 'react';

interface ContactUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
  };
  onSend: (data: { type: 'sms' | 'email' | 'in_app'; template: string; message: string }) => Promise<void>;
}

const MESSAGE_TEMPLATES = {
  cart_abandonment: {
    name: 'Cart Abandonment Reminder',
    sms: 'Hi {{name}}, you have items in your cart worth {{cart_value}}. Complete your booking now and receive blessings! - Mandir Mitra',
    email: 'Dear {{name}},\n\nWe noticed you have items in your cart. Complete your booking to receive divine blessings.\n\nYour cart value: {{cart_value}}\n\nBest regards,\nMandir Mitra Team',
    in_app: 'Complete your booking and receive divine blessings! Your cart: {{cart_value}}',
  },
  high_value_followup: {
    name: 'High-Value User Follow-up',
    sms: 'Namaste {{name}}! Thank you for being a valued devotee. We have special offerings for you. Call us for personalized service. - Mandir Mitra',
    email: 'Dear {{name}},\n\nThank you for your continued devotion. As a valued member, we would like to offer you personalized service and exclusive benefits.\n\nPlease contact us to discuss your spiritual needs.\n\nBest regards,\nMandir Mitra Team',
    in_app: 'Thank you for being a valued devotee! We have special offerings just for you.',
  },
  service_feedback: {
    name: 'Service Feedback Request',
    sms: 'Hi {{name}}, how was your recent {{service_name}} experience? Your feedback helps us serve you better. Reply with your thoughts. - Mandir Mitra',
    email: 'Dear {{name}},\n\nWe hope you had a blessed experience with {{service_name}}. Your feedback is valuable to us.\n\nPlease share your thoughts so we can continue to improve our services.\n\nBest regards,\nMandir Mitra Team',
    in_app: 'How was your {{service_name}} experience? Share your feedback to help us serve you better.',
  },
  booking_reminder: {
    name: 'Booking Reminder',
    sms: 'Reminder: Your {{service_name}} is scheduled for {{date}}. We look forward to serving you! - Mandir Mitra',
    email: 'Dear {{name}},\n\nThis is a reminder that your {{service_name}} is scheduled for {{date}}.\n\nWe look forward to serving you.\n\nBest regards,\nMandir Mitra Team',
    in_app: 'Reminder: Your {{service_name}} is scheduled for {{date}}',
  },
  special_offer: {
    name: 'Special Offer',
    sms: 'Special offer for you! Get {{discount}}% off on {{service_name}}. Book now! - Mandir Mitra',
    email: 'Dear {{name}},\n\nWe have a special offer just for you!\n\nGet {{discount}}% off on {{service_name}}.\n\nBook now and receive divine blessings.\n\nBest regards,\nMandir Mitra Team',
    in_app: 'Special offer! Get {{discount}}% off on {{service_name}}. Book now!',
  },
};

export function ContactUserModal({ isOpen, onClose, user, onSend }: ContactUserModalProps) {
  const [communicationType, setCommunicationType] = useState<'sms' | 'email' | 'in_app'>('sms');
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof MESSAGE_TEMPLATES>('cart_abandonment');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleTemplateChange = (template: keyof typeof MESSAGE_TEMPLATES) => {
    setSelectedTemplate(template);
    const templateData = MESSAGE_TEMPLATES[template];
    const templateMessage = templateData[communicationType];
    
    // Replace variables with user data
    let processedMessage = templateMessage
      .replace('{{name}}', user.fullName)
      .replace('{{cart_value}}', '₹7,500') // This should come from actual user data
      .replace('{{service_name}}', 'Satyanarayan Puja') // This should be dynamic
      .replace('{{date}}', 'Nov 30, 2024') // This should be dynamic
      .replace('{{discount}}', '15'); // This should be dynamic
    
    setMessage(processedMessage);
  };

  const handleCommunicationTypeChange = (type: 'sms' | 'email' | 'in_app') => {
    setCommunicationType(type);
    handleTemplateChange(selectedTemplate);
  };

  const handleSend = async () => {
    setSending(true);
    try {
      await onSend({
        type: communicationType,
        template: MESSAGE_TEMPLATES[selectedTemplate].name,
        message,
      });
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const getCharacterCount = () => {
    if (communicationType === 'sms') {
      return `${message.length}/160`;
    }
    return `${message.length} characters`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Contact User</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {user.fullName} • {user.phone} • {user.email}
            </div>
          </div>

          {/* Body */}
          <div className="bg-white px-6 py-4 space-y-4">
            {/* Communication Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Communication Type
              </label>
              <div className="flex space-x-4">
                {[
                  { value: 'sms', label: 'SMS', icon: '📱' },
                  { value: 'email', label: 'Email', icon: '📧' },
                  { value: 'in_app', label: 'In-App', icon: '🔔' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleCommunicationTypeChange(type.value as any)}
                    className={`flex-1 px-4 py-3 border rounded-lg text-sm font-medium transition-colors ${
                      communicationType === type.value
                        ? 'border-orange-600 bg-orange-50 text-orange-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value as keyof typeof MESSAGE_TEMPLATES)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {Object.entries(MESSAGE_TEMPLATES).map(([key, template]) => (
                  <option key={key} value={key}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Message Content
                </label>
                <span className="text-xs text-gray-500">{getCharacterCount()}</span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={communicationType === 'email' ? 8 : 4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your message..."
              />
              <div className="mt-2 text-xs text-gray-500">
                Available variables: {'{{name}}'}, {'{{cart_value}}'}, {'{{service_name}}'}, {'{{date}}'}, {'{{discount}}'}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs font-medium text-gray-700 mb-2">Preview</div>
              <div className="text-sm text-gray-900 whitespace-pre-wrap">{message}</div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {sending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Message
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
