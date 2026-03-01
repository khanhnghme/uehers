import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AdminBackupRestore from '@/components/AdminBackupRestore';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Download, Upload, FolderArchive, Settings, File, MessageSquare, 
  FileText, MessageCircle, FolderOpen, History, Award, Bug, 
  HelpCircle, Shield, AlertTriangle, CheckCircle 
} from 'lucide-react';

export default function AdminBackup() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Bạn không có quyền truy cập trang này</p>
        </div>
      </DashboardLayout>
    );
  }

  const backupFeatures = [
    { icon: Settings, label: 'Thông tin project' },
    { icon: File, label: 'File đính kèm' },
    { icon: MessageSquare, label: 'Tin nhắn' },
    { icon: FileText, label: 'Ghi chú task' },
    { icon: MessageCircle, label: 'Bình luận task' },
    { icon: FolderOpen, label: 'Tài nguyên dự án' },
    { icon: History, label: 'Nhật ký hoạt động' },
    { icon: Award, label: 'Điểm số đầy đủ' },
    { icon: Bug, label: 'Lịch sử điều chỉnh' },
    { icon: HelpCircle, label: 'Phản hồi & bình luận' },
    { icon: Shield, label: 'Kiểm tra toàn vẹn' },
    { icon: FolderArchive, label: 'Phân loại thư mục' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Sao lưu & Khôi phục
              <span className="text-xs font-normal text-amber-600 bg-amber-500/10 px-2 py-1 rounded-full">v5.0</span>
            </h1>
            <p className="text-muted-foreground">Quản lý sao lưu và khôi phục dữ liệu project</p>
          </div>
          <AdminBackupRestore />
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Backup info */}
          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Download className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Sao lưu Project</h3>
                  <p className="text-xs text-muted-foreground">Xuất toàn bộ dữ liệu project ra file ZIP</p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-2 text-foreground">Hỗ trợ sao lưu:</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {backupFeatures.map(({ icon: Icon, label }, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        <Icon className="w-3 h-3 text-emerald-500" /> {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Restore info */}
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Khôi phục Project</h3>
                  <p className="text-xs text-muted-foreground">Nhập dữ liệu từ file ZIP backup</p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-700 dark:text-amber-400">
                  <p className="font-medium mb-2">Lưu ý quan trọng:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Dữ liệu sẽ được tạo thành project mới</li>
                    <li>Admin hiện tại sẽ trở thành Leader</li>
                    <li>Kiểm tra toàn vẹn tự động (v5.0+)</li>
                    <li>Thành viên sẽ được liên kết theo MSSV</li>
                    <li>Hỗ trợ file .zip từ hệ thống sao lưu v5.0</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
