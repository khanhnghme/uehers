import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Clock, Mail, LogOut, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import uehLogo from '@/assets/ueh-logo.png';

interface SuspendedScreenProps {
  suspendedUntil: string;
  suspensionReason: string | null;
  onSignOut: () => void;
  onUnlocked: () => void;
}

const ADMIN_EMAIL = 'khanhngh.ueh@gmail.com';

export default function SuspendedScreen({ suspendedUntil, suspensionReason, onSignOut, onUnlocked }: SuspendedScreenProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const isPermanent = new Date(suspendedUntil).getFullYear() >= 2099;

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const end = new Date(suspendedUntil).getTime();
      const diff = end - now;

      if (diff <= 0 && !isPermanent) {
        onUnlocked();
        return;
      }

      if (isPermanent) {
        setTimeLeft('Vĩnh viễn');
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      const parts: string[] = [];
      if (days > 0) parts.push(`${days} ngày`);
      if (hours > 0) parts.push(`${hours} giờ`);
      if (minutes > 0) parts.push(`${minutes} phút`);
      parts.push(`${seconds} giây`);
      setTimeLeft(parts.join(' '));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [suspendedUntil, isPermanent, onUnlocked]);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from('profiles')
        .select('suspended_until')
        .eq('id', session.user.id)
        .maybeSingle();
      if (!data?.suspended_until || new Date(data.suspended_until).getTime() <= Date.now()) {
        onUnlocked();
      }
    };
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [onUnlocked]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #003366 0%, #00508F 30%, #0066B3 60%, #004D80 100%)' }}>
      {/* Header */}
      <header className="py-4 px-6 flex items-center justify-center">
        <img src={uehLogo} alt="UEH Logo" className="h-12 object-contain brightness-0 invert" />
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
            {/* Red warning strip */}
            <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #DC2626, #B91C1C)' }} />

            <div className="pt-8 pb-8 px-8 text-center space-y-6">
              {/* Icon */}
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: 'rgba(220, 38, 38, 0.1)' }} />
                <div className="relative w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(220, 38, 38, 0.05))' }}>
                  <ShieldAlert className="w-12 h-12" style={{ color: '#DC2626' }} />
                </div>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-2xl font-bold text-foreground">Tài khoản bị tạm khóa</h1>
                <p className="text-muted-foreground mt-2 text-sm">
                  Tài khoản của bạn đã bị tạm khóa bởi quản trị viên hệ thống Teamworks UEH.
                </p>
              </div>

              {/* Reason */}
              {suspensionReason && (
                <div className="rounded-xl p-4 text-left border" style={{ background: 'rgba(220, 38, 38, 0.04)', borderColor: 'rgba(220, 38, 38, 0.15)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#DC2626' }}>Lý do khóa</p>
                  <p className="text-sm text-foreground leading-relaxed">{suspensionReason}</p>
                </div>
              )}

              {/* Countdown */}
              <div className="rounded-xl p-5 space-y-3" style={{ background: 'linear-gradient(135deg, rgba(0, 51, 102, 0.06), rgba(0, 102, 179, 0.04))' }}>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: '#003366' }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#003366' }}>Thời gian còn lại</span>
                </div>
                <p className="text-3xl font-bold font-mono text-foreground tracking-tight">{timeLeft}</p>
                {!isPermanent && (
                  <p className="text-xs text-muted-foreground">
                    Mở khóa lúc: {new Date(suspendedUntil).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>

              {/* Contact Admin */}
              <div className="rounded-xl p-4 text-left border" style={{ background: 'rgba(0, 51, 102, 0.04)', borderColor: 'rgba(0, 51, 102, 0.15)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(0, 51, 102, 0.1)' }}>
                    <Mail className="w-5 h-5" style={{ color: '#003366' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Cần hỗ trợ?</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Liên hệ Admin hệ thống để được hỗ trợ mở khóa tài khoản:
                    </p>
                    <a
                      href={`mailto:${ADMIN_EMAIL}`}
                      className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium hover:underline"
                      style={{ color: '#0066B3' }}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {ADMIN_EMAIL}
                    </a>
                  </div>
                </div>
              </div>

              {/* Sign out */}
              <Button variant="outline" onClick={onSignOut} className="gap-2 w-full">
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </Button>
            </div>

            {/* Footer */}
            <div className="border-t px-8 py-3 text-center">
              <p className="text-xs text-muted-foreground">
                © 2025 Teamworks UEH — Đại học Kinh tế TP. Hồ Chí Minh
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
