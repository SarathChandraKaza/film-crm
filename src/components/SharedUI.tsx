import React from 'react';
import { Phone, Mail, MessageSquare, Instagram, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export function TagChip({
  label,
  type,
  onRemove,
  selected = false,
  onClick
}: {
  label: string;
  type: 'designation' | 'relationship' | 'category';
  onRemove?: () => void;
  selected?: boolean;
  onClick?: () => void;
}) {
  const getRelationshipColor = (l: string) => {
    switch (l.toLowerCase()) {
      case 'mentor': return 'bg-[#9B59B6]/20 text-[#9B59B6] border-[#9B59B6]/30';
      case 'senior': return 'bg-[#E74C3C]/20 text-[#E74C3C] border-[#E74C3C]/30';
      case 'peer': return 'bg-[#3498DB]/20 text-[#3498DB] border-[#3498DB]/30';
      case 'bridge': return 'bg-[#E67E22]/20 text-[#E67E22] border-[#E67E22]/30';
      case 'junior': return 'bg-[#27AE60]/20 text-[#27AE60] border-[#27AE60]/30';
      case 'friend': return 'bg-[#1ABC9C]/20 text-[#1ABC9C] border-[#1ABC9C]/30';
      case 'faculty': return 'bg-[#F39C12]/20 text-[#F39C12] border-[#F39C12]/30';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border transition-colors';
  const interactiveClasses = (onClick || selected) ? 'cursor-pointer hover:opacity-80' : '';
  const selectedClasses = selected ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : '';
  
  let typeClasses = '';
  if (type === 'relationship') {
    typeClasses = getRelationshipColor(label);
  } else if (type === 'designation') {
    typeClasses = 'bg-secondary text-secondary-foreground border-border border-l-4 border-l-primary/70';
  } else {
    // category
    typeClasses = 'bg-secondary text-secondary-foreground border-border';
  }

  return (
    <span
      className={`${baseClasses} ${typeClasses} ${interactiveClasses} ${selectedClasses}`}
      onClick={onClick}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-1.5 hover:text-white"
        >
          &times;
        </button>
      )}
    </span>
  );
}

export function ActionIcons({
  mobile,
  whatsapp,
  email,
  instagram,
  onCopyClick
}: {
  mobile?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  onCopyClick?: () => void;
}) {
  const { toast } = useToast();

  const handleLinkClick = (e: React.MouseEvent, url?: string) => {
    e.stopPropagation();
    if (!url) return;
    window.open(url, '_blank');
  };

  const getWhatsappUrl = (wa?: string) => {
    if (!wa) return undefined;
    const digits = wa.replace(/\D/g, '');
    if (digits.length <= 10) return `https://wa.me/91${digits}`;
    return `https://wa.me/${digits}`;
  };

  const getInstagramUrl = (handle?: string) => {
    if (!handle) return undefined;
    if (handle.startsWith('http')) return handle;
    return `https://instagram.com/${handle.replace('@', '')}`;
  };

  const iconClasses = (active: boolean) => 
    `w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
      active 
        ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white cursor-pointer' 
        : 'text-muted-foreground/40 cursor-not-allowed'
    }`;

  return (
    <div className="flex items-center gap-2">
      <div 
        className={iconClasses(!!mobile || !!whatsapp)}
        onClick={(e) => (mobile || whatsapp) && handleLinkClick(e, `tel:${mobile || whatsapp}`)}
        title={mobile || whatsapp || 'No phone'}
      >
        <Phone size={14} />
      </div>
      <div 
        className={iconClasses(!!whatsapp)}
        onClick={(e) => whatsapp && handleLinkClick(e, getWhatsappUrl(whatsapp))}
        title={whatsapp || 'No WhatsApp'}
      >
        <MessageSquare size={14} />
      </div>
      <div 
        className={iconClasses(!!email)}
        onClick={(e) => email && handleLinkClick(e, `mailto:${email}`)}
        title={email || 'No email'}
      >
        <Mail size={14} />
      </div>
      <div 
        className={iconClasses(!!instagram)}
        onClick={(e) => instagram && handleLinkClick(e, getInstagramUrl(instagram))}
        title={instagram || 'No Instagram'}
      >
        <Instagram size={14} />
      </div>
      {onCopyClick && (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-secondary text-secondary-foreground hover:bg-primary hover:text-white cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onCopyClick();
            toast({ title: "Copied message to clipboard" });
          }}
          title="Copy message"
        >
          <Copy size={14} />
        </div>
      )}
    </div>
  );
}
