import { useStore, Contact } from '../store';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TagChip, ActionIcons } from '../components/SharedUI';
import { Plus, Trash2, Edit2, Users, GripVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

function SortableCandidate({
  contact,
  onRemove,
}: {
  contact: Contact;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: contact.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 bg-background border border-border rounded-lg ${
        isDragging ? 'opacity-70 border-primary' : ''
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">

        {/* VISIBLE DRAG HANDLE */}
        <button
          type="button"
          aria-label={`Drag ${contact.name}`}
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-10 h-10 shrink-0 rounded-md bg-primary text-white cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical size={22} />
        </button>

        <div className="min-w-0">
          <h4 className="font-medium text-white truncate">
            {contact.name}
          </h4>

          <div className="flex gap-2 text-xs text-muted-foreground mt-1">
            {contact.organization && (
              <span>{contact.organization}</span>
            )}

            {contact.place && (
              <span>• {contact.place}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-3 shrink-0">
        <ActionIcons
          mobile={contact.mobile}
          whatsapp={contact.whatsapp}
          email={contact.email}
          instagram={contact.instagram}
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
        >
          <Trash2
            size={14}
            className="text-muted-foreground hover:text-destructive"
          />
        </Button>
      </div>
    </div>
  );
}


export default function Lists() {
  const lists = useStore(state => state.customLists);
  const addList = useStore(state => state.addCustomList);
  const deleteList = useStore(state => state.deleteCustomList);
  const updateList = useStore(state => state.updateCustomList);
  const contacts = useStore(state => state.contacts);

  const [newListOpen, setNewListOpen] = useState(false);
  const [newListName, setNewListName] = useState('');

  const [activeListId, setActiveListId] = useState<string | null>(lists.length > 0 ? lists[0].id : null);
  
  const activeList = lists.find(l => l.id === activeListId);

  const handleAddList = () => {
    if (!newListName) return;
    addList(newListName);
    setNewListName('');
    setNewListOpen(false);
  };

  const handleAddDepartment = () => {
    if (!activeList) return;
    const name = prompt("Department name (e.g. Editor, DOP):");
    if (name) {
      updateList(activeList.id, {
        departments: [...activeList.departments, { id: crypto.randomUUID(), name, memberContactIds: [] }]
      });
    }
  };

   const handleCandidateDragEnd = (
          event: DragEndEvent,
          departmentId: string
        ) => {
          const { active, over } = event;

          if (!over || active.id === over.id || !activeList) {
            return;
          }

          const department = activeList.departments.find(
            d => d.id === departmentId
          );

          if (!department) return;

          const oldIndex = department.memberContactIds.indexOf(
            String(active.id)
          );

          const newIndex = department.memberContactIds.indexOf(
            String(over.id)
          );

          if (oldIndex === -1 || newIndex === -1) return;

          const reorderedIds = arrayMove(
            department.memberContactIds,
            oldIndex,
            newIndex
          );

          updateList(activeList.id, {
            departments: activeList.departments.map(d =>
              d.id === departmentId
                ? {
                    ...d,
                    memberContactIds: reorderedIds,
                  }
                : d
            ),
          });
        };

  const [searchOpenForDept, setSearchOpenForDept] = useState<string | null>(null);
  const [contactSearch, setContactSearch] = useState('');

  const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8,
        },
      })
    );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Sidebar: Lists */}
      <div className="w-full md:w-64 space-y-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Custom Lists</h2>
          <Dialog open={newListOpen} onOpenChange={setNewListOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost"><Plus size={18} /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card text-white border-border">
              <DialogHeader>
                <DialogTitle>Create New List</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input value={newListName} onChange={e => setNewListName(e.target.value)} placeholder="e.g. Upcoming Short Film" className="bg-background" autoFocus />
              </div>
              <Button onClick={handleAddList}>Create</Button>
            </DialogContent>
          </Dialog>
        </div>

        {lists.length === 0 ? (
          <div className="text-sm text-muted-foreground p-4 bg-card rounded text-center border border-dashed border-border">
            No lists created yet.
          </div>
        ) : (
          <div className="space-y-1">
            {lists.map(list => (
              <div 
                key={list.id} 
                onClick={() => setActiveListId(list.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center group ${activeListId === list.id ? 'bg-primary/20 text-primary' : 'bg-card text-muted-foreground hover:bg-secondary hover:text-white'}`}
              >
                <span className="font-medium truncate pr-2">{list.name}</span>
               
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 md:opacity-0 md:group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();

                        if (confirm(`Delete "${list.name}"?`)) {
                          deleteList(list.id);

                          if (activeListId === list.id) {
                            setActiveListId(null);
                          }
                        }
                      }}
                    >
                      <Trash2
                        size={16}
                        className="text-muted-foreground hover:text-destructive"
                      />
                    </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content: Active List Departments */}
      <div className="flex-1">
        {!activeList ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-muted-foreground border border-dashed border-border rounded-xl">
            <Users size={48} className="opacity-20 mb-4" />
            <p>Select or create a list to start assembling crews.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-2xl font-bold text-white">{activeList.name}</h2>
              <Button onClick={handleAddDepartment} variant="secondary"><Plus size={16} className="mr-2" /> Add Department</Button>
            </div>

            {activeList.departments.length === 0 ? (
              <div className="text-center p-8 bg-card rounded text-muted-foreground">
                No departments yet. Add one like "Directors", "DOPs", or "Cast".
              </div>
            ) : (
              <div className="grid gap-6">
                {activeList.departments.map(dept => (
                  <div key={dept.id} className="bg-card border border-card-border rounded-xl p-4 md:p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-white">{dept.name}</h3>
                      <div className="flex gap-2">
                        <Dialog open={searchOpenForDept === dept.id} onOpenChange={(o) => { setSearchOpenForDept(o ? dept.id : null); setContactSearch(''); }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm"><Plus size={14} className="mr-1" /> Add Candidate</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md bg-card text-white border-border">
                            <DialogHeader>
                              <DialogTitle>Add to {dept.name}</DialogTitle>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                              <Input 
                                value={contactSearch} 
                                onChange={e => setContactSearch(e.target.value)} 
                                placeholder="Search contacts..." 
                                className="bg-background" 
                                autoFocus 
                              />
                              <div className="max-h-60 overflow-y-auto space-y-1">
                                {contacts.filter(c => !dept.memberContactIds.includes(c.id) && c.name.toLowerCase().includes(contactSearch.toLowerCase())).map(c => (
                                  <div key={c.id} className="flex justify-between items-center p-2 hover:bg-secondary rounded cursor-pointer" onClick={() => {
                                    updateList(activeList.id, {
                                      departments: activeList.departments.map(d => d.id === dept.id ? { ...d, memberContactIds: [...d.memberContactIds, c.id] } : d)
                                    });
                                    setSearchOpenForDept(null);
                                  }}>
                                    <span>{c.name}</span>
                                    <Plus size={14} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" onClick={() => {
                          if(confirm(`Delete department ${dept.name}?`)) {
                            updateList(activeList.id, { departments: activeList.departments.filter(d => d.id !== dept.id) });
                          }
                        }}>
                          <Trash2 size={16} className="text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-2">
                          {dept.memberContactIds.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">
                              No candidates added.
                            </p>
                          ) : (
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={(event) =>
                                handleCandidateDragEnd(event, dept.id)
                              }
                            >
                              <SortableContext
                                items={dept.memberContactIds}
                                strategy={verticalListSortingStrategy}
                              >
                                <div className="grid gap-2">
                                  {dept.memberContactIds.map(cid => {
                                    const c = contacts.find(x => x.id === cid);

                                    if (!c) return null;

                                    return (
                                      <SortableCandidate
                                        key={cid}
                                        contact={c}
                                        onRemove={() => {
                                          updateList(activeList.id, {
                                            departments: activeList.departments.map(d =>
                                              d.id === dept.id
                                                ? {
                                                    ...d,
                                                    memberContactIds:
                                                      d.memberContactIds.filter(
                                                        x => x !== cid
                                                      ),
                                                  }
                                                : d
                                            ),
                                          });
                                        }}
                                      />
                                    );
                                  })}
                                </div>
                              </SortableContext>
                            </DndContext>
                          )}
                        </div>
                   
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
