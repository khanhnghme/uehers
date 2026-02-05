import { LayoutDashboard, Layers, Users, Activity, Settings, Award, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProjectNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isLeaderInGroup: boolean;
  isGroupCreator: boolean;
  membersCount: number;
}

interface NavTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  showAlways?: boolean;
  description: string;
}

const tabs: NavTab[] = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard, showAlways: true, description: 'Xem tổng quan dự án' },
  { id: 'tasks', label: 'Task', icon: Layers, showAlways: true, description: 'Quản lý công việc' },
  { id: 'resources', label: 'Tài nguyên', icon: FolderOpen, showAlways: true, description: 'File & tài liệu' },
  { id: 'members', label: 'Thành viên', icon: Users, showAlways: true, description: 'Danh sách thành viên' },
  { id: 'scores', label: 'Điểm', icon: Award, showAlways: true, description: 'Điểm số & đánh giá' },
  { id: 'logs', label: 'Nhật ký', icon: Activity, showAlways: true, description: 'Lịch sử hoạt động' },
  { id: 'settings', label: 'Cài đặt', icon: Settings, showAlways: false, description: 'Cấu hình dự án' },
];

export default function ProjectNavigation({
  activeTab,
  onTabChange,
  isLeaderInGroup,
  isGroupCreator,
  membersCount,
}: ProjectNavigationProps) {
  const showSettings = isLeaderInGroup && isGroupCreator;
  const visibleTabs = tabs.filter(tab => 
    tab.showAlways || (tab.id === 'settings' && showSettings)
  );

  return (
    <div className="w-full border-b border-border/40 sticky top-16 z-40 bg-background/95 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-6">
        {/* Navigation tabs - use same layout structure as header */}
        <nav className="flex items-center py-2">
          {/* Left spacer - matches header logo width */}
          <div className="w-[160px] shrink-0 hidden md:block" />
          
          {/* Center: tabs */}
          <div className="flex-1 flex items-center justify-center overflow-x-auto scrollbar-hide">
            <div className="inline-flex items-center bg-muted/50 rounded-lg p-1">
              <TooltipProvider delayDuration={300}>
                {/* Main tabs group */}
                <div className="flex items-center gap-1">
                  {visibleTabs.filter(t => t.id !== 'settings').map((tab) => (
                    <NavTabButton
                      key={tab.id}
                      tab={tab}
                      isActive={activeTab === tab.id}
                      onClick={() => onTabChange(tab.id)}
                      membersCount={tab.id === 'members' ? membersCount : undefined}
                    />
                  ))}
                </div>
                
                {/* Settings tab - separated with divider for leaders */}
                {showSettings && (
                  <>
                    <div className="w-px h-6 bg-border/50 mx-1.5" />
                    <NavTabButton
                      tab={tabs.find(t => t.id === 'settings')!}
                      isActive={activeTab === 'settings'}
                      onClick={() => onTabChange('settings')}
                      isSettings
                    />
                  </>
                )}
              </TooltipProvider>
            </div>
          </div>
          
          {/* Right spacer - matches header user area width */}
          <div className="w-[160px] shrink-0 hidden md:block" />
        </nav>
      </div>
    </div>
  );
}

interface NavTabButtonProps {
  tab: NavTab;
  isActive: boolean;
  onClick: () => void;
  membersCount?: number;
  isSettings?: boolean;
}

function NavTabButton({ tab, isActive, onClick, membersCount, isSettings }: NavTabButtonProps) {
  const Icon = tab.icon;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            "whitespace-nowrap",
            isActive 
              ? "bg-background shadow-sm text-foreground" 
              : "text-muted-foreground hover:text-foreground hover:bg-background/50",
            isSettings && !isActive && "text-muted-foreground/70"
          )}
        >
          <Icon className={cn(
            "w-4 h-4 shrink-0",
            isActive && "text-primary",
            isSettings && isActive && "text-amber-500"
          )} />
          
          {/* Label - hide on very small screens, show icon only */}
          <span className="hidden xs:inline sm:inline">{tab.label}</span>
          
          {/* Member count badge */}
          {membersCount !== undefined && (
            <span className={cn(
              "px-1.5 py-0.5 text-xs font-medium rounded",
              isActive 
                ? "bg-primary/15 text-primary" 
                : "bg-muted-foreground/20 text-muted-foreground"
            )}>
              {membersCount}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        <p className="font-medium text-sm">{tab.label}</p>
        <p className="text-xs text-muted-foreground">{tab.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}