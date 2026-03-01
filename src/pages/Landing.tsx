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

  // Keyboard nav
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
      {/* ─── Navbar ─── */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={uehLogo} alt="UEH" className="h-7 w-auto" loading="lazy" />
            <div className="hidden sm:block h-5 w-px bg-border" />
            <span className="hidden sm:block text-sm font-semibold tracking-tight text-foreground">
              Teamworks
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleInitAdmin}
              disabled={isInitializing}
              className="text-muted-foreground hover:text-foreground transition-colors p-1.5"
              title="Init Admin"
            >
              {isInitializing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
            </button>
            <Link to="/auth">
              <button className="relative text-sm font-medium text-foreground px-4 py-2 border border-foreground/20 hover:border-foreground/60 transition-all duration-300 tracking-wide group">
                Đăng nhập
                <span className="absolute bottom-0 left-0 h-px w-0 bg-foreground group-hover:w-full transition-all duration-300" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Contact strip ─── */}
      <div className="border-b border-border/30 bg-muted/30">
        <div className="container mx-auto px-6 py-2 flex flex-col md:flex-row items-center justify-between gap-1 text-xs text-muted-foreground">
          <span>Leader phụ trách: <span className="font-medium text-foreground">Nguyễn Hoàng Khánh</span></span>
          <span>khanhngh.ueh@gmail.com</span>
        </div>
      </div>

      {/* ─── Hero ─── */}
      <main className="flex-1 flex items-center relative overflow-hidden">
        {/* Subtle ambient light */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-3xl pointer-events-none" />

        <section className="w-full py-16 md:py-24 relative z-10">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left — Copy */}
              <div className="space-y-8" style={{ animation: 'fade-in 0.6s ease-out both' }}>
                <div className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-muted-foreground">
                  <span className="w-8 h-px bg-muted-foreground/40" />
                  Dành cho sinh viên UEH
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-foreground leading-[1.1] tracking-tight">
                  Effective Team
                  <br />
                  <span className="text-primary">Task Management</span>
                  <br />
                  System
                </h1>

                <p className="text-base text-muted-foreground max-w-md leading-relaxed">
                  Nền tảng số giúp sinh viên quản lý công việc nhóm
                  minh bạch, công bằng với hệ thống tính điểm tự động.
                </p>

                <div className="flex items-center gap-6 pt-2">
                  <Link to="/auth">
                    <button className="relative bg-foreground text-background px-7 py-3 text-sm font-semibold tracking-wide hover:bg-foreground/90 transition-colors duration-200 group">
                      Đăng nhập
                      <ArrowRight className="inline-block w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </button>
                  </Link>
                </div>

                <div className="flex items-center gap-6 pt-6 border-t border-border/40">
                  {['Đồ án Sinh viên', 'Mục đích Học tập', 'Phi thương mại'].map((t, i) => (
                    <span key={i} className="text-xs tracking-wide text-muted-foreground font-medium uppercase">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — Explore CTA */}
              <div
                className="hidden lg:flex items-center justify-center"
                style={{ animation: 'fade-in 0.8s ease-out 0.2s both' }}
              >
                <div className="relative flex flex-col items-center gap-10">
                  {/* Ambient glow behind */}
                  <div className="absolute inset-0 -inset-x-16 -inset-y-8 bg-gradient-to-b from-primary/[0.04] via-transparent to-accent/[0.03] pointer-events-none" />

                  {/* Main explore button — sharp, typographic */}
                  <button
                    onClick={openIntro}
                    className="group relative z-10 overflow-hidden border border-foreground/15 hover:border-foreground/50 transition-all duration-500 px-12 py-6 cursor-pointer focus:outline-none"
                  >
                    {/* BG slide-up on hover */}
                    <span className="absolute inset-0 bg-foreground translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />

                    <span className="relative z-10 flex flex-col items-center gap-3">
                      <span className="text-[2rem] font-bold tracking-[0.15em] text-foreground group-hover:text-background transition-colors duration-500 uppercase">
                        Khám phá
                      </span>
                      <span className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-muted-foreground group-hover:text-background/70 transition-colors duration-500">
                        Tìm hiểu hệ thống
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </span>

                    {/* Border draw effect — bottom line */}
                    <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-700 ease-out" />
                  </button>

                  {/* Decorative lines */}
                  <div className="flex items-center gap-3 text-muted-foreground/30">
                    <span className="w-16 h-px bg-current" />
                    <span className="text-[10px] tracking-[0.3em] uppercase font-medium">ver 5.0</span>
                    <span className="w-16 h-px bg-current" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-6 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={uehLogo} alt="UEH" className="h-6 w-auto opacity-50" loading="lazy" />
              <span className="text-xs text-muted-foreground">
                © 2025 Teamworks UEH
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center md:text-right max-w-sm leading-relaxed">
              Hỗ trợ chia task, theo dõi tiến độ, tính điểm và tổng kết — đánh giá công bằng, minh bạch.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground/60">
            <span>Trường Đại học Kinh tế TP. Hồ Chí Minh (UEH)</span>
            <span>Góp ý: khanhngh.ueh@gmail.com</span>
          </div>
        </div>
      </footer>

      {/* ─── Intro Overlay — 16:9 multi-page ─── */}
      {showIntro && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-[400ms] ${
            introVisible ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'
          }`}
          onClick={closeIntro}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-background overflow-hidden flex flex-col shadow-2xl transition-all duration-500 ease-out ${
              introVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-[0.97] translate-y-4'
            }`}
            style={{ width: '1280px', maxWidth: '95vw', height: '720px', maxHeight: '90vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-border/40 flex-shrink-0">
              <div className="flex items-center gap-4">
                <img src={uehLogo} alt="UEH" className="h-6 w-auto" />
                <div className="h-4 w-px bg-border" />
                <div>
                  <h2 className="text-sm font-bold tracking-tight">Giới thiệu Teamworks UEH</h2>
                  <p className="text-[11px] text-muted-foreground">
                    Trang {currentPage + 1} / {introPages.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Page indicators */}
                <div className="flex gap-1">
                  {introPages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setPageDirection(i > currentPage ? 'next' : 'prev'); setCurrentPage(i); }}
                      className={`h-1 transition-all duration-300 ${
                        i === currentPage
                          ? 'bg-foreground w-8'
                          : 'bg-foreground/15 hover:bg-foreground/30 w-4'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={closeIntro}
                  className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Page body */}
            <div className="flex-1 overflow-y-auto">
              <div
                key={currentPage}
                className="p-8 lg:p-10 h-full flex flex-col"
                style={{
                  animation: pageDirection === 'next'
                    ? 'slide-in-from-right 0.35s ease-out both'
                    : 'slide-in-from-left 0.35s ease-out both',
                }}
              >
                {/* Title */}
                <div className="mb-8 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-px bg-primary" />
                    <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-primary">
                      {String(currentPage + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                    {introPages[currentPage].title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {introPages[currentPage].subtitle}
                  </p>
                </div>

                {/* Cards */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {introPages[currentPage].content.map((item, i) => (
                    <div
                      key={i}
                      className="group border border-border/50 p-6 transition-all duration-300 hover:border-foreground/20 hover:bg-muted/30"
                      style={{
                        animation: `fade-in 0.4s ease-out ${i * 80 + 100}ms both`,
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-9 h-9 border border-border/60 flex items-center justify-center flex-shrink-0 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-2 min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-foreground tracking-tight">{item.label}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer nav */}
            <div className="flex items-center justify-between px-8 py-4 border-t border-border/40 flex-shrink-0">
              <span className="text-[11px] text-muted-foreground/50 tracking-wide">
                Đồ án sinh viên · Phi thương mại
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 0}
                  onClick={() => goPage('prev')}
                  className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 border border-border/50 text-muted-foreground hover:text-foreground hover:border-foreground/30 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Trước
                </button>
                {currentPage < introPages.length - 1 ? (
                  <button
                    onClick={() => goPage('next')}
                    className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors duration-200"
                  >
                    Tiếp theo
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Link to="/auth" onClick={closeIntro}>
                    <button className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors duration-200">
                      Bắt đầu sử dụng
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
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
