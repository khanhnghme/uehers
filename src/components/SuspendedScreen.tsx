import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Clock, Mail, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SuspendedScreenProps {
  suspendedUntil: string;
  suspensionReason: string | null;
  onSignOut: () => void;
  onUnlocked: () => void;
}

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

  // Also periodically re-check DB to see if admin unlocked early
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
    const interval = setInterval(check, 30000); // check every 30s
    return () => clearInterval(interval);
  }, [onUnlocked]);

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-destructive/30 shadow-xl">
        <CardContent className="pt-8 pb-8 px-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-destructive" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Tài khoản bị tạm khóa</h1>
            <p className="text-muted-foreground mt-2">
              Tài khoản của bạn đã bị tạm khóa bởi quản trị viên.
            </p>
          </div>

          {suspensionReason && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-destructive mb-1">Lý do:</p>
              <p className="text-sm text-foreground">{suspensionReason}</p>
            </div>
          )}

          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Thời gian còn lại</span>
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">{timeLeft}</p>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3 text-left">
            <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Cần hỗ trợ?</p>
              <p className="text-muted-foreground mt-1">
                Vui lòng liên hệ Admin hệ thống để được hỗ trợ mở khóa tài khoản.
              </p>
            </div>
          </div>

          <Button variant="outline" onClick={onSignOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
