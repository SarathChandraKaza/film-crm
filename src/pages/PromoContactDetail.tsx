import { useStore } from '../store';
import { useParams, Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Edit2, Trash2, Calendar, LayoutGrid } from 'lucide-react';
import { TagChip, ActionIcons } from '../components/SharedUI';
import { format } from 'date-fns';

export default function PromoContactDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const store = useStore();
  
  const contact = store.promotionContacts.find(c => c.id === id);

  if (!contact) {
    return <div className="p-8 text-white">Promo Contact not found</div>;
  }

  const handleDelete = () => {
    if (confirm('Delete this promotion contact permanently?')) {
      store.deletePromotionContact(contact.id);
      setLocation('/contacts');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="text-muted-foreground hover:text-white">
          <ChevronLeft className="mr-1" size={16} /> Back
        </Button>
        <div className="flex gap-2">
          <Link href={`/contacts/promo/${contact.id}/edit`}>
            <Button variant="secondary" size="sm" className="gap-2"><Edit2 size={14} /> Edit</Button>
          </Link>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{contact.name}</h1>
            <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-sm border border-accent/30 font-medium tracking-wide uppercase">Promo</span>
          </div>
          
          <div className="flex flex-wrap gap-6 mb-8 text-muted-foreground text-sm">
            <div className="flex items-center gap-2"><Calendar size={16} /> Added {format(new Date(contact.createdAt), 'MMM yyyy')}</div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {contact.categoryIds.map(cat => (
              <TagChip key={cat} label={cat} type="category" />
            ))}
          </div>

          <div className="bg-background/50 inline-flex p-2 rounded-full border border-border">
            <ActionIcons 
              email={contact.platformLinks.email} 
              instagram={contact.platformLinks.instagram} 
            />
          </div>
        </div>
      </div>

      <div className="bg-card border border-card-border p-6 rounded-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><LayoutGrid size={18} className="text-accent" /> Notes & Context</h3>
        <div className="prose prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
          {contact.notes || <span className="italic opacity-50">No notes added.</span>}
        </div>
        
        {contact.platformLinks.youtube && (
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="text-sm font-bold text-white mb-2">Primary Link</h4>
            <a href={contact.platformLinks.youtube.startsWith('http') ? contact.platformLinks.youtube : `https://${contact.platformLinks.youtube}`} target="_blank" rel="noreferrer" className="text-accent hover:underline break-all">
              {contact.platformLinks.youtube}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
