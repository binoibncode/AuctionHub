import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Crown, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { db } from '../services/db';
import { PricingPlan } from '../types';

export default function PricingPlans() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    setPlans(db.getPricingPlans());
  }, []);

  const handleSelect = (plan: PricingPlan) => {
    if (plan.price === 0) {
      Swal.fire({
        title: '🎉 Free Plan Active!',
        html: '<p style="color:#d1d5db;">You can create auctions with up to <b style="color:#fff;">' + plan.teams + ' teams</b> for free.</p>',
        icon: 'success',
        background: '#1a1f2e',
        color: '#fff',
        confirmButtonColor: '#6366f1',
        confirmButtonText: 'Got it!',
      });
      return;
    }

    Swal.fire({
      title: '💳 Confirm Payment',
      html:
        '<div style="text-align:left;color:#d1d5db;">' +
        '<p style="margin-bottom:12px;">You are about to purchase:</p>' +
        '<div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);border-radius:8px;padding:14px;margin-bottom:12px;">' +
        '<p style="margin:0;font-size:16px;font-weight:bold;color:#fff;">' + plan.name + ' Plan</p>' +
        '<p style="margin:6px 0 0;font-size:22px;font-weight:900;color:#6366f1;">Rs ' + plan.price.toLocaleString() + '</p>' +
        '<p style="margin:6px 0 0;font-size:13px;color:#9ca3af;">Up to ' + plan.teams + ' Teams per Auction</p>' +
        '</div>' +
        '<p style="font-size:12px;color:#6b7280;">⚠️ Demo Mode — No real payment will be processed.</p>' +
        '</div>',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Pay Now',
      cancelButtonText: 'Cancel',
      background: '#1a1f2e',
      color: '#fff',
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#374151',
    }).then((result) => {
      if (result.isConfirmed) {
        setProcessing(plan.id);
        setTimeout(() => {
          setProcessing(null);
          Swal.fire({
            title: '✅ Payment Successful!',
            html: '<p style="color:#d1d5db;">Your plan has been upgraded to <b style="color:#fff;">' + plan.name + '</b>.</p>',
            icon: 'success',
            background: '#1a1f2e',
            color: '#fff',
            confirmButtonColor: '#6366f1',
            confirmButtonText: 'Continue',
          });
        }, 1500);
      }
    });
  };

  const topRow = plans.slice(0, 4);
  const bottomRow = plans.slice(4);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Link to="/organizer" className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-400 font-bold mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Auctions
      </Link>

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          <Crown className="w-3.5 h-3.5" /> Choose Your Plan
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Pricing Plans</h1>
        <p className="text-dark-400">Choose a plan based on the number of teams per auction</p>
      </div>

      {/* Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        {topRow.map((plan) => (
          <PlanCard key={plan.id} plan={plan} processing={processing} onSelect={handleSelect} />
        ))}
      </div>

      {/* Bottom Row */}
      {bottomRow.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[56rem] mx-auto">
          {bottomRow.map((plan) => (
            <PlanCard key={plan.id} plan={plan} processing={processing} onSelect={handleSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  processing,
  onSelect,
}: {
  plan: PricingPlan;
  processing: string | null;
  onSelect: (plan: PricingPlan) => void;
}) {
  const isProcessing = processing === plan.id;
  const isRecommended = plan.recommended;

  return (
    <div className={`relative bg-dark-800 rounded-xl border transition-all duration-300 hover:-translate-y-1 ${
      isRecommended ? 'border-primary-500/50' : 'border-dark-700 hover:border-dark-600'
    }`}>
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-3 right-4 bg-primary-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
          Recommended
        </div>
      )}

      {/* Top Accent Line */}
      <div className={`h-1 rounded-t-xl ${isRecommended ? 'bg-primary-500' : 'bg-dark-600'}`} />

      <div className="p-6">
        {/* Plan Name */}
        <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>

        {/* Price */}
        <p className={`text-3xl font-black mb-5 ${isRecommended ? 'text-primary-400' : 'text-white'}`}>
          Rs {plan.price.toLocaleString()}
        </p>

        {/* Features */}
        <div className="space-y-2.5 mb-6 min-h-[72px]">
          {plan.features.map((f, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span className="text-sm text-dark-400">{f}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          className={`w-full rounded-lg py-2.5 text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${
            isRecommended
              ? 'bg-primary-500 hover:bg-primary-600 text-white'
              : 'bg-dark-700 hover:bg-dark-600 text-dark-300 border border-dark-600'
          }`}
          disabled={isProcessing}
          onClick={() => onSelect(plan)}
        >
          {isProcessing ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : isRecommended ? (
            'Upgrade Now'
          ) : (
            'Select Plan'
          )}
        </button>
      </div>
    </div>
  );
}
