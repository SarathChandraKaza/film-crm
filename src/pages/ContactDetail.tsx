import { useStore } from '../store';
import { useParams, Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Edit2, Trash2, Calendar, MapPin, Building, Star, Clock } from 'lucide-react';
import { TagChip, ActionIcons } from '../components/SharedUI';
import { format } from 'date-fns';

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const store = useStore();
  
  const contact = store.contacts.find(c => c.id === id);

  if (!contact) {
    return <div className="p-8 text-white">Contact not found</div>;
  }

  const handleDelete = () => {
    if (confirm('Delete this contact permanently?')) {
      store.deleteContact(contact.id);
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
          <Link href={`/contacts/${contact.id}/edit`}>
            <Button variant="secondary" size="sm" className="gap-2"><Edit2 size={14} /> Edit</Button>
          </Link>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">{contact.name}</h1>
          
          <div className="flex flex-wrap gap-6 mb-8 text-muted-foreground text-sm">
            {contact.organization && (
              <div className="flex items-center gap-2"><Building size={16} className="text-primary" /> {contact.organization}</div>
            )}
            {contact.place && (
              <div className="flex items-center gap-2"><MapPin size={16} className="text-accent" /> {contact.place}</div>
            )}
            <div className="flex items-center gap-2"><Calendar size={16} /> Added {format(new Date(contact.createdAt), 'MMM yyyy')}</div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {contact.relationshipTagIds.map(tid => {
              const t = store.relationshipTags.find(x => x.id === tid);
              return t ? <TagChip key={tid} label={t.label} type="relationship" /> : null;
            })}
            {contact.designationTagIds.map(tid => {
              const t = store.designationTags.find(x => x.id === tid);
              return t ? <TagChip key={tid} label={t.label} type="designation" /> : null;
            })}
          </div>

          <div className="bg-background/50 inline-flex p-2 rounded-full border border-border">
            <ActionIcons mobile={contact.mobile} whatsapp={contact.whatsapp} email={contact.email} instagram={contact.instagram} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-card-border p-6 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Star size={18} className="text-primary" /> Notes & Context</h3>
            <div className="prose prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
              {contact.notes || <span className="italic opacity-50">No notes added.</span>}
            </div>
            
            {contact.favouriteProjects && (
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="text-sm font-bold text-white mb-2">Projects / Work</h4>
                <p className="text-muted-foreground">{contact.favouriteProjects}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-card-border p-6 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Clock size={18} className="text-primary" /> History Log</h3>
            
            {contact.history.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No history yet. Start a campaign with this contact.</p>
            ) : (
              <div className="space-y-4">
                {contact.history.slice().reverse().map(entry => (
                  <div key={entry.id} className="relative pl-4 border-l-2 border-primary/30">
                    <div className="absolute w-2 h-2 rounded-full bg-primary -left-[5px] top-1.5" />
                    <p className="text-sm text-white mb-1">{entry.text}</p>
                    <span className="text-xs text-muted-foreground">{format(new Date(entry.date), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
