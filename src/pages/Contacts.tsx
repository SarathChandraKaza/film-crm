import { useStore } from '../store';
import { TagChip, ActionIcons } from '../components/SharedUI';
import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, FilterX } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Contacts() {
  const contacts = useStore(state => state.contacts);
  const promotionContacts = useStore(state => state.promotionContacts);
  const designationTags = useStore(state => state.designationTags);
  const relationshipTags = useStore(state => state.relationshipTags);
  
  const [search, setSearch] = useState('');
  const [selectedDesignations, setSelectedDesignations] = useState<string[]>([]);
  const [selectedRelationships, setSelectedRelationships] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilter = (setFn: any, id: string) => {
    setFn((prev: string[]) => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchesSearch = !search || 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.organization?.toLowerCase().includes(search.toLowerCase()) ||
        c.place?.toLowerCase().includes(search.toLowerCase()) ||
        c.notes?.toLowerCase().includes(search.toLowerCase());
      
      const matchesDes = selectedDesignations.length === 0 || 
        selectedDesignations.some(d => c.designationTagIds.includes(d));
      
      const matchesRel = selectedRelationships.length === 0 || 
        selectedRelationships.some(r => c.relationshipTagIds.includes(r));

      return matchesSearch && matchesDes && matchesRel;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, search, selectedDesignations, selectedRelationships]);

  const filteredPromo = useMemo(() => {
    return promotionContacts.filter(c => {
      return !search || 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.notes.toLowerCase().includes(search.toLowerCase());
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [promotionContacts, search]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-white">Directory</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <Link href="/contacts/new">
            <Button className="flex-1 md:flex-none">
              <Plus size={16} className="mr-2" /> Add Contact
            </Button>
          </Link>
          <Link href="/contacts/new-promo">
            <Button variant="secondary" className="flex-1 md:flex-none">
              <Plus size={16} className="mr-2" /> Add Promo
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search names, organizations, places, notes..." 
            className="pl-9 bg-card border-card-border"
          />
        </div>
        <Button 
          variant={showFilters || selectedDesignations.length > 0 || selectedRelationships.length > 0 ? "secondary" : "ghost"} 
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? <FilterX size={18} /> : <Filter size={18} />}
        </Button>
      </div>

      {showFilters && (
        <div className="p-4 bg-card border border-card-border rounded-lg space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Designations</h4>
            <div className="flex flex-wrap gap-2">
              {designationTags.map(tag => (
                <TagChip 
                  key={tag.id} 
                  label={tag.label} 
                  type="designation" 
                  selected={selectedDesignations.includes(tag.id)}
                  onClick={() => toggleFilter(setSelectedDesignations, tag.id)}
                />
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Relationships</h4>
            <div className="flex flex-wrap gap-2">
              {relationshipTags.map(tag => (
                <TagChip 
                  key={tag.id} 
                  label={tag.label} 
                  type="relationship" 
                  selected={selectedRelationships.includes(tag.id)}
                  onClick={() => toggleFilter(setSelectedRelationships, tag.id)}
                />
              ))}
            </div>
          </div>
          {(selectedDesignations.length > 0 || selectedRelationships.length > 0) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground h-8 px-2"
              onClick={() => { setSelectedDesignations([]); setSelectedRelationships([]); }}
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}

      <Tabs defaultValue="main" className="w-full">
        <TabsList className="w-full md:w-auto bg-card">
          <TabsTrigger value="main" className="flex-1 md:flex-none">Main Contacts ({filteredContacts.length})</TabsTrigger>
          <TabsTrigger value="promo" className="flex-1 md:flex-none">Promo Contacts ({filteredPromo.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="main" className="space-y-4 mt-4">
          {filteredContacts.length === 0 ? (
            <div className="text-center p-12 bg-card/50 rounded-lg border border-dashed border-card-border">
              <p className="text-muted-foreground">No contacts found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map(c => (
                <Link key={c.id} href={`/contacts/${c.id}`}>
                  <div className="p-4 bg-card rounded-lg border border-card-border hover:border-primary/50 transition-colors cursor-pointer group flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{c.name}</h3>
                        {c.place && <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{c.place}</span>}
                      </div>
                      {(c.organization || c.favouriteProjects) && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {c.organization} {c.organization && c.favouriteProjects ? '•' : ''} {c.favouriteProjects}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {c.relationshipTagIds.map(id => {
                          const t = relationshipTags.find(x => x.id === id);
                          return t ? <TagChip key={id} label={t.label} type="relationship" /> : null;
                        })}
                        {c.designationTagIds.map(id => {
                          const t = designationTags.find(x => x.id === id);
                          return t ? <TagChip key={id} label={t.label} type="designation" /> : null;
                        })}
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0 flex-shrink-0">
                      <ActionIcons 
                        mobile={c.mobile} 
                        whatsapp={c.whatsapp} 
                        email={c.email} 
                        instagram={c.instagram} 
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="promo" className="space-y-4 mt-4">
          {filteredPromo.length === 0 ? (
             <div className="text-center p-12 bg-card/50 rounded-lg border border-dashed border-card-border">
              <p className="text-muted-foreground">No promotional contacts found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPromo.map(c => (
                <Link key={c.id} href={`/contacts/promo/${c.id}`}>
                  <div className="p-4 bg-card rounded-lg border border-card-border hover:border-primary/50 transition-colors cursor-pointer group flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors mb-2">{c.name}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {c.categoryIds.map(cat => (
                          <TagChip key={cat} label={cat} type="category" />
                        ))}
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0 flex-shrink-0">
                      <ActionIcons 
                        instagram={c.platformLinks.instagram}
                        email={c.platformLinks.email}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
