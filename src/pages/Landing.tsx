import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Shield, Loader2, X, ChevronRight, ChevronLeft, CheckCircle2, BarChart3, ListChecks, Clock, Award, Globe, MessageSquare, FileText, Zap, Lock, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import uehLogo from '@/assets/ueh-logo-new.png';

const introPages = [
  {
    title: 'Tổng quan hệ thống',
    subtitle: 'Teamworks UEH — Nền tảng quản lý công việc nhóm',
    content: [
      { icon: CheckCircle2, label: 'Mục đích', text: 'Hỗ trợ sinh viên UEH quản lý công việc nhóm một cách minh bạch, hiệu quả với hệ thống tính điểm tự động, đảm bảo đánh giá công bằng cho mọi thành viên.' },
      { icon: Users, label: 'Đối tượng', text: 'Sinh viên UEH làm đồ án nhóm, giảng viên cần theo dõi và đánh giá tiến độ nhóm. Hệ thống phi thương mại, phục vụ mục đích học tập.' },
      { icon: Globe, label: 'Truy cập', text: 'Giao diện web responsive, hoạt động trên mọi thiết bị. Hỗ trợ chia sẻ dự án công khai cho giảng viên xem mà không cần đăng nhập.' },
    ],
  },
  {
    title: 'Quản lý Task',
    subtitle: 'Phân công, theo dõi và hoàn thành công việc',
    content: [
      { icon: ListChecks, label: 'Tạo & phân công', text: 'Leader tạo task, gán deadline, phân công cho thành viên. Hỗ trợ mô tả chi tiết, đính kèm tài liệu và ghi chú nội bộ.' },
      { icon: BarChart3, label: 'Kanban Board', text: 'Theo dõi tiến độ trực quan với bảng Kanban (TODO → IN_PROGRESS → DONE → VERIFIED). Kéo thả để cập nhật trạng thái.' },
      { icon: Clock, label: 'Deadline thông minh', text: 'Hệ thống nhắc nhở trước deadline, hỗ trợ gia hạn deadline riêng. Tự động tính penalty khi nộp trễ.' },
      { icon: Upload, label: 'Nộp bài đa dạng', text: 'Hỗ trợ nộp link, upload file (giới hạn dung lượng tùy chỉnh), lưu lịch sử nộp bài đầy đủ cho từng thành viên.' },
    ],
  },
  {
    title: 'Hệ thống chấm điểm',
    subtitle: 'Tính điểm tự động, công bằng và minh bạch',
    content: [
      { icon: Award, label: 'Chấm điểm task', text: 'Điểm cơ bản 100, trừ penalty nộp trễ, trừ penalty review nhiều lần. Cộng bonus nộp sớm và bonus Bug Hunter.' },
      { icon: BarChart3, label: 'Điểm giai đoạn', text: 'Tính trung bình điểm task theo giai đoạn, áp dụng hệ số K tùy chỉnh. Hỗ trợ cấu hình trọng số cho từng giai đoạn.' },
      { icon: CheckCircle2, label: 'Điểm tổng kết', text: 'Trung bình có trọng số các giai đoạn + điều chỉnh cá nhân = điểm cuối cùng. Xuất báo cáo Excel chi tiết.' },
      { icon: FileText, label: 'Khiếu nại & lịch sử', text: 'Thành viên có thể gửi khiếu nại điểm kèm minh chứng. Mọi điều chỉnh đều được ghi log đầy đủ.' },
    ],
  },
  {
    title: 'Quản lý dự án',
    subtitle: 'Tổ chức nhóm và tài nguyên hiệu quả',
    content: [
      { icon: Users, label: 'Thành viên', text: 'Thêm thành viên bằng MSSV, phân vai trò Leader/Member. Hỗ trợ import hàng loạt từ Excel, đình chỉ tạm thời.' },
      { icon: ListChecks, label: 'Giai đoạn', text: 'Chia dự án thành nhiều giai đoạn (Stage) với thời gian và mô tả riêng. Sắp xếp task theo giai đoạn.' },
      { icon: Upload, label: 'Tài nguyên', text: 'Upload file, thêm link tài liệu, tổ chức theo thư mục. Hỗ trợ tải cả thư mục và đổi tên khi upload.' },
      { icon: Lock, label: 'Bảo mật', text: 'Phân quyền chi tiết: Admin, Leader, Member. Dữ liệu được bảo vệ bằng RLS policies ở cấp database.' },
    ],
  },
  {
    title: 'Tính năng nâng cao',
    subtitle: 'Công cụ hỗ trợ chuyên nghiệp',
    content: [
      { icon: MessageSquare, label: 'Giao tiếp', text: 'Chat nhóm, bình luận theo task, mention @thành viên. Thông báo realtime khi được nhắc đến hoặc có thay đổi.' },
      { icon: Zap, label: 'AI Assistant', text: 'Trợ lý AI tích hợp hỗ trợ phân tích tiến độ, gợi ý cải thiện và trả lời câu hỏi về hệ thống.' },
      { icon: FileText, label: 'Xuất báo cáo', text: 'Xuất PDF nhật ký hoạt động, xuất Excel điểm số, xuất minh chứng dự án đầy đủ phục vụ đánh giá.' },
      { icon: Globe, label: 'Sao lưu & Khôi phục', text: 'Sao lưu toàn bộ dự án thành file ZIP, khôi phục trên project mới. Hỗ trợ hủy giữa chừng an toàn.' },
    ],
  },
];

