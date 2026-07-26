import { useStore } from '../store';
import { TagChip } from '../components/SharedUI';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Plus, Users, Target, CheckCircle2, PlayCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function Home() {
  const contacts = useStore(state => state.contacts);
  const promoContacts = useStore(state => state.promotionContacts);
  const campaigns = useStore(state => state.campaigns);
  const customLists = useStore(state => state.customLists);

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const completedCampaignsCount = campaigns.filter(c => c.status === 'completed').length;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Command Center</h2>
        <p className="text-muted-foreground">Welcome back. Here's your production status.</p>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/contacts/new">
          <div className="bg-card hover:bg-card/80 border border-card-border p-4 rounded-xl cursor-pointer transition-colors flex flex-col items-center justify-center text-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
            <span className="font-medium text-sm">Add Contact</span>
          </div>
        </Link>
        <Link href="/contacts/new-promo">
          <div className="bg-card hover:bg-card/80 border border-card-border p-4 rounded-xl cursor-pointer transition-colors flex flex-col items-center justify-center text-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={20} />
            </div>
            <span className="font-medium text-sm">Add Promo</span>
          </div>
        </Link>
        <Link href="/campaigns/new">
          <div className="bg-card hover:bg-card/80 border border-card-border p-4 rounded-xl cursor-pointer transition-colors flex flex-col items-center justify-center text-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target size={20} />
            </div>
            <span className="font-medium text-sm">New Campaign</span>
          </div>
        </Link>
        <Link href="/lists">
          <div className="bg-card hover:bg-card/80 border border-card-border p-4 rounded-xl cursor-pointer transition-colors flex flex-col items-center justify-center text-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={20} />
            </div>
            <span className="font-medium text-sm">New List</span>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-card-border p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">Total Network</p>
            <p className="text-3xl font-bold text-white">{contacts.length + promoContacts.length}</p>
          </div>
          <Users size={32} className="text-muted-foreground/30" />
        </div>
        <div className="bg-card border border-card-border p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">Active Campaigns</p>
            <p className="text-3xl font-bold text-primary">{activeCampaigns.length}</p>
          </div>
          <PlayCircle size={32} className="text-primary/30" />
        </div>
        <div className="bg-card border border-card-border p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">Completed Campaigns</p>
            <p className="text-3xl font-bold text-white">{completedCampaignsCount}</p>
          </div>
          <CheckCircle2 size={32} className="text-muted-foreground/30" />
        </div>
      </div>

      {/* Active Campaigns Resume */}
      {activeCampaigns.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock size={18} className="text-primary" /> Continue Working
          </h3>
          <div className="grid gap-3">
            {activeCampaigns.map(camp => {
              const total = camp.audienceContactIds.length + camp.audiencePromotionContactIds.length + camp.manualEntries.length;
              const completed = Object.values(camp.contactStates).filter(s => s.status !== 'pending').length;
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
              
              return (
                <div key={camp.id} className="bg-card border border-card-border p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-lg mb-1">{camp.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{percent}% complete</span>
                      <span>•</span>
                      <span>{completed} of {total} contacts</span>
                      {camp.lastWorkedAt && (
                        <>
                          <span>•</span>
                          <span>Last worked: {format(new Date(camp.lastWorkedAt), 'MMM d, h:mm a')}</span>
                        </>
                      )}
                    </div>
                    <div className="w-full bg-secondary h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                  <Link href={`/campaigns/${camp.id}`}>
                    <Button className="w-full md:w-auto">Resume</Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
