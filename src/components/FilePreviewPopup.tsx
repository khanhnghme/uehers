import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  ExternalLink, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music,
  File,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  AlertCircle,
  Maximize2,
  FileSpreadsheet,
  Presentation
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilePreviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
  fileName: string;
  fileSize?: number;
  // For navigation to full preview page
  filePath?: string; // Storage path for task-submissions
  taskId?: string;
  groupId?: string;
  source?: 'resource' | 'submission' | 'note' | 'appeal';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// File type detection - same logic as FilePreview.tsx
const isPreviewableImage = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'].includes(ext || '');
};

const isPDF = (fileName: string) => {
  return fileName.toLowerCase().endsWith('.pdf');
};

const isOfficeDoc = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '');
};

const isTextFile = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'cs', 'php', 'rb', 'go', 'rs', 'sql', 'sh', 'bat', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'log', 'csv'].includes(ext || '');
};

const isVideoFile = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext || '');
};

const isAudioFile = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(ext || '');
};

function getFileIcon(fileName: string, size: 'sm' | 'lg' = 'lg') {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const iconClass = size === 'lg' ? 'w-16 h-16' : 'w-5 h-5';
  
  switch (ext) {
    case 'pdf':
      return <FileText className={cn(iconClass, 'text-red-500')} />;
    case 'doc':
    case 'docx':
      return <FileText className={cn(iconClass, 'text-blue-500')} />;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return <FileSpreadsheet className={cn(iconClass, 'text-green-500')} />;
    case 'ppt':
    case 'pptx':
      return <Presentation className={cn(iconClass, 'text-orange-500')} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return <ImageIcon className={cn(iconClass, 'text-purple-500')} />;
    case 'mp4':
    case 'webm':
    case 'mov':
    case 'avi':
      return <Video className={cn(iconClass, 'text-pink-500')} />;
    case 'mp3':
    case 'wav':
    case 'ogg':
      return <Music className={cn(iconClass, 'text-cyan-500')} />;
    default:
      return <File className={cn(iconClass, 'text-muted-foreground')} />;
  }
}

// Use Microsoft Office Viewer (same as FilePreview.tsx)
const getOfficeViewerUrl = (url: string) => {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
};

