import React, { useState, useEffect } from 'react';
import { Copy, Check, Webhook, Mail, MessageCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';

const WebhookConfigurationPage: React.FC = () => {
  const [webhookUrls, setWebhookUrls] = useState<{
    whatsapp: string;
    email: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchWebhookUrls();
  }, []);

  const fetchWebhookUrls = async () => {
    try {
      const response = await apiClient.get('/communications/webhooks/urls');
      setWebhookUrls(response.data.data);
    } catch (error) {
      console.error('Failed to fetch webhook URLs:', error);
      toast.error('Failed to load webhook URLs');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-weconnect-red"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Webhook Configuration
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure these webhook URLs in your communication providers to enable two-way messaging
        </p>
      </div>

      {/* Alert */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
              Enable Two-Way Communication
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              After configuring these webhooks, replies from your leads will automatically appear in your CRM.
              Make sure to configure your API keys in the Communication API settings first.
            </p>
          </div>
        </div>
      </div>

      {/* WhatsApp Webhook */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">WhatsApp Webhook</h2>
              <p className="text-sm text-green-100">For WhatsApp Business API providers</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={webhookUrls?.whatsapp || ''}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(webhookUrls?.whatsapp || '', 'whatsapp')}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
              >
                {copiedField === 'whatsapp' ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span className="text-sm">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Configuration Steps:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>Log in to your WhatsApp Business API provider dashboard (e.g., Twilio, MessageBird, 360Dialog)</li>
              <li>Navigate to Webhook Settings or Inbound Message Configuration</li>
              <li>Paste the webhook URL above</li>
              <li>Set the HTTP method to <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">POST</code></li>
              <li>Save the configuration</li>
              <li>Test by sending a WhatsApp message to your business number</li>
            </ol>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                Expected Request Format:
              </h4>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto">
{`{
  "from": "+1234567890",
  "to": "+0987654321",
  "content": "Message text",
  "messageId": "external-msg-id",
  "timestamp": "2025-01-08T12:00:00Z",
  "contactName": "John Doe"
}`}
              </pre>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Webhook className="h-4 w-4" />
            <span>Provider must support webhook callbacks</span>
          </div>
        </div>
      </div>

      {/* Email Webhook */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/20 rounded-lg">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Email Webhook</h2>
              <p className="text-sm text-blue-100">For email service providers</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={webhookUrls?.email || ''}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(webhookUrls?.email || '', 'email')}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
              >
                {copiedField === 'email' ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span className="text-sm">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Configuration Steps:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>Log in to your email service provider (e.g., SendGrid, Mailgun, Amazon SES)</li>
              <li>Navigate to Inbound Parse or Webhook Settings</li>
              <li>Paste the webhook URL above</li>
              <li>Configure the webhook for incoming emails</li>
              <li>Set up MX records if required by your provider</li>
              <li>Test by sending an email to your configured address</li>
            </ol>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                Expected Request Format:
              </h4>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto">
{`{
  "from": "lead@example.com",
  "fromName": "John Doe",
  "to": "sales@yourcompany.com",
  "subject": "Re: Your Product Inquiry",
  "content": "Email body text",
  "htmlContent": "<p>Email body HTML</p>",
  "messageId": "external-email-id",
  "timestamp": "2025-01-08T12:00:00Z"
}`}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Webhook className="h-4 w-4" />
              <span>Supported providers: SendGrid, Mailgun, Amazon SES, Postmark</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <ExternalLink className="h-4 w-4" />
              <a
                href="https://sendgrid.com/docs/for-developers/parsing-email/setting-up-the-inbound-parse-webhook/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                SendGrid Inbound Parse Setup Guide
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Testing Section */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
              Testing Your Webhooks
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-400 mb-3">
              To test if webhooks are working correctly:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-400">
              <li>Send a WhatsApp message to your business number from a lead's phone</li>
              <li>Send an email from a lead's email address to your configured inbox</li>
              <li>Check the lead's profile in the CRM - the message should appear with a "Received" badge</li>
              <li>Check Activity logs for the lead to see webhook processing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookConfigurationPage;
