import { useState } from 'react';
import { X, CheckCircle, Smartphone, CreditCard, Landmark, QrCode, Banknote } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName: string;
  registrationFee: number;
  onPaymentComplete: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  teamName,
  registrationFee,
  onPaymentComplete
}: PaymentModalProps): JSX.Element | null {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setPaymentSuccess(true);
    
    setTimeout(() => {
      onPaymentComplete();
      setPaymentSuccess(false);
      setPaymentMethod('upi');
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  const paymentMethods = [
    { id: 'upi', label: 'UPI', icon: Smartphone, color: 'text-primary-500', bg: 'bg-primary-500/15', description: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-400/15', description: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', label: 'Net Banking', icon: Landmark, color: 'text-amber-400', bg: 'bg-amber-400/15', description: 'All major banks' },
    { id: 'scan', label: 'Scan & Pay', icon: QrCode, color: 'text-purple-400', bg: 'bg-purple-400/15', description: 'Scan QR code' },
    { id: 'cod', label: 'Cash on Site', icon: Banknote, color: 'text-emerald-400', bg: 'bg-emerald-400/15', description: 'Pay at venue' }
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-dark-900/95 backdrop-blur-md">
      <div className="bg-dark-800 rounded-2xl max-w-sm w-full shadow-2xl border border-dark-700 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative px-5 py-4 bg-gradient-to-r from-primary-600 to-primary-500 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-black text-white">Registration Fee</h2>
            <p className="text-white/80 text-xs">Team: {teamName}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {!paymentSuccess ? (
            <>
              {/* Fee Amount */}
              <div className="bg-dark-700/50 rounded-xl p-3 mb-4 text-center border border-dark-600">
                <p className="text-dark-400 text-[11px] uppercase font-bold mb-0.5">Amount to Pay</p>
                <p className="text-3xl font-black text-primary-500">₹{registrationFee}</p>
              </div>

              {/* Payment Methods */}
              <div className="mb-4">
                <p className="text-dark-400 text-[11px] uppercase font-bold tracking-wider mb-2">Select Payment Method</p>
                <div className="space-y-1.5">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full px-3 py-2.5 rounded-lg border-2 transition-all text-left ${
                        paymentMethod === method.id
                          ? 'bg-primary-500/10 border-primary-500'
                          : 'bg-dark-700 border-dark-600 hover:border-dark-500'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-lg ${method.bg} flex items-center justify-center flex-shrink-0`}>
                          <method.icon className={`w-4.5 h-4.5 ${method.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm ${paymentMethod === method.id ? 'text-primary-500' : 'text-white'}`}>
                            {method.label}
                          </p>
                          <p className="text-[11px] text-dark-400">{method.description}</p>
                        </div>
                        {paymentMethod === method.id && (
                          <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2.5 mb-4">
                <p className="text-[11px] text-yellow-600 font-medium">
                  ⚠️ <span className="font-bold">Demo Mode:</span> This is a demonstration. Payment will not be processed.
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Processing...
                  </>
                ) : (
                  `Pay ₹${registrationFee}`
                )}
              </button>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-8">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <h3 className="text-lg font-black text-white mb-1">Payment Successful!</h3>
              <p className="text-dark-400 text-sm mb-1">Registration fee paid</p>
              <p className="text-primary-500 font-bold text-sm">₹{registrationFee} charged</p>
              <p className="text-dark-500 text-xs mt-2">Proceeding to auction...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
