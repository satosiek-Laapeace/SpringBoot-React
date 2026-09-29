import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle2, Sprout } from 'lucide-react';
import logoImg from '../assets/images/craftfarm-logo.png';

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: 'General Question',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', inquiryType: 'General Question', subject: '', message: '' });
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold border border-emerald-300 dark:border-emerald-800">
          <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Contact CraftFarm Support</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white font-serif tracking-tight">
          We’d Love to Hear From You
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Have questions about buying fresh produce, listing your farm, or setting up IoT soil sensors? Send us a message below!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Contact Form */}
        <div className="lg:col-span-7 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Send Us a Direct Message</h3>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-center space-y-2 animate-in fade-in">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Message Sent Successfully!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Thank you for reaching out. Our support team will get back to you within 2 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Sophea Heng"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="sophea@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Inquiry Topic</label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="General Question">General Question</option>
                    <option value="Farmer Partnership">Farmer Partnership / Produce Listing</option>
                    <option value="Wholesale Buyer">Wholesale Bulk Order</option>
                    <option value="IoT Sensor Setup">IoT Sensor Setup</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Inquiry about fresh mango batch..."
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Your Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can CraftFarm assist your farm or business?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}

        </div>

        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Phnom Penh Smart Hub</h4>
                <p className="text-xs text-slate-500">St 271, Sangkat Boeung Tumpun, Phnom Penh</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Battambang Seed Lab</h4>
                <p className="text-xs text-slate-500">National Highway 5, Battambang Province</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Direct Phone Support</h4>
                <p className="text-xs text-slate-500">+855 23 888 999 / +855 12 345 678</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Support Working Hours</h4>
                <p className="text-xs text-slate-500">Monday - Saturday (7:00 AM - 7:00 PM)</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
