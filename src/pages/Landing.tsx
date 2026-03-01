import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Shield, Loader2, Sparkles, X, ChevronRight, CheckCircle2, BarChart3, ListChecks, Clock, Award, Globe, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import uehLogo from '@/assets/ueh-logo-new.png';

const introSections = [
  {
    icon: ListChecks,
    title: 'Quản lý Task thông minh',
    desc: 'Tạo, phân công và theo dõi tiến độ công việc theo từng giai đoạn. Hỗ trợ Kanban board, deadline tự động và nhắc nhở thông minh.',
    color: 'from-primary/20 to-primary/5',
  },
  {
    icon: BarChart3,
    title: 'Hệ thống chấm điểm tự động',
    desc: 'Tính điểm công bằng dựa trên: nộp đúng hạn, chất lượng, bonus sớm, penalty trễ. Hỗ trợ khiếu nại và điều chỉnh linh hoạt.',
    color: 'from-accent/20 to-accent/5',
  },
  {
    icon: Clock,
    title: 'Theo dõi tiến độ realtime',
    desc: 'Dashboard trực quan hiển thị tiến độ từng thành viên, từng giai đoạn. Thông báo tức thì khi có thay đổi.',
    color: 'from-success/20 to-success/5',
  },
  {
    icon: Award,
    title: 'Đánh giá minh bạch',
    desc: 'Lịch sử điều chỉnh điểm, hệ thống khiếu nại, báo cáo chi tiết giúp giảng viên và sinh viên đánh giá công bằng.',
    color: 'from-warning/20 to-warning/5',
  },
  {
    icon: Globe,
    title: 'Chia sẻ dự án công khai',
    desc: 'Tạo link chia sẻ để giảng viên hoặc bên ngoài xem tiến độ dự án mà không cần đăng nhập.',
    color: 'from-info/20 to-info/5',
  },
  {
    icon: MessageSquare,
    title: 'Giao tiếp tập trung',
    desc: 'Bình luận theo task, mention thành viên, thảo luận nhóm — mọi trao đổi đều gắn liền với công việc cụ thể.',
    color: 'from-primary/15 to-accent/10',
  },
];

export default function Landing() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);

  const openIntro = () => {
    setShowIntro(true);
    requestAnimationFrame(() => setIntroVisible(true));
  };

  const closeIntro = () => {
    setIntroVisible(false);
    setTimeout(() => setShowIntro(false), 400);
  };

  const handleInitAdmin = async () => {
    setIsInitializing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ensure-admin');
      if (error) throw error;
      if (data?.success) {
        toast.success(data.message || 'Khởi tạo admin thành công!');
      } else {
        toast.error(data?.error || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      console.error('Error initializing admin:', error);
      toast.error('Lỗi kết nối: ' + (error.message || 'Không thể khởi tạo admin'));
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
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

              {/* Right - Animated Explore Button */}
              <div className="hidden lg:flex items-center justify-center">
                <button
                  onClick={openIntro}
                  className="group relative w-52 h-52 rounded-full flex flex-col items-center justify-center cursor-pointer focus:outline-none"
                >
                  {/* Animated rings */}
                  <span className="absolute inset-0 rounded-full border-2 border-primary/20 animate-[ping_3s_ease-in-out_infinite]" />
                  <span className="absolute inset-3 rounded-full border border-accent/30 animate-[ping_3s_ease-in-out_0.5s_infinite]" />
                  <span className="absolute inset-6 rounded-full border border-primary/15 animate-[ping_3s_ease-in-out_1s_infinite]" />

                  {/* Core */}
                  <div className="relative z-10 w-36 h-36 rounded-full bg-gradient-to-br from-primary via-primary/90 to-accent flex flex-col items-center justify-center gap-2 shadow-xl group-hover:shadow-2xl group-hover:shadow-primary/25 transition-all duration-500 group-hover:scale-110">
                    <Sparkles className="w-8 h-8 text-primary-foreground drop-shadow-md transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                    <span className="text-primary-foreground font-bold text-sm tracking-wide">KHÁM PHÁ</span>
                    <ChevronRight className="w-4 h-4 text-primary-foreground/70 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
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

      {/* Intro Overlay */}
      {showIntro && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-[400ms] ${
            introVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'
          }`}
          onClick={closeIntro}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-[95vw] max-w-5xl max-h-[88vh] bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-500 ease-out ${
              introVisible
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-8'
            }`}
          >
            {/* Intro Header */}
            <div className="relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-accent opacity-95" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary-foreground)/0.08),transparent_60%)]" />
              <div className="relative px-8 py-8 text-primary-foreground">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-foreground/15 flex items-center justify-center backdrop-blur-sm">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight">Teamworks UEH</h2>
                        <p className="text-primary-foreground/80 text-sm">Effective Team Task Management System</p>
                      </div>
                    </div>
                    <p className="text-primary-foreground/70 text-sm max-w-xl mt-3 leading-relaxed">
                      Nền tảng quản lý công việc nhóm toàn diện dành cho sinh viên UEH — từ phân công task, theo dõi tiến độ
                      đến chấm điểm tự động và đánh giá minh bạch.
                    </p>
                  </div>
                  <button
                    onClick={closeIntro}
                    className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors flex items-center justify-center flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Intro Body */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Tính năng nổi bật
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  {introSections.map((section, i) => (
                    <div
                      key={i}
                      className={`group rounded-xl bg-gradient-to-br ${section.color} border border-border/50 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
                      style={{
                        animation: introVisible ? `fade-in 0.4s ease-out ${i * 80}ms both` : 'none',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-background/80 shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <section.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <h4 className="font-semibold text-foreground">{section.title}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{section.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-4 border-t border-border/50">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <img src={uehLogo} alt="UEH" className="h-6 w-auto opacity-60" />
                    <span>Đồ án sinh viên • Phi thương mại • Mục đích học tập</span>
                  </div>
                  <Link to="/auth" onClick={closeIntro}>
                    <Button size="lg" className="font-semibold px-8 shadow-lg hover:shadow-xl transition-shadow">
                      Bắt đầu sử dụng
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}