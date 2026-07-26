import { useStore } from '../store';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { TagChip } from '../components/SharedUI';
import { ChevronRight, Users, MessageSquare, PlayCircle, Loader2 } from 'lucide-react';

export default function CampaignNew() {
  const [location, setLocation] = useLocation();
  const store = useStore();
  
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  
  // Message Draft
  const [message, setMessage] = useState<{ header: string; body: string; footer: string }>(() => {
    try {
      const saved = localStorage.getItem('campaign_draft');
      return saved ? JSON.parse(saved) : { header: 'Hi {name},', body: '', footer: '' };
    } catch {
      return { header: 'Hi {name},', body: '', footer: '' };
    }
  });

  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem('campaign_draft', JSON.stringify(message));
    }, 300);
    return () => clearTimeout(t);
  }, [message]);

  // Audience Selection
  const [selectedRelTags, setSelectedRelTags] = useState<string[]>([]);
  const [selectedDesTags, setSelectedDesTags] = useState<string[]>([]);
  const [selectedPromoCats, setSelectedPromoCats] = useState<string[]>([]);
  const [placeFilter, setPlaceFilter] = useState('');
  const [manualEntries, setManualEntries] = useState<{name: string; id: string; whatsapp: string}[]>([]);

  // Resolve Audience
  const resolvedMainContacts = store.contacts.filter(c => {
    if (selectedRelTags.length > 0 && !selectedRelTags.some(t => c.relationshipTagIds.includes(t))) return false;
    if (selectedDesTags.length > 0 && !selectedDesTags.some(t => c.designationTagIds.includes(t))) return false;
    if (placeFilter && !c.place?.toLowerCase().includes(placeFilter.toLowerCase())) return false;
    return true;
  });

  const resolvedPromoContacts = store.promotionContacts.filter(c => {
    if (selectedPromoCats.length > 0 && !selectedPromoCats.some(cat => c.categoryIds.includes(cat))) return false;
    return true;
  });

  // Not strictly combining yet unless user selects promo criteria.
  // Actually, we should only include promo contacts if promo categories are selected, OR if no filters are selected?
  // Let's say if ANY filters are used, apply strictly. If NO filters are used, grab ALL.
  const isMainFiltered = selectedRelTags.length > 0 || selectedDesTags.length > 0 || placeFilter;
  const isPromoFiltered = selectedPromoCats.length > 0;

  const finalMainIds = (!isMainFiltered && !isPromoFiltered) || isMainFiltered ? resolvedMainContacts.map(c => c.id) : [];
  const finalPromoIds = (!isMainFiltered && !isPromoFiltered) || isPromoFiltered ? resolvedPromoContacts.map(c => c.id) : [];

  const totalAudienceCount = finalMainIds.length + finalPromoIds.length + manualEntries.length;

  const handleCreate = () => {
    const contactStates: Record<string, any> = {};
    finalMainIds.forEach(id => contactStates[id] = { status: 'pending', useOverride: false });
    finalPromoIds.forEach(id => contactStates[id] = { status: 'pending', useOverride: false });
    manualEntries.forEach(m => contactStates[m.id] = { status: 'pending', useOverride: false });

    const id = store.addCampaign({
      title: title || 'Untitled Campaign',
      createdAt: new Date().toISOString(),
      lastWorkedAt: null,
      status: 'active',
      message,
      audienceRules: {
        relationshipTagIds: selectedRelTags,
        designationTagIds: selectedDesTags,
        places: placeFilter ? [placeFilter] : [],
        promotionCategoryIds: selectedPromoCats
      },
      audienceContactIds: finalMainIds,
      audiencePromotionContactIds: finalPromoIds,
      manualEntries: manualEntries.map(m => ({ ...m, id: m.id, whatsapp: m.whatsapp })),
      contactStates,
      lastWorkedIndex: 0
    });
    
    localStorage.removeItem('campaign_draft');
    setLocation(`/campaigns/${id}`);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-white">New Campaign</h2>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`w-8 h-2 rounded-full ${s <= step ? 'bg-primary' : 'bg-secondary'}`} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-2">
            <Label className="text-lg">Campaign Title</Label>
            <Input 
              autoFocus
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. Festival Premiere Announcement" 
              className="text-lg h-12 bg-card"
            />
          </div>
          <Button onClick={() => setStep(2)} className="w-full md:w-auto mt-4" disabled={!title}>
            Next: Write Message <ChevronRight className="ml-2" size={16} />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-card p-4 rounded-xl border border-card-border space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="text-primary" size={20} />
              <h3 className="font-bold text-white text-lg">Message Template</h3>
            </div>
            
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Header (Greeting)</Label>
              <Input 
                value={message.header} 
                onChange={e => setMessage(m => ({...m, header: e.target.value}))}
                className="bg-background border-border font-mono text-sm"
                placeholder="e.g. Hey {name},"
              />
              <p className="text-xs text-muted-foreground mt-1">Use <code className="bg-secondary px-1 rounded text-primary">{'{name}'}</code> to personalize.</p>
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Body</Label>
              <Textarea 
                value={message.body} 
                onChange={e => setMessage(m => ({...m, body: e.target.value}))}
                className="bg-background border-border font-mono text-sm min-h-[150px]"
                placeholder="Write your main message here..."
              />
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Footer (Sign-off)</Label>
              <Input 
                value={message.footer} 
                onChange={e => setMessage(m => ({...m, footer: e.target.value}))}
                className="bg-background border-border font-mono text-sm"
                placeholder="e.g. Best, John"
              />
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)} disabled={!message.body}>
              Next: Select Audience <ChevronRight className="ml-2" size={16} />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-4">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Users className="text-primary" size={20} /> Select Audience Filters
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card p-4 rounded-xl border border-card-border space-y-4">
                <h4 className="font-medium text-white border-b border-border pb-2">Main Contacts</h4>
                
                <div className="space-y-2">
                  <Label>Relationships</Label>
                  <div className="flex flex-wrap gap-2">
                    {store.relationshipTags.map(tag => (
                      <TagChip 
                        key={tag.id} label={tag.label} type="relationship" 
                        selected={selectedRelTags.includes(tag.id)}
                        onClick={() => setSelectedRelTags(prev => prev.includes(tag.id) ? prev.filter(x => x !== tag.id) : [...prev, tag.id])}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Designations</Label>
                  <div className="flex flex-wrap gap-2">
                    {store.designationTags.map(tag => (
                      <TagChip 
                        key={tag.id} label={tag.label} type="designation" 
                        selected={selectedDesTags.includes(tag.id)}
                        onClick={() => setSelectedDesTags(prev => prev.includes(tag.id) ? prev.filter(x => x !== tag.id) : [...prev, tag.id])}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Location / Place</Label>
                  <Input 
                    value={placeFilter} onChange={e => setPlaceFilter(e.target.value)} 
                    placeholder="e.g. Mumbai, LA" className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-card p-4 rounded-xl border border-card-border space-y-4">
                  <h4 className="font-medium text-white border-b border-border pb-2">Promo Contacts</h4>
                  <div className="space-y-2">
                    <Label>Categories</Label>
                    <div className="flex flex-wrap gap-2">
                      {store.promotionCategories.map(cat => (
                        <TagChip 
                          key={cat} label={cat} type="category" 
                          selected={selectedPromoCats.includes(cat)}
                          onClick={() => setSelectedPromoCats(prev => prev.includes(cat) ? prev.filter(x => x !== cat) : [...prev, cat])}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary/10 border border-primary/30 p-6 rounded-xl text-center">
                  <p className="text-3xl font-bold text-primary mb-1">{totalAudienceCount}</p>
                  <p className="text-sm text-primary/80">Contacts matched</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={() => setStep(4)} disabled={totalAudienceCount === 0}>
              Review <ChevronRight className="ml-2" size={16} />
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-card p-6 rounded-xl border border-card-border text-center">
            <PlayCircle size={48} className="mx-auto text-primary mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Ready to launch?</h3>
            <p className="text-muted-foreground mb-6">
              You are about to start <strong className="text-white">{title}</strong> with <strong className="text-white">{totalAudienceCount}</strong> contacts.
            </p>
            
            <div className="max-h-60 overflow-y-auto bg-background p-4 rounded-md border border-border text-left mb-6">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Audience Preview</h4>
              <div className="space-y-2">
                {finalMainIds.slice(0, 10).map(id => {
                  const c = store.contacts.find(x => x.id === id);
                  return c ? <div key={id} className="text-sm">{c.name} <span className="text-muted-foreground">(Main)</span></div> : null;
                })}
                {finalPromoIds.slice(0, 10).map(id => {
                  const c = store.promotionContacts.find(x => x.id === id);
                  return c ? <div key={id} className="text-sm">{c.name} <span className="text-muted-foreground">(Promo)</span></div> : null;
                })}
                {totalAudienceCount > 20 && <div className="text-sm text-primary italic">...and {totalAudienceCount - 20} more</div>}
              </div>
            </div>

            <Button size="lg" className="w-full text-lg h-14" onClick={handleCreate}>
              Create Campaign & Start Working
            </Button>
          </div>
          <div className="flex justify-start">
            <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
          </div>
        </div>
      )}
    </div>
  );
}