export default function FilePreviewPopup({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  fileSize,
  filePath,
  taskId,
  groupId,
  source = 'submission',
}: FilePreviewPopupProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);

  // Reset states when file changes or popup opens
  useEffect(() => {
    if (isOpen && fileUrl) {
      setIsLoading(true);
      setHasError(false);
      setImageZoom(1);
      setImageRotation(0);
      setTextContent(null);
      
      // Load text content if it's a text file
      if (isTextFile(fileName)) {
        setIsLoadingText(true);
        fetch(fileUrl)
          .then(res => res.text())
          .then(text => {
            setTextContent(text);
            setIsLoadingText(false);
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoadingText(false);
            setIsLoading(false);
            setHasError(true);
          });
      }
    }
  }, [isOpen, fileUrl, fileName]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleZoomIn = () => setImageZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setImageZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setImageRotation(prev => (prev + 90) % 360);

  // Open in full page preview (keeping old behavior)
  const handleOpenFullPage = () => {
    onClose();
    
    if (source === 'resource' && fileUrl) {
      const params = new URLSearchParams();
      params.set('url', fileUrl);
      params.set('name', fileName);
      if (fileSize) params.set('size', fileSize.toString());
      params.set('source', 'resource');
      navigate(`/file-preview?${params.toString()}`);
    } else if (filePath) {
      const params = new URLSearchParams();
      params.set('path', filePath);
      params.set('name', fileName);
      if (fileSize) params.set('size', fileSize.toString());
      if (taskId) params.set('taskId', taskId);
      if (groupId) params.set('groupId', groupId);
      navigate(`/file-preview?${params.toString()}`);
    } else if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  // Download file
  const handleDownload = async () => {
    if (!fileUrl) return;

    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      // Fallback: open in new tab
      window.open(fileUrl, '_blank');
    }
  };

  const canPreview = isPreviewableImage(fileName) || isPDF(fileName) || isOfficeDoc(fileName) || isTextFile(fileName) || isVideoFile(fileName) || isAudioFile(fileName);

  const renderPreviewContent = () => {
    if (!fileUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
          <AlertCircle className="w-16 h-16" />
          <p>Không có URL để xem trước</p>
        </div>
      );
    }

    if (hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <AlertCircle className="w-16 h-16 text-destructive" />
          <div className="text-center">
            <p className="font-medium">Không thể tải file</p>
            <p className="text-sm text-muted-foreground mt-1">
              File có thể không tồn tại hoặc bạn không có quyền truy cập
            </p>
          </div>
          <Button variant="outline" onClick={handleOpenFullPage}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Thử mở trong tab mới
          </Button>
        </div>
      );
    }

    // Image preview
    if (isPreviewableImage(fileName)) {
      return (
        <div className="relative h-full flex items-center justify-center overflow-hidden bg-muted/20">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          <img
            src={fileUrl}
            alt={fileName}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className="max-w-full max-h-full object-contain transition-all duration-200"
            style={{
              transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
            }}
          />
          {/* Image controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut} title="Thu nhỏ">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium min-w-[3rem] text-center">{Math.round(imageZoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn} title="Phóng to">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <div className="w-px h-4 bg-border" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRotate} title="Xoay">
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );
    }

    // PDF preview
    if (isPDF(fileName)) {
      return (
        <div className="relative h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
            className="w-full h-full border-0 rounded-lg"
            onLoad={handleIframeLoad}
            onError={() => setHasError(true)}
            title={fileName}
            allow="fullscreen"
          />
        </div>
      );
    }

    // Office document preview (using Microsoft Viewer - same as full page)
    if (isOfficeDoc(fileName)) {
      return (
        <div className="relative h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Đang tải trình xem Office...</p>
              </div>
            </div>
          )}
          <iframe
            src={getOfficeViewerUrl(fileUrl)}
            className="w-full h-full border-0 rounded-lg"
            onLoad={handleIframeLoad}
            title={fileName}
            allow="fullscreen"
          />
        </div>
      );
    }

    // Text file preview
    if (isTextFile(fileName)) {
      return (
        <div className="relative h-full">
          {isLoadingText ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="h-full">
              <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words bg-muted/30 rounded-lg">
                {textContent || 'Không thể đọc nội dung file'}
              </pre>
            </ScrollArea>
          )}
        </div>
      );
    }

    // Video preview
    if (isVideoFile(fileName)) {
      return (
        <div className="relative h-full flex items-center justify-center bg-black rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          <video
            src={fileUrl}
            controls
            className="max-w-full max-h-full"
            onLoadedData={() => setIsLoading(false)}
            onError={() => setHasError(true)}
          >
            Trình duyệt của bạn không hỗ trợ xem video
          </video>
        </div>
      );
    }

    // Audio preview
    if (isAudioFile(fileName)) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center animate-pulse">
            <Music className="w-16 h-16 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium">{fileName}</p>
            {fileSize && <p className="text-sm text-muted-foreground">{formatFileSize(fileSize)}</p>}
          </div>
          <audio
            src={fileUrl}
            controls
            className="w-full max-w-md"
            onLoadedData={() => setIsLoading(false)}
            onError={() => setHasError(true)}
          >
            Trình duyệt của bạn không hỗ trợ nghe audio
          </audio>
        </div>
      );
    }

    // Not previewable
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        {getFileIcon(fileName, 'lg')}
        <div className="text-center">
          <p className="font-medium text-lg">{fileName}</p>
          {fileSize && <p className="text-sm text-muted-foreground">{formatFileSize(fileSize)}</p>}
        </div>
        <p className="text-sm text-muted-foreground">
          Không hỗ trợ xem trước định dạng này
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Tải về
          </Button>
          <Button onClick={handleOpenFullPage}>
            <Maximize2 className="w-4 h-4 mr-2" />
            Mở trang đầy đủ
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-[90vw] max-h-[90vh] w-[90vw] h-[90vh] p-0 gap-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {getFileIcon(fileName, 'sm')}
            <DialogTitle className="truncate text-base font-medium">
              {fileName}
            </DialogTitle>
            {fileSize && fileSize > 0 && (
              <Badge variant="secondary" className="shrink-0">
                {formatFileSize(fileSize)}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1 shrink-0 ml-4">
            {fileUrl && canPreview && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload} title="Tải về">
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenFullPage} title="Mở trang đầy đủ">
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} title="Đóng">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-4">
          {renderPreviewContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
