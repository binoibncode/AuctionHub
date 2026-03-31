import { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endTime: string;
  status: string;
}

export default function CountdownTimer({ endTime, status }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date(endTime);
      const diff = differenceInSeconds(end, now);

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        clearInterval(timer);
        return;
      }

      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;

      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="card p-6 bg-gradient-to-br from-dark-800 to-dark-900 border-l-4 border-l-primary-500">
      <div className="flex items-center gap-3 mb-2 text-dark-400">
        <Clock className="w-5 h-5" />
        <h3 className="font-bold uppercase tracking-wider text-sm">
          {status === 'upcoming' ? 'Starts In' : 'Ends In'}
        </h3>
      </div>
      <div className="text-4xl font-black text-white font-mono tracking-tight">
        {timeLeft || '00:00:00'}
      </div>
    </div>
  );
}
