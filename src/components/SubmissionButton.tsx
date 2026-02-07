import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ExternalLink, 
  ChevronDown, 
  Eye, 
  File, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  Image as ImageIcon 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import FilePreviewPopup from '@/components/FilePreviewPopup';

interface SubmissionItem {
  title?: string;
  url?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  storage_name?: string; // Safe UUID-based storage name
  type?: 'link' | 'file';
}

interface SubmissionButtonProps {
  submissionLink: string | null;
  variant?: 'default' | 'compact';
  onStopPropagation?: boolean;
  taskId?: string;
  groupId?: string;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return <FileText className="w-3 h-3 text-red-500" />;
    case 'doc':
    case 'docx':
      return <FileText className="w-3 h-3 text-blue-500" />;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return <FileSpreadsheet className="w-3 h-3 text-green-500" />;
    case 'ppt':
    case 'pptx':
      return <Presentation className="w-3 h-3 text-orange-500" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return <ImageIcon className="w-3 h-3 text-purple-500" />;
    default:
      return <File className="w-3 h-3 text-muted-foreground" />;
  }
};

export function parseSubmissionLinks(submissionLink: string | null): SubmissionItem[] {
  if (!submissionLink) return [];
  
  try {
    const parsed = JSON.parse(submissionLink);
    if (Array.isArray(parsed)) {
      return parsed.map(item => ({
        ...item,
        type: item.file_path ? 'file' : 'link'
      }));
    }
    return [{ title: 'Bài nộp', url: submissionLink, type: 'link' }];
  } catch {
    return [{ title: 'Bài nộp', url: submissionLink, type: 'link' }];
  }
}

export default function SubmissionButton({ 
  submissionLink, 
  variant = 'default',
  onStopPropagation = true,
  taskId,
  groupId
}: SubmissionButtonProps) {
  // File preview popup state
  const [previewFile, setPreviewFile] = useState<{
    filePath: string;
    fileName: string;
    fileSize: number;
  } | null>(null);

  const items = parseSubmissionLinks(submissionLink);

  const getFilePublicUrl = (filePath: string) => {
    const { data } = supabase.storage.from('task-submissions').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleOpenItem = (item: SubmissionItem, e?: React.MouseEvent) => {
    if (onStopPropagation && e) {
      e.stopPropagation();
    }
    
    if (item.type === 'file' && item.file_path) {
      // Open in preview popup instead of navigating
      setPreviewFile({
        filePath: item.file_path,
        fileName: item.file_name || 'file',
        fileSize: item.file_size || 0
      });
    } else if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  // File Preview Popup component
  const previewPopup = (
    <FilePreviewPopup
      isOpen={!!previewFile}
      onClose={() => setPreviewFile(null)}
      fileUrl={previewFile ? getFilePublicUrl(previewFile.filePath) : null}
      fileName={previewFile?.fileName || ''}
      fileSize={previewFile?.fileSize}
      filePath={previewFile?.filePath}
      taskId={taskId}
      groupId={groupId}
      source="submission"
    />
  );
  
  if (!submissionLink || items.length === 0) {
    return variant === 'compact' ? (
      <span className="inline-flex h-7 w-[104px] items-center justify-center text-[10px] text-muted-foreground whitespace-nowrap">—</span>
    ) : null;
  }

  if (items.length === 1) {
    const item = items[0];
    const isFile = item.type === 'file';
    
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className={`h-7 text-xs px-2 gap-1 text-primary whitespace-nowrap ${
            variant === 'compact' ? 'w-[104px] justify-center' : ''
          }`}
          onClick={(e) => handleOpenItem(item, e)}
        >
          {isFile ? (
            <>
              <Eye className="w-3 h-3" />
              {variant === 'compact' ? 'File' : 'Xem file'}
            </>
          ) : (
            <>
              <ExternalLink className="w-3 h-3" />
              {variant === 'compact' ? 'Xem' : 'Xem bài nộp'}
            </>
          )}
        </Button>
        {previewPopup}
      </>
    );
  }

  // Multiple items
  const hasFiles = items.some(i => i.type === 'file');
  const hasLinks = items.some(i => i.type === 'link');
  const filesCount = items.filter(i => i.type === 'file').length;
  const linksCount = items.filter(i => i.type === 'link').length;
  
  let label = `Xem (${items.length})`;
  if (hasFiles && hasLinks) {
    label = `${filesCount}F+${linksCount}L`;
  } else if (hasFiles) {
    label = `${filesCount} file`;
  } else {
    label = `${linksCount} link`;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`h-7 text-xs px-2 gap-1 text-primary whitespace-nowrap overflow-hidden ${
              variant === 'compact' ? 'w-[104px] justify-center' : ''
            }`}
            onClick={(e) => onStopPropagation && e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3 shrink-0" />
            <span className={variant === 'compact' ? 'truncate max-w-[56px]' : ''}>
              {variant === 'compact' ? label : `Xem bài (${items.length})`}
            </span>
            <ChevronDown className="w-3 h-3 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-50 bg-popover min-w-[200px]">
          {items.map((item, i) => {
            const isFile = item.type === 'file';
            return (
              <DropdownMenuItem 
                key={i}
                onClick={(e) => handleOpenItem(item, e)}
                className="text-xs cursor-pointer"
              >
                {isFile ? (
                  <>
                    {getFileIcon(item.file_name || 'file')}
                    <span className="ml-2 truncate">{item.title || item.file_name || 'File'}</span>
                    <Eye className="w-3 h-3 ml-auto opacity-50" />
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3 h-3 mr-2" />
                    <span className="truncate">{item.title || `Link ${i + 1}`}</span>
                  </>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      {previewPopup}
    </>
  );
}