export default function Landing() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageDirection, setPageDirection] = useState<'next' | 'prev'>('next');

  const openIntro = () => {
    setCurrentPage(0);
    setShowIntro(true);
    requestAnimationFrame(() => setIntroVisible(true));
  };

  const closeIntro = () => {
    setIntroVisible(false);
    setTimeout(() => setShowIntro(false), 400);
  };

  const goPage = useCallback((dir: 'next' | 'prev') => {
    setPageDirection(dir);
    setCurrentPage((p) => dir === 'next' ? Math.min(p + 1, introPages.length - 1) : Math.max(p - 1, 0));
  }, []);

  useEffect(() => {
    if (!showIntro) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeIntro();
      if (e.key === 'ArrowRight') goPage('next');
      if (e.key === 'ArrowLeft') goPage('prev');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showIntro, goPage]);

  const handleInitAdmin = async () => {
    setIsInitializing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ensure-admin');
      if (error) throw error;
      if (data?.success) toast.success(data.message || 'Khởi tạo admin thành công!');
      else toast.error(data?.error || 'Có lỗi xảy ra');
    } catch (error: any) {
      toast.error('Lỗi kết nối: ' + (error.message || 'Không thể khởi tạo admin'));
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - UEH teal */}
      <header className="border-b bg-primary text-primary-foreground sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={uehLogo} alt="UEH logo" className="h-8 w-auto drop-shadow-md" loading="lazy" />
            <div className="hidden sm:block h-8 w-px bg-primary-foreground/30" />
            <span className="hidden sm:block font-heading font-semibold text-lg">Teamworks UEH</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInitAdmin}
              disabled={isInitializing}
              className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 text-xs gap-1 h-8 px-2"
              title="Khởi tạo tài khoản Admin"
            >
              {isInitializing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
              <span className="hidden sm:inline">Init</span>
            </Button>
            <Link to="/auth">
              <Button variant="secondary" className="font-medium">
                Đăng nhập
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Sub-header */}
      <div className="bg-primary/90 text-primary-foreground border-b border-primary/40">
        <div className="container mx-auto px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-2 text-xs md:text-sm">
          <span className="font-medium">Liên hệ Leader phụ trách hệ thống:</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Họ tên: <span className="font-semibold">Nguyễn Hoàng Khánh</span></span>
            <span>Email: <span className="font-semibold">khanhngh.ueh@gmail.com</span></span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <main className="flex-1 flex items-center">
        <section className="w-full py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left */}
              <div className="space-y-6 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                  <Users className="w-4 h-4" />
                  Dành cho sinh viên UEH
                </div>

                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Effective Team{' '}
                  <span className="text-gradient">Task Management System</span>
                </h1>

                <p className="text-lg text-muted-foreground max-w-lg">
                  Nền tảng số giúp sinh viên quản lý công việc nhóm một cách minh bạch,
                  công bằng với hệ thống tính điểm tự động.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link to="/auth" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full text-base font-semibold px-8">
                      Đăng nhập hệ thống
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>

                <div className="flex gap-8 pt-8 border-t border-border/50">
                  <div><p className="text-sm font-medium text-foreground">Đồ án Sinh viên</p></div>
                  <div><p className="text-sm font-medium text-foreground">Mục đích Học tập</p></div>
                  <div><p className="text-sm font-medium text-foreground">Phi thương mại</p></div>
                </div>
              </div>

              {/* Right - Explore button (sharp, typographic) */}
              <div className="hidden lg:flex items-center justify-center" style={{ animation: 'fade-in 0.8s ease-out 0.2s both' }}>
                <div className="relative flex flex-col items-center gap-8">
                  <button
                    onClick={openIntro}
                    className="group relative overflow-hidden border-2 border-primary/30 hover:border-primary transition-all duration-500 px-12 py-6 cursor-pointer focus:outline-none bg-background"
                  >
                    {/* BG slide-up */}
                    <span className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                    <span className="relative z-10 flex flex-col items-center gap-3">
                      <span className="text-[2rem] font-bold tracking-[0.15em] text-primary group-hover:text-primary-foreground transition-colors duration-500 uppercase">
                        Khám phá
                      </span>
                      <span className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-muted-foreground group-hover:text-primary-foreground/70 transition-colors duration-500">
                        Tìm hiểu hệ thống
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </span>
                    {/* Bottom line draw */}
                    <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-accent group-hover:w-full transition-all duration-700 ease-out" />
                  </button>

                  <div className="flex items-center gap-3 text-muted-foreground/40">
                    <span className="w-12 h-px bg-current" />
                    <span className="text-[10px] tracking-[0.3em] uppercase font-medium">ver 5.0</span>
                    <span className="w-12 h-px bg-current" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - UEH teal */}
      <footer className="border-t bg-primary text-primary-foreground py-6 mt-8">
        <div className="container mx-auto px-4 space-y-4 text-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={uehLogo} alt="UEH logo" className="h-8 w-auto" loading="lazy" />
              <span className="text-xs md:text-sm">
                © 2025 Teamworks UEH &mdash; Hệ thống quản lý công việc nhóm cho sinh viên UEH.
              </span>
            </div>
            <p className="text-xs md:text-sm text-primary-foreground/90 text-center md:text-right max-w-md">
              Teamworks hỗ trợ chia task, theo dõi tiến độ, tính điểm từng thành viên và tổng kết theo giai đoạn,
              giúp giảng viên và sinh viên đánh giá công bằng, minh bạch.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs md:text-sm text-primary-foreground/90">
            <span>Đơn vị: Trường Đại học Kinh tế TP. Hồ Chí Minh (UEH).</span>
            <span>Góp ý &amp; báo lỗi hệ thống: <span className="font-semibold">khanhngh.ueh@gmail.com</span></span>
          </div>
        </div>
      </footer>

      {/* Intro Overlay — 16:9 multi-page */}
      {showIntro && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-[400ms] ${
            introVisible ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'
          }`}
          onClick={closeIntro}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-background rounded-xl overflow-hidden flex flex-col shadow-2xl transition-all duration-500 ease-out ${
              introVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'
            }`}
            style={{ width: '1280px', maxWidth: '95vw', height: '720px', maxHeight: '90vh' }}
          >
            {/* Header */}
            <div className="relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-accent opacity-95" />
              <div className="relative px-6 py-4 text-primary-foreground flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={uehLogo} alt="UEH" className="h-6 w-auto" />
                  <div className="h-4 w-px bg-primary-foreground/30" />
                  <div>
                    <h2 className="text-lg font-bold">Giới thiệu Teamworks UEH</h2>
                    <p className="text-primary-foreground/70 text-xs">Trang {currentPage + 1} / {introPages.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {introPages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { setPageDirection(i > currentPage ? 'next' : 'prev'); setCurrentPage(i); }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === currentPage ? 'bg-primary-foreground w-6' : 'bg-primary-foreground/30 hover:bg-primary-foreground/50 w-3'
                        }`}
                      />
                    ))}
                  </div>
                  <button onClick={closeIntro} className="w-8 h-8 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Page body */}
            <div className="flex-1 overflow-y-auto">
              <div
                key={currentPage}
                className="p-8 h-full flex flex-col"
                style={{
                  animation: pageDirection === 'next'
                    ? 'slide-in-from-right 0.35s ease-out both'
                    : 'slide-in-from-left 0.35s ease-out both',
                }}
              >
                <div className="mb-6 space-y-1">
                  <h3 className="text-2xl font-bold text-foreground">{introPages[currentPage].title}</h3>
                  <p className="text-muted-foreground">{introPages[currentPage].subtitle}</p>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {introPages[currentPage].content.map((item, i) => (
                    <div
                      key={i}
                      className="group rounded-xl border border-border/60 bg-muted/30 p-5 transition-all duration-300 hover:shadow-md hover:bg-muted/50 hover:-translate-y-0.5"
                      style={{ animation: `fade-in 0.4s ease-out ${i * 80 + 100}ms both` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/15 to-accent/10 shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <h4 className="font-semibold text-foreground text-sm">{item.label}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer nav */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30 flex-shrink-0">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <img src={uehLogo} alt="UEH" className="h-5 w-auto opacity-50" />
                <span>Đồ án sinh viên · Phi thương mại</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => goPage('prev')} className="gap-1">
                  <ChevronLeft className="w-4 h-4" /> Trước
                </Button>
                {currentPage < introPages.length - 1 ? (
                  <Button size="sm" onClick={() => goPage('next')} className="gap-1">
                    Tiếp theo <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Link to="/auth" onClick={closeIntro}>
                    <Button size="sm" className="gap-1 shadow-md">
                      Bắt đầu sử dụng <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-from-right {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-from-left {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
