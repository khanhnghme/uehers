import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilePreviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
  fileName: string;
  fileSize?: number;
  onOpenExternal?: () => void;
  onDownload?: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileType(fileName: string): 'image' | 'pdf' | 'video' | 'audio' | 'office' | 'other' {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'ogg'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'].includes(ext)) return 'audio';
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'].includes(ext)) return 'office';
  
  return 'other';
}

function getFileIcon(type: string) {
  switch (type) {
    case 'image': return <ImageIcon className="w-16 h-16 text-purple-500" />;
    case 'pdf': return <FileText className="w-16 h-16 text-red-500" />;
    case 'video': return <Video className="w-16 h-16 text-pink-500" />;
    case 'audio': return <Music className="w-16 h-16 text-cyan-500" />;
    default: return <File className="w-16 h-16 text-muted-foreground" />;
  }
}

export default function FilePreviewPopup({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  fileSize,
  onOpenExternal,
  onDownload,
}: FilePreviewPopupProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  const fileType = getFileType(fileName);

  // Reset states when file changes or popup opens
  useEffect(() => {
    if (isOpen && fileUrl) {
      setIsLoading(true);
      setHasError(false);
      setImageZoom(1);
      setImageRotation(0);
    }
  }, [isOpen, fileUrl]);

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

  const handleOpenExternal = () => {
    if (onOpenExternal) {
      onOpenExternal();
    } else if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

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
          <Button variant="outline" onClick={handleOpenExternal}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Thử mở trong tab mới
          </Button>
        </div>
      );
    }

    switch (fileType) {
      case 'image':
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

      case 'pdf':
        return (
          <div className="relative h-full">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=0`}
              className="w-full h-full border-0 rounded-lg"
              onLoad={handleIframeLoad}
              onError={() => setHasError(true)}
              title={fileName}
            />
          </div>
        );

      case 'video':
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

      case 'audio':
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

      case 'office':
        // Use Google Docs Viewer for Office files
        const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
        return (
          <div className="relative h-full">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Đang tải trình xem...</p>
                </div>
              </div>
            )}
            <iframe
              src={googleViewerUrl}
              className="w-full h-full border-0 rounded-lg"
              onLoad={handleIframeLoad}
              title={fileName}
            />
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            {getFileIcon(fileType)}
            <div className="text-center">
              <p className="font-medium">{fileName}</p>
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
              <Button onClick={handleOpenExternal}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Mở trong tab mới
              </Button>
            </div>
          </div>
        );
    }
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
            {fileUrl && fileType !== 'other' && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload} title="Tải về">
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenExternal} title="Mở trong tab mới">
              <ExternalLink className="w-4 h-4" />
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
