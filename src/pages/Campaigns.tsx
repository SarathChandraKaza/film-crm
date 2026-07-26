import { useStore } from '../store';
import { TagChip, ActionIcons } from '../components/SharedUI';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Target, CheckCircle2, PlayCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function Campaigns() {
  const campaigns = useStore(state => state.campaigns);
  const [, setLocation] = useLocation();

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-white">Campaigns</h2>
        <Link href="/campaigns/new">
          <Button>
            <Plus size={16} className="mr-2" /> New Campaign
          </Button>
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center p-12 bg-card/50 rounded-lg border border-dashed border-card-border">
          <Target size={48} className="mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground mb-4">No campaigns yet. Run your first outreach sprint.</p>
          <Link href="/campaigns/new">
            <Button variant="secondary">Start Campaign</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map(camp => {
            const total = camp.audienceContactIds.length + camp.audiencePromotionContactIds.length + camp.manualEntries.length;
            const states = Object.values(camp.contactStates);
            const completed = states.filter(s => s.status === 'completed').length;
            const skipped = states.filter(s => s.status === 'skipped').length;
            const remaining = total - completed - skipped;
            
            const percent = total > 0 ? Math.round(((completed + skipped) / total) * 100) : 0;
            
            return (
              <div 
                key={camp.id} 
                className="bg-card border border-card-border p-5 rounded-xl hover:border-primary/50 transition-colors group cursor-pointer"
                onClick={() => setLocation(`/campaigns/${camp.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{camp.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-sm ${camp.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                        {camp.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created: {format(new Date(camp.createdAt), 'MMM d, yyyy')}
                      {camp.lastWorkedAt && ` • Last worked: ${format(new Date(camp.lastWorkedAt), 'MMM d, h:mm a')}`}
                    </p>
                  </div>
                  {camp.status === 'active' && (
                    <Button variant="secondary" className="w-full md:w-auto" onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/campaigns/${camp.id}`);
                    }}>
                      Resume
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span className="text-white font-medium">{completed + skipped} of {total} done</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full flex h-2 rounded-full overflow-hidden bg-secondary">
                    {total > 0 && (
                      <>
                        <div className="bg-primary h-full transition-all" style={{ width: `${(completed / total) * 100}%` }} title="Completed" />
                        <div className="bg-muted-foreground h-full transition-all" style={{ width: `${(skipped / total) * 100}%` }} title="Skipped" />
                      </>
                    )}
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> {completed} Completed</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground" /> {skipped} Skipped</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary" /> {remaining} Remaining</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
