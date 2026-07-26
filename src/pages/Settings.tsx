import { useStore } from '../store';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TagChip } from '../components/SharedUI';
import { Save, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const store = useStore();
  const { toast } = useToast();

  const [newDes, setNewDes] = useState('');
  const [newRel, setNewRel] = useState('');
  const [newCat, setNewCat] = useState('');

  const handleExport = () => {
    const dataStr = localStorage.getItem('film_crm_data');
    if (!dataStr) return;
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `film-crm-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Data exported successfully' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.state) {
          store.importData(json.state);
          toast({ title: 'Data imported successfully' });
        } else {
          toast({ title: 'Invalid backup file format', variant: 'destructive' });
        }
      } catch {
        toast({ title: 'Error reading file', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-10">
      <header>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Settings</h2>
        <p className="text-muted-foreground">Manage your tags and data backups.</p>
      </header>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-border pb-2">Designation Tags</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {store.designationTags.map(tag => (
            <TagChip key={tag.id} label={tag.label} type="designation" onRemove={() => store.deleteDesignationTag(tag.id)} />
          ))}
        </div>
        <div className="flex gap-2 max-w-sm">
          <Input value={newDes} onChange={e => setNewDes(e.target.value)} placeholder="New designation..." className="bg-card" />
          <Button onClick={() => { if(newDes) { store.addDesignationTag(newDes); setNewDes(''); } }}>Add</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-border pb-2">Relationship Tags</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {store.relationshipTags.map(tag => (
            <TagChip key={tag.id} label={tag.label} type="relationship" onRemove={() => store.deleteRelationshipTag(tag.id)} />
          ))}
        </div>
        <div className="flex gap-2 max-w-sm">
          <Input value={newRel} onChange={e => setNewRel(e.target.value)} placeholder="New relationship..." className="bg-card" />
          <Button onClick={() => { if(newRel) { store.addRelationshipTag(newRel); setNewRel(''); } }}>Add</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-border pb-2">Promotion Categories</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {store.promotionCategories.map(cat => (
            <TagChip key={cat} label={cat} type="category" onRemove={() => store.deletePromotionCategory(cat)} />
          ))}
        </div>
        <div className="flex gap-2 max-w-sm">
          <Input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="New category..." className="bg-card" />
          <Button onClick={() => { if(newCat) { store.addPromotionCategory(newCat); setNewCat(''); } }}>Add</Button>
        </div>
      </section>

      <section className="space-y-4 pt-8 border-t border-border">
        <h3 className="text-lg font-semibold text-white">Data Management</h3>
        <p className="text-sm text-muted-foreground mb-4">All your data is stored locally on this device. Export a backup regularly.</p>
        
        <div className="flex gap-4">
          <Button onClick={handleExport} className="gap-2">
            <Download size={16} /> Download JSON Backup
          </Button>
          
          <div className="relative">
            <Input type="file" accept=".json" onChange={handleImport} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
            <Button variant="secondary" className="gap-2 pointer-events-none">
              <Upload size={16} /> Restore Backup
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
