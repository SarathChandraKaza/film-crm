import { useStore, ContactCampaignState, Contact, PromotionContact } from '../store';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { TagChip, ActionIcons } from '../components/SharedUI';
import { ChevronRight, Check, X as XIcon, Settings2, Share } from 'lucide-react';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';

export default function CampaignWork() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const store = useStore();
  const campaign = store.campaigns.find(c => c.id === id);

  if (!campaign) {
    return <div className="p-8 text-white">Campaign not found</div>;
  }

  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sorting logic for Main Contacts: priority by relationship
  const relationshipPriority = ['Mentor', 'Senior', 'Bridge', 'Peer', 'Friend', 'Junior', 'Faculty'];
  
  const sortedAudience = useMemo(() => {
    // 1. Gather all audience items
    const main = campaign.audienceContactIds.map(cid => ({ type: 'main' as const, id: cid, data: store.contacts.find(x => x.id === cid) }));
    const promo = campaign.audiencePromotionContactIds.map(cid => ({ type: 'promo' as const, id: cid, data: store.promotionContacts.find(x => x.id === cid) }));
    const manual = campaign.manualEntries.map(m => ({ type: 'manual' as const, id: m.id, data: m }));

    const validMain = main.filter(x => x.data);
    const validPromo = promo.filter(x => x.data);
    
    // Sort main by relationship priority
    validMain.sort((a, b) => {
      const aRels = a.data?.relationshipTagIds.map(rid => store.relationshipTags.find(t => t.id === rid)?.label) || [];
      const bRels = b.data?.relationshipTagIds.map(rid => store.relationshipTags.find(t => t.id === rid)?.label) || [];
      
      const getPriority = (rels: (string|undefined)[]) => {
        for (const p of relationshipPriority) {
          if (rels.includes(p)) return relationshipPriority.indexOf(p);
        }
        return 99;
      };
      
      return getPriority(aRels) - getPriority(bRels);
    });

    return [...validMain, ...validPromo, ...manual];
  }, [campaign, store.contacts, store.promotionContacts, store.relationshipTags]);

  const total = sortedAudience.length;
  const states = campaign.contactStates;
  const completed = Object.values(states).filter(s => s.status === 'completed').length;
  const skipped = Object.values(states).filter(s => s.status === 'skipped').length;
  const percent = total > 0 ? Math.round(((completed + skipped) / total) * 100) : 0;

  // Auto-scroll to first pending
  const firstPendingRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (firstPendingRef.current) {
      firstPendingRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleUpdateState = (contactId: string, updates: Partial<ContactCampaignState>) => {
    const newState = { ...states[contactId], ...updates };
    store.updateCampaign(campaign.id, {
      contactStates: { ...states, [contactId]: newState },
      lastWorkedAt: new Date().toISOString()
    });

    if (updates.status === 'completed' || updates.status === 'skipped') {
      // Add to contact history if main contact
      if (store.contacts.some(c => c.id === contactId)) {
        store.addHistoryEntry(contactId, `${updates.status === 'completed' ? 'Shared' : 'Skipped'} — ${campaign.title}`);
      }
      setExpandedId(null);
    }
  };

  const generateMessage = (name: string, state: ContactCampaignState) => {
    const header = state.useOverride && state.overrideHeader !== undefined ? state.overrideHeader : campaign.message.header;
    const footer = state.useOverride && state.overrideFooter !== undefined ? state.overrideFooter : campaign.message.footer;
    const body = campaign.message.body;
    
    return [
      header.replace(/{name}/g, name.split(' ')[0]),
      '',
      body,
      '',
      footer
    ].filter(x => x !== undefined).join('\n');
  };

  const handleCopy = (name: string, state: ContactCampaignState) => {
    const msg = generateMessage(name, state);
    navigator.clipboard.writeText(msg);
  };

  const handleCompleteCampaign = () => {
    store.updateCampaign(campaign.id, { status: 'completed' });
    setLocation('/campaigns');
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-16 md:top-0 z-30 bg-background/95 backdrop-blur py-4 border-b border-border mb-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{campaign.title}</h2>
            <p className="text-muted-foreground text-sm">Campaign Execution</p>
          </div>
          <Button variant="secondary" onClick={handleCompleteCampaign}>Finish Campaign</Button>
        </div>
        
        <div className="bg-card border border-card-border p-3 rounded-lg flex items-center gap-4">
          <div className="flex-1 w-full flex h-3 rounded-full overflow-hidden bg-secondary">
            {total > 0 && (
              <>
                <div className="bg-primary h-full transition-all" style={{ width: `${(completed / total) * 100}%` }} />
                <div className="bg-muted-foreground h-full transition-all" style={{ width: `${(skipped / total) * 100}%` }} />
              </>
            )}
          </div>
          <div className="text-sm font-medium whitespace-nowrap text-white">
            {completed + skipped} / {total} ({percent}%)
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sortedAudience.map((item, index) => {
          const state = states[item.id] || { status: 'pending', useOverride: false };
          const isPending = state.status === 'pending';
          const isFirstPending = isPending && sortedAudience.findIndex(x => states[x.id]?.status === 'pending') === index;
          
          const name = item.data?.name || 'Unknown';
          const mobile = item.type !== 'promo' ? (item.data as Contact | undefined)?.mobile : undefined;
          const whatsapp = item.type !== 'promo' ? (item.data as Contact | undefined)?.whatsapp : undefined;
          const email = item.type !== 'promo' ? (item.data as Contact | undefined)?.email : (item.data as PromotionContact | undefined)?.platformLinks?.email;
          const instagram = item.type === 'promo' ? (item.data as PromotionContact | undefined)?.platformLinks?.instagram : (item.data as Contact | undefined)?.instagram;

          return (
            <div 
              key={item.id} 
              ref={isFirstPending ? firstPendingRef : null}
              className={`bg-card border rounded-xl overflow-hidden transition-all duration-300 ${
                isPending ? 'border-card-border shadow-md' : 'border-border/50 opacity-60'
              } ${isFirstPending ? 'ring-1 ring-primary/50' : ''}`}
            >
              <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold text-lg ${isPending ? 'text-white' : 'text-muted-foreground line-through'}`}>{name}</h3>
                    {state.status === 'completed' && <Check size={16} className="text-primary" />}
                    {state.status === 'skipped' && <XIcon size={16} className="text-muted-foreground" />}
                  </div>
                  
                  {item.type === 'main' && item.data && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(item.data as Contact).relationshipTagIds.map((tid: string) => {
                        const t = store.relationshipTags.find(x => x.id === tid);
                        return t ? <TagChip key={tid} label={t.label} type="relationship" /> : null;
                      })}
                      {(item.data as Contact).designationTagIds.map((tid: string) => {
                        const t = store.designationTags.find(x => x.id === tid);
                        return t ? <TagChip key={tid} label={t.label} type="designation" /> : null;
                      })}
                    </div>
                  )}
                  {item.type === 'promo' && item.data && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-sm border border-accent/30 font-medium tracking-wide uppercase">Promo</span>
                      {(item.data as PromotionContact).categoryIds.map((cat: string) => (
                        <TagChip key={cat} label={cat} type="category" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                  <ActionIcons 
                    mobile={mobile} whatsapp={whatsapp} email={email} instagram={instagram}
                    onCopyClick={() => handleCopy(name, state)}
                  />
                  
                  {isPending ? (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button variant="outline" size="sm" onClick={() => handleUpdateState(item.id, { status: 'skipped' })} className="flex-1 sm:flex-none">Skip</Button>
                      <Button size="sm" onClick={() => handleUpdateState(item.id, { status: 'completed' })} className="flex-1 sm:flex-none">Mark Done</Button>
                      <Button variant="ghost" size="icon" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                        <Settings2 size={18} className={expandedId === item.id ? 'text-primary' : 'text-muted-foreground'} />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => handleUpdateState(item.id, { status: 'pending' })}>Undo</Button>
                  )}
                </div>
              </div>

              {expandedId === item.id && isPending && (
                <div className="px-4 pb-4 pt-2 bg-secondary/30 border-t border-border mt-2 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-4 mb-4">
                    <Button 
                      variant={state.useOverride ? 'default' : 'secondary'} 
                      size="sm"
                      onClick={() => handleUpdateState(item.id, { useOverride: !state.useOverride })}
                    >
                      {state.useOverride ? 'Using Custom Text' : 'Customize Message for this contact'}
                    </Button>
                  </div>

                  {state.useOverride && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground uppercase mb-1 block">Override Header</label>
                        <Textarea 
                          value={state.overrideHeader !== undefined ? state.overrideHeader : campaign.message.header}
                          onChange={e => handleUpdateState(item.id, { overrideHeader: e.target.value })}
                          className="font-mono text-sm bg-background border-border min-h-[60px]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground uppercase mb-1 block">Override Footer</label>
                        <Textarea 
                          value={state.overrideFooter !== undefined ? state.overrideFooter : campaign.message.footer}
                          onChange={e => handleUpdateState(item.id, { overrideFooter: e.target.value })}
                          className="font-mono text-sm bg-background border-border min-h-[60px]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-background rounded border border-border whitespace-pre-wrap font-mono text-sm text-muted-foreground">
                    {generateMessage(name, state)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
