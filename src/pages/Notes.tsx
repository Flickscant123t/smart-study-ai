import { useState } from "react";
import AppSidebar from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText, Trash2, Edit2, Save, X } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Introduction to React",
      content: "React is a JavaScript library for building user interfaces. Key concepts include components, props, state, and hooks.",
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000)
    },
    {
      id: "2",
      title: "TypeScript Basics",
      content: "TypeScript adds static typing to JavaScript. Types include string, number, boolean, arrays, objects, and custom interfaces.",
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 172800000)
    }
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [editNote, setEditNote] = useState({ title: "", content: "" });

  const handleCreateNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    
    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setNotes([note, ...notes]);
    setNewNote({ title: "", content: "" });
    setIsCreating(false);
  };

  const handleUpdateNote = (id: string) => {
    setNotes(notes.map(note => 
      note.id === id 
        ? { ...note, title: editNote.title, content: editNote.content, updatedAt: new Date() }
        : note
    ));
    setEditingId(null);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditNote({ title: note.title, content: note.content });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 ml-64 p-6 lg:p-8 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Notes</h1>
                <p className="text-muted-foreground mt-1">Organize your study materials</p>
              </div>
              <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </div>

            {/* Create Note Form */}
            {isCreating && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Create New Note</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Note title..."
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Write your note content..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    className="min-h-[150px]"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreateNote}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Note
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setIsCreating(false);
                      setNewNote({ title: "", content: "" });
                    }}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes List */}
            {notes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No notes yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first note to get started</p>
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Note
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <Card key={note.id}>
                    {editingId === note.id ? (
                      <CardContent className="pt-6 space-y-4">
                        <Input
                          value={editNote.title}
                          onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                        />
                        <Textarea
                          value={editNote.content}
                          onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                          className="min-h-[100px]"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateNote(note.id)}>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    ) : (
                      <>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{note.title}</CardTitle>
                              <CardDescription>
                                Updated {note.updatedAt.toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" onClick={() => startEditing(note)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDeleteNote(note.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                        </CardContent>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Notes;
