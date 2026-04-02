import { useState } from 'react';
import PublicNavbar from '../components/layout/PublicNavbar';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      Swal.fire({ text: 'Please fill in all required fields.', icon: 'warning', background: '#1f2937', color: '#fff', confirmButtonColor: '#ef4444' });
      return;
    }
    Swal.fire({ title: 'Message Sent!', text: 'Thank you for reaching out. We\'ll get back to you soon.', icon: 'success', background: '#1f2937', color: '#fff', confirmButtonColor: '#22c55e' });
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white font-sans">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-black mb-4">
            Contact <span className="text-primary-500">Us</span>
          </h1>
          <p className="text-dark-400 text-lg max-w-2xl mx-auto">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Cards */}
          <div className="space-y-6">
            <div className="card p-6 hover:border-primary-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm text-dark-500 font-bold uppercase">Email</p>
                  <p className="text-white font-bold">support@auctionhub.com</p>
                </div>
              </div>
            </div>
            <div className="card p-6 hover:border-accent-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-accent-500" />
                </div>
                <div>
                  <p className="text-sm text-dark-500 font-bold uppercase">Phone</p>
                  <p className="text-white font-bold">+91 9876 543 210</p>
                </div>
              </div>
            </div>
            <div className="card p-6 hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-dark-500 font-bold uppercase">Office</p>
                  <p className="text-white font-bold">Trivandrum, Kerala, India</p>
                </div>
              </div>
            </div>
            <div className="card p-6 hover:border-green-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-dark-500 font-bold uppercase">Business Hours</p>
                  <p className="text-white font-bold">Mon – Sat, 9 AM – 6 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-primary-500" /> Send a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-500 mb-1">Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-500 mb-1">Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-500 mb-1">Subject</label>
                  <input name="subject" value={form.subject} onChange={handleChange} className="input-field" placeholder="How can we help?" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-500 mb-1">Message *</label>
                  <textarea name="message" rows={6} value={form.message} onChange={handleChange} className="input-field w-full resize-y" placeholder="Write your message here..." />
                </div>
                <button type="submit" className="btn-primary px-8 py-3 font-bold text-sm flex items-center gap-2">
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-dark-700/50 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-dark-500 text-sm">
          &copy; {new Date().getFullYear()} AuctionHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
