import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

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
    { id: 'upi', label: 'UPI', icon: '📱', description: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', label: 'Credit/Debit Card', icon: '💳', description: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', label: 'Net Banking', icon: '🏦', description: 'All major banks' },
    { id: 'scan', label: 'Scan & Pay', icon: '📸', description: 'Scan QR code' },
    { id: 'cod', label: 'Cash on Site', icon: '💵', description: 'Pay at venue' }
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-dark-900/95 backdrop-blur-md">
      <div className="bg-dark-800 rounded-2xl max-w-md w-full shadow-2xl border border-dark-700 overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-primary-600 to-primary-500">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-black text-white mb-1">Registration Fee</h2>
            <p className="text-white/80 text-sm">Team: {teamName}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!paymentSuccess ? (
            <>
              {/* Fee Amount */}
              <div className="bg-dark-700/50 rounded-xl p-4 mb-6 text-center border border-dark-600">
                <p className="text-dark-400 text-sm uppercase font-bold mb-1">Amount to Pay</p>
                <p className="text-4xl font-black text-primary-500">₹{registrationFee}</p>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <p className="text-dark-400 text-xs uppercase font-bold tracking-wider mb-3">Select Payment Method</p>
                <div className="space-y-2">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        paymentMethod === method.id
                          ? 'bg-primary-500/10 border-primary-500 shadow-lg'
                          : 'bg-dark-700 border-dark-600 hover:border-dark-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div className="flex-1">
                          <p className={`font-bold ${paymentMethod === method.id ? 'text-primary-500' : 'text-white'}`}>
                            {method.label}
                          </p>
                          <p className="text-xs text-dark-400">{method.description}</p>
                        </div>
                        {paymentMethod === method.id && (
                          <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-6">
                <p className="text-xs text-yellow-600 font-medium">
                  ⚠️ <span className="font-bold">Demo Mode:</span> This is a demonstration. Payment will not be processed.
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Payment Successful!</h3>
              <p className="text-dark-400 text-sm mb-2">Registration fee paid</p>
              <p className="text-primary-500 font-bold">₹{registrationFee} charged</p>
              <p className="text-dark-500 text-xs mt-3">Proceeding to auction...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
