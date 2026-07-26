import { useStore, Contact } from '../store';
import { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, UserPlus, Save } from 'lucide-react';
import { TagChip } from '../components/SharedUI';

export default function ContactForm({ isPromo = false }: { isPromo?: boolean }) {
  const [location, setLocation] = useLocation();
  const store = useStore();
  const { id } = useParams<{ id?: string }>();
  
  const isEditing = !!id;
  const existingContact = isEditing && !isPromo ? store.contacts.find(c => c.id === id) : undefined;
  const existingPromo = isEditing && isPromo ? store.promotionContacts.find(c => c.id === id) : undefined;

  // Generic contact state
  const [name, setName] = useState(existingContact?.name || existingPromo?.name || '');
  const [mobile, setMobile] = useState(existingContact?.mobile || '');
  const [whatsapp, setWhatsapp] = useState(existingContact?.whatsapp || '');
  const [email, setEmail] = useState(existingContact?.email || existingPromo?.platformLinks?.email || '');
  const [instagram, setInstagram] = useState(existingContact?.instagram || existingPromo?.platformLinks?.instagram || '');
  const [notes, setNotes] = useState(existingContact?.notes || existingPromo?.notes || '');
  
  // Main contact only
  const [place, setPlace] = useState(existingContact?.place || '');
  const [organization, setOrganization] = useState(existingContact?.organization || '');
  const [favouriteProjects, setFavouriteProjects] = useState(existingContact?.favouriteProjects || '');
  const [selectedDes, setSelectedDes] = useState<string[]>(existingContact?.designationTagIds || []);
  const [selectedRel, setSelectedRel] = useState<string[]>(existingContact?.relationshipTagIds || []);

  // Promo only
  const [youtube, setYoutube] = useState(existingPromo?.platformLinks?.youtube || '');
  const [selectedCats, setSelectedCats] = useState<string[]>(existingPromo?.categoryIds || []);

  const handleNativeImport = async () => {
    if (!('contacts' in navigator && 'ContactsManager' in window)) {
      alert('Contact Picker API is not supported on this device/browser.');
      return;
    }
    try {
      const props = ['name', 'tel', 'email'];
      const opts = { multiple: false };
      // @ts-ignore
      const contacts = await navigator.contacts.select(props, opts);
      if (contacts.length > 0) {
        const c = contacts[0];
        if (c.name?.length) setName(c.name[0]);
        if (c.tel?.length) {
          setMobile(c.tel[0]);
          setWhatsapp(c.tel[0]); // prefill whatsapp too
        }
        if (c.email?.length) setEmail(c.email[0]);
      }
    } catch (err) {
      console.error('Import failed', err);
    }
  };

  const handleSave = () => {
    if (!name) return;

    if (isPromo) {
      const payload = {
        name,
        platformLinks: { instagram, email, youtube },
        categoryIds: selectedCats,
        notes
      };
      if (isEditing && id) {
        store.updatePromotionContact(id, payload);
      } else {
        store.addPromotionContact(payload);
      }
      setLocation('/contacts');
    } else {
      const payload = {
        name, mobile, whatsapp, email, instagram,
        place, organization, favouriteProjects, notes,
        designationTagIds: selectedDes,
        relationshipTagIds: selectedRel
      };
      if (isEditing && id) {
        store.updateContact(id, payload);
        setLocation(`/contacts/${id}`);
      } else {
        store.addContact(payload);
        setLocation('/contacts');
      }
    }
  };

  const toggleArray = (arr: string[], setArr: any, val: string) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}><ChevronLeft /></Button>
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit' : 'Add'} {isPromo ? 'Promo Contact' : 'Contact'}
          </h2>
        </div>
        {!isEditing && (
          <Button variant="outline" onClick={handleNativeImport} className="gap-2">
            <UserPlus size={16} /> Import from Device
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 bg-card p-5 rounded-xl border border-card-border">
          <h3 className="font-semibold text-white">Basic Info</h3>
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} autoFocus className="bg-background" />
          </div>
          
          {!isPromo && (
            <>
              <div className="space-y-2">
                <Label>Organization / Company</Label>
                <Input value={organization} onChange={e => setOrganization(e.target.value)} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>City / Place</Label>
                <Input value={place} onChange={e => setPlace(e.target.value)} className="bg-background" />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="bg-background min-h-[100px]" placeholder="How did you meet? Preferences?" />
          </div>
        </div>

        <div className="space-y-4 bg-card p-5 rounded-xl border border-card-border">
          <h3 className="font-semibold text-white">Contact & Links</h3>
          {!isPromo && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mobile</Label>
                <Input value={mobile} onChange={e => setMobile(e.target.value)} className="bg-background" type="tel" />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="bg-background" type="tel" />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={e => setEmail(e.target.value)} className="bg-background" type="email" />
          </div>
          <div className="space-y-2">
            <Label>Instagram (Handle or URL)</Label>
            <Input value={instagram} onChange={e => setInstagram(e.target.value)} className="bg-background" placeholder="@username" />
          </div>
          {isPromo && (
            <div className="space-y-2">
              <Label>YouTube / Primary Link</Label>
              <Input value={youtube} onChange={e => setYoutube(e.target.value)} className="bg-background" />
            </div>
          )}
        </div>
      </div>

      <div className="bg-card p-5 rounded-xl border border-card-border space-y-6">
        <h3 className="font-semibold text-white">Categorization</h3>
        
        {isPromo ? (
          <div className="space-y-3">
            <Label>Promotion Categories</Label>
            <div className="flex flex-wrap gap-2">
              {store.promotionCategories.map(cat => (
                <TagChip 
                  key={cat} label={cat} type="category" 
                  selected={selectedCats.includes(cat)} 
                  onClick={() => toggleArray(selectedCats, setSelectedCats, cat)}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <Label>Relationships</Label>
              <div className="flex flex-wrap gap-2">
                {store.relationshipTags.map(tag => (
                  <TagChip 
                    key={tag.id} label={tag.label} type="relationship" 
                    selected={selectedRel.includes(tag.id)} 
                    onClick={() => toggleArray(selectedRel, setSelectedRel, tag.id)}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Designations</Label>
              <div className="flex flex-wrap gap-2">
                {store.designationTags.map(tag => (
                  <TagChip 
                    key={tag.id} label={tag.label} type="designation" 
                    selected={selectedDes.includes(tag.id)} 
                    onClick={() => toggleArray(selectedDes, setSelectedDes, tag.id)}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2 pt-4">
              <Label>Favourite Projects (Comma separated)</Label>
              <Input value={favouriteProjects} onChange={e => setFavouriteProjects(e.target.value)} className="bg-background" placeholder="Project 1, Project 2..." />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={handleSave} disabled={!name} className="gap-2">
          <Save size={18} /> Save Contact
        </Button>
      </div>
    </div>
  );
}
