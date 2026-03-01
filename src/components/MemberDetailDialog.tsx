import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import UserAvatar from '@/components/UserAvatar';
import { supabase } from '@/integrations/supabase/client';
import {
  User, Mail, GraduationCap, BookOpen, Phone, Sparkles, FileText,
  Shield, UserCheck, Briefcase, Clock, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import type { Profile } from '@/types/database';

interface GroupInfo {
  id: string;
  name: string;
  role: string;
}

interface ActivityInfo {
  id: string;
  action: string;
  description: string | null;
  created_at: string;
}

interface TaskInfo {
  id: string;
  title: string;
  status: string;
  group_name: string;
}

interface MemberDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Profile | null;
  systemRoles: string[];
}

export default function MemberDetailDialog({
  open, onOpenChange, member, systemRoles
}: MemberDetailDialogProps) {
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [activities, setActivities] = useState<ActivityInfo[]>([]);
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && member) {
      setLoading(true);
      Promise.all([
        fetchGroups(member.id),
        fetchActivities(member.id),
        fetchTasks(member.id),
      ]).finally(() => setLoading(false));
    }
  }, [open, member?.id]);

  const fetchGroups = async (userId: string) => {
    const { data } = await supabase
      .from('group_members')
      .select('group_id, role, groups(name)')
      .eq('user_id', userId);
    setGroups((data || []).map((d: any) => ({
      id: d.group_id,
      name: d.groups?.name || 'Unknown',
      role: d.role,
    })));
  };

  const fetchActivities = async (userId: string) => {
    const { data } = await supabase
      .from('activity_logs')
      .select('id, action, description, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    setActivities(data || []);
  };

  const fetchTasks = async (userId: string) => {
    const { data } = await supabase
      .from('task_assignments')
      .select('task_id, tasks(id, title, status, group_id, groups(name))')
      .eq('user_id', userId);
    setTasks((data || []).map((d: any) => ({
      id: d.tasks?.id || '',
      title: d.tasks?.title || 'Unknown',
      status: d.tasks?.status || 'TODO',
      group_name: d.tasks?.groups?.name || '',
    })));
  };

  if (!member) return null;

  const statusLabel: Record<string, string> = {
    'TODO': 'Chờ thực hiện', 'IN_PROGRESS': 'Đang thực hiện',
    'DONE': 'Hoàn thành', 'VERIFIED': 'Đã duyệt'
  };

  const statusColor: Record<string, string> = {
    'TODO': 'bg-muted text-muted-foreground',
    'IN_PROGRESS': 'bg-primary/10 text-primary',
    'DONE': 'bg-green-500/10 text-green-600',
    'VERIFIED': 'bg-blue-500/10 text-blue-600',
  };

  const roleLabel: Record<string, string> = {
    'admin': 'Admin', 'leader': 'Leader', 'member': 'Thành viên'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chi tiết thành viên</DialogTitle>
        </DialogHeader>

        {/* Profile header */}
        <div className="flex items-center gap-4 py-2">
          <UserAvatar src={member.avatar_url} name={member.full_name} size="xl"
            className="border-4 border-background shadow-lg" />
          <div className="min-w-0">
            <h3 className="text-lg font-bold truncate">{member.full_name}</h3>
            <p className="text-sm text-muted-foreground">{member.student_id}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {systemRoles.map(r => (
                <Badge key={r} variant={r === 'admin' ? 'destructive' : 'secondary'} className="text-xs gap-1">
                  {r === 'admin' ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                  {roleLabel[r] || r}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="info" className="flex-1 min-h-0">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">Thông tin</TabsTrigger>
            <TabsTrigger value="projects" className="flex-1">Projects ({groups.length})</TabsTrigger>
            <TabsTrigger value="tasks" className="flex-1">Tasks ({tasks.length})</TabsTrigger>
            <TabsTrigger value="activity" className="flex-1">Hoạt động</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[300px] mt-2">
            <TabsContent value="info" className="mt-0 space-y-2">
              <InfoRow icon={Mail} label="Email" value={member.email} />
              <InfoRow icon={GraduationCap} label="Khóa" value={member.year_batch} />
              <InfoRow icon={BookOpen} label="Ngành" value={member.major} />
              <InfoRow icon={Phone} label="SĐT" value={member.phone} />
              <InfoRow icon={Sparkles} label="Kỹ năng" value={member.skills} />
              <InfoRow icon={FileText} label="Giới thiệu" value={member.bio} />
              <InfoRow icon={Clock} label="Ngày tạo" value={new Date(member.created_at).toLocaleString('vi-VN')} />
              {member.must_change_password && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 text-warning text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Chưa đổi mật khẩu mặc định
                </div>
              )}
            </TabsContent>

            <TabsContent value="projects" className="mt-0">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto mt-8" /> :
                groups.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">Chưa tham gia project nào</p>
                ) : (
                  <div className="space-y-2">
                    {groups.map(g => (
                      <div key={g.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{g.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {roleLabel[g.role] || g.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
            </TabsContent>

            <TabsContent value="tasks" className="mt-0">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto mt-8" /> :
                tasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">Chưa được gán task nào</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map(t => (
                      <div key={t.id} className="p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate flex-1">{t.title}</span>
                          <Badge className={`text-xs ml-2 ${statusColor[t.status] || ''}`}>
                            {statusLabel[t.status] || t.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{t.group_name}</p>
                      </div>
                    ))}
                  </div>
                )}
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto mt-8" /> :
                activities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">Chưa có hoạt động nào</p>
                ) : (
                  <div className="space-y-2">
                    {activities.map(a => (
                      <div key={a.id} className="p-3 rounded-lg bg-muted/30">
                        <p className="text-sm">{a.description || a.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(a.created_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-1.5">
      <Icon className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}
