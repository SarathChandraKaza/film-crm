import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const uuidv4 = () => crypto.randomUUID();

export interface Tag { id: string; label: string; }

export interface HistoryEntry { id: string; text: string; date: string; }

export interface Contact {
  id: string;
  name: string;
  mobile: string;
  whatsapp: string;
  email: string;
  instagram: string;
  place: string;
  organization: string;
  designationTagIds: string[];
  relationshipTagIds: string[];
  favouriteProjects: string;
  notes: string;
  history: HistoryEntry[];
  createdAt: string;
}

export interface PromotionContact {
  id: string;
  name: string;
  platformLinks: {
    instagram?: string; youtube?: string; facebook?: string;
    x?: string; telegram?: string; email?: string; profileLink?: string;
  };
  categoryIds: string[];
  notes: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  memberContactIds: string[];
}

export interface CustomList {
  id: string;
  name: string;
  departments: Department[];
}

export interface ManualEntry {
  id: string;
  name: string;
  mobile?: string; whatsapp?: string; email?: string; instagram?: string;
}

export interface ContactCampaignState {
  status: 'pending' | 'completed' | 'skipped';
  overrideHeader?: string;
  overrideFooter?: string;
  useOverride: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  createdAt: string;
  lastWorkedAt: string | null;
  status: 'active' | 'completed';
  message: {
    header: string;
    body: string;
    footer: string;
  };
  audienceRules: {
    relationshipTagIds: string[];
    designationTagIds: string[];
    places: string[];
    promotionCategoryIds: string[];
  };
  audienceContactIds: string[];
  audiencePromotionContactIds: string[];
  manualEntries: ManualEntry[];
  contactStates: Record<string, ContactCampaignState>;
  lastWorkedIndex: number;
}

export interface AppState {
  contacts: Contact[];
  promotionContacts: PromotionContact[];
  designationTags: Tag[];
  relationshipTags: Tag[];
  promotionCategories: string[];
  customLists: CustomList[];
  campaigns: Campaign[];
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'history'>) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  addHistoryEntry: (contactId: string, text: string) => void;
  addPromotionContact: (contact: Omit<PromotionContact, 'id' | 'createdAt'>) => void;
  updatePromotionContact: (id: string, contact: Partial<PromotionContact>) => void;
  deletePromotionContact: (id: string) => void;
  addCampaign: (campaign: Omit<Campaign, 'id'>) => string;
  updateCampaign: (id: string, campaign: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  addCustomList: (name: string) => void;
  updateCustomList: (id: string, list: Partial<CustomList>) => void;
  deleteCustomList: (id: string) => void;
  importData: (data: Partial<AppState>) => void;
  addDesignationTag: (label: string) => void;
  deleteDesignationTag: (id: string) => void;
  addRelationshipTag: (label: string) => void;
  deleteRelationshipTag: (id: string) => void;
  addPromotionCategory: (label: string) => void;
  deletePromotionCategory: (label: string) => void;
}

const DEFAULT_DESIGNATION_TAGS = [
  'Director', 'Writer', 'DOP', 'Editor', 'Producer', 'Actor (Male)', 
  'Actor (Female)', 'Music Director', 'Sound Designer', 'Production Designer', 
  'Colorist', 'VFX'
].map(label => ({ id: uuidv4(), label }));

const DEFAULT_RELATIONSHIP_TAGS = [
  'Peer', 'Senior', 'Mentor', 'Junior', 'Friend', 'Faculty', 'Bridge'
].map(label => ({ id: uuidv4(), label }));

const DEFAULT_PROMOTION_CATEGORIES = [
  'Meme Page', 'Movie Updates', 'Review Page', 'Influencer', 
  'Content Creator', 'PR Agency', 'Media Outlet', 'Festival', 'Community'
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      contacts: [],
      promotionContacts: [],
      designationTags: DEFAULT_DESIGNATION_TAGS,
      relationshipTags: DEFAULT_RELATIONSHIP_TAGS,
      promotionCategories: DEFAULT_PROMOTION_CATEGORIES,
      customLists: [],
      campaigns: [],

      addContact: (contactData) => set((state) => ({
        contacts: [...state.contacts, { 
          ...contactData, 
          id: uuidv4(), 
          createdAt: new Date().toISOString(), 
          history: [] 
        }]
      })),
      updateContact: (id, contactData) => set((state) => ({
        contacts: state.contacts.map(c => c.id === id ? { ...c, ...contactData } : c)
      })),
      deleteContact: (id) => set((state) => ({
        contacts: state.contacts.filter(c => c.id !== id)
      })),
      addHistoryEntry: (contactId, text) => set((state) => ({
        contacts: state.contacts.map(c => c.id === contactId ? {
          ...c, history: [...c.history, { id: uuidv4(), text, date: new Date().toISOString() }]
        } : c)
      })),

      addPromotionContact: (contactData) => set((state) => ({
        promotionContacts: [...state.promotionContacts, { 
          ...contactData, 
          id: uuidv4(), 
          createdAt: new Date().toISOString() 
        }]
      })),
      updatePromotionContact: (id, contactData) => set((state) => ({
        promotionContacts: state.promotionContacts.map(c => c.id === id ? { ...c, ...contactData } : c)
      })),
      deletePromotionContact: (id) => set((state) => ({
        promotionContacts: state.promotionContacts.filter(c => c.id !== id)
      })),

      addCampaign: (campaignData) => {
        const id = uuidv4();
        set((state) => ({
          campaigns: [...state.campaigns, { ...campaignData, id }]
        }));
        return id;
      },
      updateCampaign: (id, campaignData) => set((state) => ({
        campaigns: state.campaigns.map(c => c.id === id ? { ...c, ...campaignData } : c)
      })),
      deleteCampaign: (id) => set((state) => ({
        campaigns: state.campaigns.filter(c => c.id !== id)
      })),

      addCustomList: (name) => set((state) => ({
        customLists: [...state.customLists, { id: uuidv4(), name, departments: [] }]
      })),
      updateCustomList: (id, listData) => set((state) => ({
        customLists: state.customLists.map(l => l.id === id ? { ...l, ...listData } : l)
      })),
      deleteCustomList: (id) => set((state) => ({
        customLists: state.customLists.filter(l => l.id !== id)
      })),

      importData: (data) => set((state) => ({
        ...state,
        ...data
      })),

      addDesignationTag: (label) => set((state) => ({
        designationTags: [...state.designationTags, { id: uuidv4(), label }]
      })),
      deleteDesignationTag: (id) => set((state) => ({
        designationTags: state.designationTags.filter(t => t.id !== id)
      })),
      addRelationshipTag: (label) => set((state) => ({
        relationshipTags: [...state.relationshipTags, { id: uuidv4(), label }]
      })),
      deleteRelationshipTag: (id) => set((state) => ({
        relationshipTags: state.relationshipTags.filter(t => t.id !== id)
      })),
      addPromotionCategory: (label) => set((state) => ({
        promotionCategories: [...state.promotionCategories, label]
      })),
      deletePromotionCategory: (label) => set((state) => ({
        promotionCategories: state.promotionCategories.filter(c => c !== label)
      })),
    }),
    {
      name: 'film_crm_data',
    }
  )
);
