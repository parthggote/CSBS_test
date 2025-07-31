"use client"

import { useState, useEffect, useRef } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Edit, Trash2, Users, Settings, FileText, Eye, Download, Save, Bell, BookOpen, Brain, Clock, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast";
import Chatbot from '../components/Chatbot';

interface RegistrationField {
  id: string
  label: string
  type: "text" | "email" | "number" | "select" | "textarea"
  required: boolean
  options?: string[]
  placeholder?: string
}

interface Event {
  _id?: string;
  id?: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  fullDescription: string;
  speaker: string;
  capacity: number;
  registered: number;
  category: string;
  image: string;
  registrationFields: RegistrationField[];
  isActive: boolean;
  registeredUsers?: string[]; // Added for registered users
  registrations?: any[]; // Added for registrations data
}

function safeJson(res: Response) {
  return res.text().then((text) => {
    try {
      return text ? JSON.parse(text) : [];
    } catch {
      return [];
    }
  });
}

// Add CSV export helper
function exportRegistrationsToCSV(event: Event, allUsers: any[]) {
  if (!Array.isArray(event.registeredUsers) || event.registeredUsers.length === 0) return;
  // Collect all possible registration fields
  let allFields: string[] = [];
  if (Array.isArray(event.registrations)) {
    event.registrations.forEach((reg: any) => {
      if (reg.data) {
        Object.keys(reg.data).forEach((field) => {
          if (!allFields.includes(field)) allFields.push(field);
        });
      }
    });
  }
  const header = ['Name', 'Email', ...allFields];
  const rows = event.registeredUsers.map((userId) => {
    const userObj = allUsers.find((u) => u._id === userId);
    const reg = Array.isArray(event.registrations)
      ? event.registrations.find((r: any) => r.userId === userId)
      : null;
    const row = [userObj ? userObj.name : userId, userObj ? userObj.email : ''];
    allFields.forEach((field) => {
      row.push(reg && reg.data && reg.data[field] !== undefined ? reg.data[field] : '');
    });
    return row;
  });
  const csvContent = [header, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n');
  // Debug logging
  console.log('CSV Header:', header);
  console.log('CSV Rows:', rows);
  console.log('CSV Content:', csvContent);
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_registrations.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch('/api/users/me', { credentials: 'include' });
      if (res.ok) {
        setCurrentUser(await res.json());
      }
    }
    fetchUser();
  }, []);

  // --- EVENTS/RESOURCES ---
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    setLoadingEvents(true);
    fetch("/api/resources?type=events", { credentials: 'include' })
      .then(safeJson)
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoadingEvents(false));
  }, []);

  const handleCreateEvent = async () => {
    if (newEvent.title && newEvent.date && newEvent.time && newEvent.location) {
      const event = {
        ...newEvent,
        type: 'events',
        category: newEvent.category || "Workshop",
        registrationFields: newEvent.registrationFields || [...defaultRegistrationFields],
        isActive: newEvent.isActive ?? true,
      }
      const res = await fetch("/api/resources?type=events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
        credentials: 'include',
      })
      const created = await safeJson(res)
      if (!created || res.status >= 400) {
        toast({ title: 'Error', description: 'Failed to create event', variant: 'destructive' })
        return
      }
      setEvents((prev) => [...prev, created])
      setNewEvent({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        fullDescription: "",
        speaker: "",
        capacity: 100,
        category: "Workshop",
        registrationFields: [...defaultRegistrationFields],
        isActive: true,
      })
      setIsCreatingEvent(false)
    }
  }

  const handleUpdateEvent = async () => {
    if (selectedEvent) {
      const { _id, ...rest } = selectedEvent as any;
      const res = await fetch("/api/resources?type=events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: _id, ...rest, type: 'events' }),
        credentials: 'include',
      })
      if (res.ok) {
        setEvents((prev) => prev.map((event) => (event._id === _id ? selectedEvent : event)))
      setIsEditingEvent(false)
      setSelectedEvent(null)
    }
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    const res = await fetch("/api/resources?type=events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: eventId }),
      credentials: 'include',
    })
    if (res.ok) {
      setEvents((prev) => prev.filter((event) => event._id !== eventId))
    }
  }

  const handleToggleEventStatus = async (eventId: string) => {
    const event = events.find((e) => e._id === eventId)
    if (!event) return
    const updated = { ...event, isActive: !event.isActive }
    const res = await fetch("/api/resources?type=events", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: eventId, ...updated, type: 'events' }),
      credentials: 'include',
    })
    if (res.ok) {
      setEvents((prev) => prev.map((e) => (e._id === eventId ? updated : e)))
    }
  }

  const addRegistrationField = (eventData: Partial<Event> | Event, setEventData: any) => {
    const newField: RegistrationField = {
      id: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      required: false,
      placeholder: "Enter placeholder text",
    }

    const updatedFields = [...(eventData.registrationFields || []), newField]
    setEventData({ ...eventData, registrationFields: updatedFields })
  }

  const updateRegistrationField = (
    eventData: Partial<Event> | Event,
    setEventData: any,
    fieldId: string,
    updates: Partial<RegistrationField>,
  ) => {
    const updatedFields = (eventData.registrationFields || []).map((field) =>
      field.id === fieldId ? { ...field, ...updates } : field,
    )
    setEventData({ ...eventData, registrationFields: updatedFields })
  }

  const removeRegistrationField = (eventData: Partial<Event> | Event, setEventData: any, fieldId: string) => {
    const updatedFields = (eventData.registrationFields || []).filter((field) => field.id !== fieldId)
    setEventData({ ...eventData, registrationFields: updatedFields })
  }

  const RegistrationFieldEditor = ({
    eventData,
    setEventData,
    isEditing = false,
  }: {
    eventData: Partial<Event> | Event
    setEventData: any
    isEditing?: boolean
  }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Registration Form Fields</h3>
        <Button onClick={() => addRegistrationField(eventData, setEventData)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Field
        </Button>
      </div>

      <div className="space-y-3">
        {(eventData.registrationFields || []).map((field, index) => (
          <Card key={field.id} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Field Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) =>
                    updateRegistrationField(eventData, setEventData, field.id, { label: e.target.value })
                  }
                  placeholder="Field label"
                />
              </div>

              <div>
                <Label>Field Type</Label>
                <Select
                  value={field.type}
                  onValueChange={(value: any) =>
                    updateRegistrationField(eventData, setEventData, field.id, { type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="select">Dropdown</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Placeholder</Label>
                <Input
                  value={field.placeholder || ""}
                  onChange={(e) =>
                    updateRegistrationField(eventData, setEventData, field.id, { placeholder: e.target.value })
                  }
                  placeholder="Placeholder text"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={field.required}
                    onCheckedChange={(checked) =>
                      updateRegistrationField(eventData, setEventData, field.id, { required: checked })
                    }
                  />
                  <Label className="text-sm">Required</Label>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeRegistrationField(eventData, setEventData, field.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {field.type === "select" && (
              <div className="mt-3">
                <Label>Options (comma separated)</Label>
                <Input
                  value={(field.options || []).join(", ")}
                  onChange={(e) =>
                    updateRegistrationField(eventData, setEventData, field.id, {
                      options: e.target.value
                        .split(",")
                        .map((opt) => opt.trim())
                        .filter((opt) => opt),
                    })
                  }
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )

  // --- USERS ---
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    setLoadingUsers(true)
    fetch("/api/users", { credentials: 'include' })
      .then(safeJson)
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false))
    // Fetch all users for registration display
    fetch("/api/users", { credentials: 'include' })
      .then((res) => res.json())
      .then((users) => setAllUsers(Array.isArray(users) ? users : []))
      .catch(() => setAllUsers([]));
  }, [])

  // --- USERS CRUD ---
  const handleCreateUser = async (user: any) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (!res.ok) throw new Error('Failed to create user');
      const created = await safeJson(res);
      if (!created || res.status >= 400) {
        toast({ title: 'Error', description: 'Failed to create user', variant: 'destructive' });
        return;
      }
      setUsers((prev) => [...prev, created]);
      toast({ title: 'Success', description: 'User created successfully.' });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleUpdateUser = async (user: any) => {
    try {
      const { _id, ...rest } = user;
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: _id, ...rest }),
      });
      if (!res.ok) throw new Error('Failed to update user');
      setUsers((prev) => prev.map((u) => (u._id === _id ? user : u)));
      toast({ title: 'Success', description: 'User updated successfully.' });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast({ title: 'Success', description: 'User deleted successfully.' });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  // --- SETTINGS ---
  const [settings, setSettings] = useState<any>({})
  const [loadingSettings, setLoadingSettings] = useState(false)

  useEffect(() => {
    setLoadingSettings(true)
    fetch("/api/settings", { credentials: 'include' })
      .then(safeJson)
      .then((data) => setSettings(data && typeof data === 'object' ? data : {}))
      .catch(() => setSettings({}))
      .finally(() => setLoadingSettings(false))
  }, [])

  const handleUpdateSettings = async (updates: any) => {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      const data = await safeJson(res)
      if (!data || res.status >= 400) {
        toast({ title: 'Error', description: 'Failed to update settings', variant: 'destructive' });
        return;
      }
      setSettings(data)
      toast({ title: 'Success', description: 'Settings updated successfully.' });
    }
  }

  // --- SETTINGS FORM ---
  const [settingsDraft, setSettingsDraft] = useState<any>({});
  useEffect(() => {
    setSettingsDraft(settings);
  }, [settings]);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettingsDraft({ ...settingsDraft, [e.target.name]: e.target.value });
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleUpdateSettings(settingsDraft);
      toast({ title: 'Success', description: 'Settings updated successfully.' });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isEditingEvent, setIsEditingEvent] = useState(false)
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [editingField, setEditingField] = useState<RegistrationField | null>(null)

  const defaultRegistrationFields: RegistrationField[] = [
    { id: "name", label: "Full Name", type: "text", required: true, placeholder: "Enter your full name" },
    { id: "email", label: "Email Address", type: "email", required: true, placeholder: "Enter your email" },
  ]

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    fullDescription: "",
    speaker: "",
    capacity: 100,
    category: "Workshop",
    registrationFields: [...defaultRegistrationFields],
    isActive: true,
  })

  // --- RESOURCES ---
  const resourceTypes = [
    { key: 'hackathons', label: 'Hackathons' },
    { key: 'pyqs', label: 'PYQs' },
    { key: 'certifications', label: 'Certifications' },
    { key: 'interviews', label: 'Interviews' },
  ];
  const [resources, setResources] = useState<any[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [isCreatingResource, setIsCreatingResource] = useState(false);
  const [newResource, setNewResource] = useState<any>({ title: '', description: '', category: '', extra: '', type: '', examType: '', year: '', semester: '', downloads: 0 });
  const [editingResource, setEditingResource] = useState<any | null>(null);
  const [isEditingResource, setIsEditingResource] = useState(false);

  // --- QUIZZES ---
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [newQuiz, setNewQuiz] = useState<any>({ 
    title: '', 
    description: '', 
    subject: '', 
    difficulty: 'medium', 
    questionCount: 10, 
    timeLimit: 30, 
    instructions: '',
    isActive: true 
  });
  const [editingQuiz, setEditingQuiz] = useState<any | null>(null);
  const [isEditingQuiz, setIsEditingQuiz] = useState(false);

  useEffect(() => {
    setLoadingQuizzes(true);
    fetch("/api/resources?type=quizzes", { credentials: 'include' })
      .then(safeJson)
      .then((data) => setQuizzes(Array.isArray(data) ? data : []))
      .catch(() => setQuizzes([]))
      .finally(() => setLoadingQuizzes(false));
  }, []);

  // Fetch flashcard sets
  useEffect(() => {
    fetch("/api/resources?type=flashcardSets", { credentials: 'include' })
      .then(safeJson)
      .then((data) => setFlashcardSets(Array.isArray(data) ? data : []))
      .catch(() => setFlashcardSets([]));
  }, []);

  const handleCreateQuiz = async () => {
    if (newQuiz.title && newQuiz.subject) {
      const quiz = {
        ...newQuiz,
        type: 'quizzes',
        participants: 0,
        bestScore: null,
        isActive: newQuiz.isActive ?? true,
      }
      const res = await fetch("/api/resources?type=quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quiz),
        credentials: 'include',
      })
      const created = await safeJson(res)
      if (!created || res.status >= 400) {
        toast({ title: 'Error', description: 'Failed to create quiz', variant: 'destructive' })
        return
      }
      setQuizzes((prev) => [...prev, created])
      setNewQuiz({
        title: '',
        description: '',
        subject: '',
        difficulty: 'medium',
        questionCount: 10,
        timeLimit: 30,
        instructions: '',
        isActive: true
      })
      setIsCreatingQuiz(false)
      toast({ title: 'Success', description: 'Quiz created successfully.' })
    }
  }

  const handleUpdateQuiz = async () => {
    if (editingQuiz) {
      const { _id, ...rest } = editingQuiz as any;
      const res = await fetch("/api/resources?type=quizzes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: _id, ...rest, type: 'quizzes' }),
        credentials: 'include',
      })
      if (res.ok) {
        setQuizzes((prev) => prev.map((quiz) => (quiz._id === _id ? editingQuiz : quiz)))
        setIsEditingQuiz(false)
        setEditingQuiz(null)
        toast({ title: 'Success', description: 'Quiz updated successfully.' })
      }
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    const res = await fetch("/api/resources?type=quizzes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: quizId }),
      credentials: 'include',
    })
    if (res.ok) {
      setQuizzes((prev) => prev.filter((quiz) => quiz._id !== quizId))
      toast({ title: 'Success', description: 'Quiz deleted successfully.' })
    }
  }

  const handleToggleQuizStatus = async (quizId: string) => {
    const quiz = quizzes.find((q) => q._id === quizId)
    if (!quiz) return
    const updated = { ...quiz, isActive: !quiz.isActive }
    const res = await fetch("/api/resources?type=quizzes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: quizId, ...updated, type: 'quizzes' }),
      credentials: 'include',
    })
    if (res.ok) {
      setQuizzes((prev) => prev.map((q) => (q._id === quizId ? updated : q)))
    }
  }

  const handlePublishQuiz = async (quizId: string, publish: boolean) => {
    const quiz = quizzes.find((q) => q._id === quizId);
    if (!quiz) return;
    const updated = { ...quiz, isActive: publish };
    const res = await fetch('/api/resources?type=quizzes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: quizId, ...updated, type: 'quizzes' }),
      credentials: 'include',
    });
    if (res.ok) {
      setQuizzes((prev) => prev.map((q) => (q._id === quizId ? updated : q)));
      toast({ title: 'Success', description: publish ? 'Quiz published to all users.' : 'Quiz unpublished.', variant: 'default' });
    }
  };

  useEffect(() => {
    setLoadingResources(true);
    Promise.all(resourceTypes.map(rt =>
      fetch(`/api/resources?type=${rt.key}`, { credentials: 'include' })
        .then(safeJson)
        .then(data => Array.isArray(data) ? data.map((r: any) => ({ ...r, type: rt.key })) : [])
        .catch(() => [])
    ))
      .then(results => setResources(results.flat()))
      .finally(() => setLoadingResources(false));
  }, []);

  const handleCreateResource = async (resource: any) => {
    try {
      const res = await fetch(`/api/resources?type=${newResource.type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resource),
      });
      if (!res.ok) throw new Error('Failed to create resource');
      const created = await safeJson(res);
      if (!created || res.status >= 400) {
        toast({ title: 'Error', description: 'Failed to create resource', variant: 'destructive' });
        return;
      }
      setResources((prev) => [...prev, created]);
      toast({ title: 'Success', description: 'Resource created successfully.' });
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const handleUpdateResource = async (resource: any) => {
    const { _id, ...rest } = resource;
    const res = await fetch(`/api/resources?type=${resource.type}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: _id, ...rest }),
    });
    if (res.ok) {
      setResources((prev) => prev.map((r) => (r._id === _id ? resource : r)));
      toast({ title: 'Success', description: 'Resource updated successfully.' });
    }
  };

  const handleDeleteResource = async (id: string) => {
    const res = await fetch(`/api/resources?type=${resources.find(r => r._id === id)?.type}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setResources((prev) => prev.filter((r) => r._id !== id));
      toast({ title: 'Success', description: 'Resource deleted successfully.' });
    }
  };

  const categoryOptions: Record<string, string[]> = {
    hackathons: ["Coding", "Robotics", "AI", "Other"],
    certifications: ["AWS", "Azure", "Google", "Other"],
    interviews: ["On Campus", "Off Campus", "Other"],
    pyqs: ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Other"],
  };
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('events');
  const [flashcardSets, setFlashcardSets] = useState<any[]>([]);
  const [selectedFlashcardSet, setSelectedFlashcardSet] = useState<any>(null);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [showFlashcardDialog, setShowFlashcardDialog] = useState(false);
  const [flashcardUploadForm, setFlashcardUploadForm] = useState({ subject: '', description: '', cardCount: 10 });
  const [isFlashcardUploading, setIsFlashcardUploading] = useState(false);
  const [flashcardUploadProgress, setFlashcardUploadProgress] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [pdfContext, setPdfContext] = useState<string | null>(null);
  const [pdfLoadingState, setPdfLoadingState] = useState(false);
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);
  const [showQuizUploadDialog, setShowQuizUploadDialog] = useState(false);
  const [quizUploadForm, setQuizUploadForm] = useState({ subject: '', difficulty: 'medium', questionCount: 10, timeLimit: 30, description: '' });
  const [quizPdfLoading, setQuizPdfLoading] = useState(false);
  const [quizPdfName, setQuizPdfName] = useState<string | null>(null);
  const [quizPdfUploadProgress, setQuizPdfUploadProgress] = useState(0);

  // --- NOTIFICATIONS ---
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    setLoadingNotifications(true);
    fetch("/api/notifications", { credentials: 'include' })
      .then(safeJson)
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoadingNotifications(false));
  }, []);

  const handleNotificationAction = async (notificationId: string, action: 'approve' | 'reject') => {
    const status = action === 'approve' ? 'approved' : 'rejected';
    const res = await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId, status }),
      credentials: 'include',
    });
    if (res.ok) {
      setNotifications((prev) => prev.map((n) => 
        n._id === notificationId ? { ...n, status } : n
      ));
      toast({ 
        title: 'Success', 
        description: `Request ${action}d successfully.`,
        variant: 'default' 
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute -top-16 -left-16 w-[22rem] h-[18rem] bg-gradient-to-br from-blue-400 via-purple-400 to-transparent opacity-30 rounded-full blur-[80px] z-0" />
      <div className="absolute bottom-0 right-0 w-[16rem] h-[16rem] bg-gradient-to-tr from-purple-400 via-pink-400 to-transparent opacity-20 rounded-full blur-[50px] z-0" />
      <Navigation currentUser={currentUser} />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground">Manage events, resources, and platform content</p>
        </div>

        <Tabs defaultValue="events" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8 max-w-6xl mx-auto mb-8">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="flashcards">Flash Cards</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Event Management</h2>
                <Dialog open={isCreatingEvent} onOpenChange={setIsCreatingEvent}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Event</DialogTitle>
                      <DialogDescription>
                        Fill in the event details and customize the registration form
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Event Title</Label>
                          <Input
                            value={newEvent.title || ""}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            placeholder="Enter event title"
                          />
                        </div>

                        <div>
                          <Label>Category</Label>
                          <Select
                            value={newEvent.category}
                            onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Workshop">Workshop</SelectItem>
                              <SelectItem value="Seminar">Seminar</SelectItem>
                              <SelectItem value="Competition">Competition</SelectItem>
                              <SelectItem value="Conference">Conference</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={newEvent.date || ""}
                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label>Time</Label>
                          <Input
                            value={newEvent.time || ""}
                            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                            placeholder="e.g., 2:00 PM - 4:00 PM"
                          />
                        </div>

                        <div>
                          <Label>Location</Label>
                          <Input
                            value={newEvent.location || ""}
                            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                            placeholder="Enter venue"
                          />
                        </div>

                        <div>
                          <Label>Capacity</Label>
                          <Input
                            type="number"
                            value={newEvent.capacity || 100}
                            onChange={(e) => setNewEvent({ ...newEvent, capacity: Number.parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Speaker/Organizer</Label>
                        <Input
                          value={newEvent.speaker || ""}
                          onChange={(e) => setNewEvent({ ...newEvent, speaker: e.target.value })}
                          placeholder="Enter speaker or organizer name"
                        />
                      </div>

                      <div>
                        <Label>Short Description</Label>
                        <Textarea
                          value={newEvent.description || ""}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                          placeholder="Brief description for event cards"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label>Full Description</Label>
                        <Textarea
                          value={newEvent.fullDescription || ""}
                          onChange={(e) => setNewEvent({ ...newEvent, fullDescription: e.target.value })}
                          placeholder="Detailed description for event details page"
                          rows={4}
                        />
                      </div>

                      <RegistrationFieldEditor eventData={newEvent} setEventData={setNewEvent} />

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newEvent.isActive ?? true}
                          onCheckedChange={(checked) => setNewEvent({ ...newEvent, isActive: checked })}
                        />
                        <Label>Event Active</Label>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreatingEvent(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateEvent}>
                          <Save className="w-4 h-4 mr-2" />
                          Create Event
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-6">
                {loadingEvents ? (
                  <p>Loading events...</p>
                ) : (!Array.isArray(events) || events.length === 0) ? (
                  <p>No events found. Create a new one!</p>
                ) : (
                  Array.isArray(events) && events.map((event) => (
                    <Card key={event._id} className={`${!event.isActive ? "opacity-60" : ""}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <span>{event.title}</span>
                            {!event.isActive && <Badge variant="secondary">Inactive</Badge>}
                          </CardTitle>
                          <CardDescription>
                            {new Date(event.date).toLocaleDateString()} • {event.time} • {event.location}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge>{event.category}</Badge>
                            <Switch checked={event.isActive} onCheckedChange={() => handleToggleEventStatus(event._id)} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-gray-600">Registrations</span>
                          <p className="font-semibold">
                            {event.registered}/{event.capacity}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Speaker</span>
                          <p className="font-semibold">{event.speaker}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Form Fields</span>
                            <p className="font-semibold">{Array.isArray(event.registrationFields) ? event.registrationFields.length : 0} fields</p>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{event.description}</p>

                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => exportRegistrationsToCSV(event, allUsers)}>
                                <Download className="w-4 h-4 mr-2" />
                                Export CSV
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Event Registrations - {event.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                  <p>Total Registrations: {Array.isArray(event.registeredUsers) ? event.registeredUsers.length : 0}</p>
                                  <Button size="sm" onClick={() => exportRegistrationsToCSV(event, allUsers)}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Export CSV
                                </Button>
                              </div>
                                <div>
                                  {Array.isArray(event.registeredUsers) && event.registeredUsers.length > 0 ? (
                                    <ul className="list-disc ml-6">
                                      {event.registeredUsers.map((userId: string) => {
                                        const userObj = allUsers.find((u) => u._id === userId);
                                        const reg = Array.isArray(event.registrations)
                                          ? event.registrations.find((r: any) => r.userId === userId)
                                          : null;
                                        return userObj ? (
                                          <li key={userId} className="mb-2">
                                            <div><strong>{userObj.name}</strong> ({userObj.email})</div>
                                            {reg && reg.data && (
                                              <div className="ml-4 text-xs text-gray-700">
                                                {Object.entries(reg.data).map(([field, value]) => (
                                                  <div key={field}><strong>{field}:</strong> {String(value)}</div>
                                                ))}
                                              </div>
                                            )}
                                          </li>
                                        ) : null;
                                      })}
                                    </ul>
                                  ) : (
                                    <p className="text-gray-500">No registrations yet.</p>
                                  )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog
                            open={isEditingEvent && selectedEvent?._id === event._id}
                          onOpenChange={(open) => {
                            setIsEditingEvent(open)
                            if (!open) setSelectedEvent(null)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedEvent(event)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Event</DialogTitle>
                              <DialogDescription>Update event details and registration form</DialogDescription>
                            </DialogHeader>

                            {selectedEvent && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Event Title</Label>
                                    <Input
                                      value={selectedEvent.title}
                                      onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                                    />
                                  </div>

                                  <div>
                                    <Label>Category</Label>
                                    <Select
                                      value={selectedEvent.category}
                                      onValueChange={(value) => setSelectedEvent({ ...selectedEvent, category: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Workshop">Workshop</SelectItem>
                                        <SelectItem value="Seminar">Seminar</SelectItem>
                                        <SelectItem value="Competition">Competition</SelectItem>
                                        <SelectItem value="Conference">Conference</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label>Date</Label>
                                    <Input
                                      type="date"
                                      value={selectedEvent.date}
                                      onChange={(e) => setSelectedEvent({ ...selectedEvent, date: e.target.value })}
                                    />
                                  </div>

                                  <div>
                                    <Label>Time</Label>
                                    <Input
                                      value={selectedEvent.time}
                                      onChange={(e) => setSelectedEvent({ ...selectedEvent, time: e.target.value })}
                                    />
                                  </div>

                                  <div>
                                    <Label>Location</Label>
                                    <Input
                                      value={selectedEvent.location}
                                      onChange={(e) => setSelectedEvent({ ...selectedEvent, location: e.target.value })}
                                    />
                                  </div>

                                  <div>
                                    <Label>Capacity</Label>
                                    <Input
                                      type="number"
                                      value={selectedEvent.capacity}
                                      onChange={(e) =>
                                        setSelectedEvent({
                                          ...selectedEvent,
                                          capacity: Number.parseInt(e.target.value),
                                        })
                                      }
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label>Speaker/Organizer</Label>
                                  <Input
                                    value={selectedEvent.speaker}
                                    onChange={(e) => setSelectedEvent({ ...selectedEvent, speaker: e.target.value })}
                                  />
                                </div>

                                <div>
                                  <Label>Short Description</Label>
                                  <Textarea
                                    value={selectedEvent.description}
                                    onChange={(e) =>
                                      setSelectedEvent({ ...selectedEvent, description: e.target.value })
                                    }
                                    rows={2}
                                  />
                                </div>

                                <div>
                                  <Label>Full Description</Label>
                                  <Textarea
                                    value={selectedEvent.fullDescription}
                                    onChange={(e) =>
                                      setSelectedEvent({ ...selectedEvent, fullDescription: e.target.value })
                                    }
                                    rows={4}
                                  />
                                </div>

                                <RegistrationFieldEditor
                                  eventData={selectedEvent}
                                  setEventData={setSelectedEvent}
                                  isEditing={true}
                                />

                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setIsEditingEvent(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleUpdateEvent}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Update Event
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                          <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event._id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Resource Management</h3>
                <p className="text-muted-foreground">Manage PYQs, certifications, hackathons, and interviews</p>
            </div>
              <Button onClick={() => setIsCreatingResource(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
            </div>
            <Dialog open={isCreatingResource} onOpenChange={setIsCreatingResource}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Resource</DialogTitle>
                  <DialogDescription>Fill in the details for the new resource.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Label>Title</Label>
                  <Input value={newResource.title} onChange={e => setNewResource({ ...newResource, title: e.target.value })} placeholder="Resource title" />
                  <Label>Description</Label>
                  <Textarea value={newResource.description} onChange={e => setNewResource({ ...newResource, description: e.target.value })} placeholder="Short description" />
                  {/* Category dropdown */}
                  <Label>Category</Label>
                  <Select value={newResource.category} onValueChange={value => setNewResource({ ...newResource, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.flatMap(rt => categoryOptions[rt.key]).map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Always show semester and year fields */}
                  <Label>Year</Label>
                  <Input value={newResource.year} onChange={e => setNewResource({ ...newResource, year: e.target.value })} placeholder="e.g., 2023" />
                  <Label>Semester</Label>
                  <Input value={newResource.semester} onChange={e => setNewResource({ ...newResource, semester: e.target.value })} placeholder="e.g., 4" />
                  {/* Type dropdown */}
                  <Label>Type</Label>
                  <Select value={newResource.type} onValueChange={value => setNewResource({ ...newResource, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map(rt => (
                        <SelectItem key={rt.key} value={rt.key}>{rt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* File upload */}
                  <Label>Document (PDF, DOCX, etc.)</Label>
                  <Input type="file" ref={fileInputRef} accept=".pdf,.doc,.docx,.txt,.zip,.rar,.ppt,.pptx" />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreatingResource(false)}>Cancel</Button>
                    <Button onClick={async () => {
                      let fileId = '';
                      let filename = '';
                      const file = fileInputRef.current?.files?.[0];
                      if (file) {
                        const formData = new FormData();
                        formData.append('file', file);
                        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                        const uploadData = await uploadRes.json();
                        fileId = uploadData.fileId;
                        filename = uploadData.filename;
                      }
                      await handleCreateResource({ ...newResource, fileId, filename, downloads: 0 });
                      setNewResource({ title: '', description: '', category: '', extra: '', type: '', examType: '', year: '', semester: '', downloads: 0 });
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      setIsCreatingResource(false);
                    }}>
                      <Save className="w-4 h-4 mr-2" />
                      Add Resource
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <div className="mt-8">
              {loadingResources ? (
                <p>Loading resources...</p>
              ) : (!Array.isArray(resources) || resources.length === 0) ? (
                <p>No resources found.</p>
              ) : (
                <div className="grid gap-4">
                  {resources.map(resource => (
                    <Card key={resource._id}>
                      <CardHeader>
                        <CardTitle>{resource.title}</CardTitle>
                        <CardDescription>{resource.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {resource.category && <p className="text-sm text-gray-500">Category: {resource.category}</p>}
                        {resource.year && <p className="text-sm text-gray-500">Year: {resource.year}</p>}
                        {resource.semester && <p className="text-sm text-gray-500">Semester: {resource.semester}</p>}
                        {resource.fileId && (
                          <a href={`/api/files/${resource.fileId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm dark:text-blue-300">
                            Download Document{resource.filename ? ` (${resource.filename})` : ''}
                          </a>
                        )}
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" onClick={() => { setEditingResource(resource); setIsEditingResource(true); }}>
                            <Edit className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this resource?')) {
                              await handleDeleteResource(resource._id);
                            }
                          }}>
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            {/* Edit Resource Dialog */}
            <Dialog open={isEditingResource} onOpenChange={setIsEditingResource}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Edit Resource</DialogTitle>
                  <DialogDescription>Update the details for this resource.</DialogDescription>
                </DialogHeader>
                {editingResource && (
                  <div className="space-y-4">
                    <Label>Title</Label>
                    <Input value={editingResource.title} onChange={e => setEditingResource({ ...editingResource, title: e.target.value })} placeholder="Resource title" />
                    <Label>Description</Label>
                    <Textarea value={editingResource.description} onChange={e => setEditingResource({ ...editingResource, description: e.target.value })} placeholder="Short description" />
                    <Label>Category</Label>
                    <Select value={editingResource.category} onValueChange={value => setEditingResource({ ...editingResource, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {resourceTypes.flatMap(rt => categoryOptions[rt.key]).map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Label>Year</Label>
                    <Input value={editingResource.year} onChange={e => setEditingResource({ ...editingResource, year: e.target.value })} placeholder="e.g., 2023" />
                    <Label>Semester</Label>
                    <Input value={editingResource.semester} onChange={e => setEditingResource({ ...editingResource, semester: e.target.value })} placeholder="e.g., 4" />
                    <Label>Type</Label>
                    <Select value={editingResource.type} onValueChange={value => setEditingResource({ ...editingResource, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {resourceTypes.map(rt => (
                          <SelectItem key={rt.key} value={rt.key}>{rt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* File upload for editing */}
                    <Label>Document (PDF, DOCX, etc.)</Label>
                    <Input type="file" onChange={async e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const formData = new FormData();
                        formData.append('file', file);
                        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                        const uploadData = await uploadRes.json();
                        setEditingResource({ ...editingResource, fileId: uploadData.fileId, filename: uploadData.filename });
                      }
                    }} accept=".pdf,.doc,.docx,.txt,.zip,.rar,.ppt,.pptx" />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsEditingResource(false)}>Cancel</Button>
                      <Button onClick={async () => {
                        await handleUpdateResource(editingResource);
                        setIsEditingResource(false);
                      }}>
                        <Save className="w-4 h-4 mr-2" /> Update Resource
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="quizzes">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Quiz Management</h2>
                <div className="flex space-x-2">
                  <Dialog open={isCreatingQuiz} onOpenChange={setIsCreatingQuiz}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Quiz
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Quiz</DialogTitle>
                        <DialogDescription>
                          Create a new quiz with custom questions and settings
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
            <div>
                          <Label>Quiz Title</Label>
                          <Input
                            value={newQuiz.title}
                            onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                            placeholder="Enter quiz title"
                          />
                        </div>
                        <div>
                          <Label>Subject</Label>
                          <Input
                            value={newQuiz.subject}
                            onChange={(e) => setNewQuiz({ ...newQuiz, subject: e.target.value })}
                            placeholder="e.g., Data Structures"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={newQuiz.description}
                            onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                            placeholder="Enter quiz description"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Difficulty</Label>
                            <Select value={newQuiz.difficulty} onValueChange={(value) => setNewQuiz({ ...newQuiz, difficulty: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Question Count</Label>
                            <Input
                              type="number"
                              value={newQuiz.questionCount}
                              onChange={(e) => setNewQuiz({ ...newQuiz, questionCount: parseInt(e.target.value) })}
                              min="1"
                              max="100"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Time Limit (minutes)</Label>
                            <Input
                              type="number"
                              value={newQuiz.timeLimit}
                              onChange={(e) => setNewQuiz({ ...newQuiz, timeLimit: parseInt(e.target.value) })}
                              min="5"
                              max="180"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={newQuiz.isActive}
                              onCheckedChange={(checked) => setNewQuiz({ ...newQuiz, isActive: checked })}
                            />
                            <Label>Active</Label>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsCreatingQuiz(false)}>Cancel</Button>
                          <Button onClick={handleCreateQuiz}>Create Quiz</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                <Dialog open={showQuizUploadDialog} onOpenChange={setShowQuizUploadDialog}>
                  <DialogTrigger asChild>
                      <Button variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        Generate from PDF
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Generate AI Quiz</DialogTitle>
                      <DialogDescription>
                        Upload a PDF and configure your quiz settings
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Subject/Topic</label>
                        <Input
                          placeholder="e.g., Data Structures, Algorithms"
                          value={quizUploadForm.subject}
                          onChange={(e) => setQuizUploadForm({ ...quizUploadForm, subject: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Difficulty</label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={quizUploadForm.difficulty}
                          onChange={(e) => setQuizUploadForm({ ...quizUploadForm, difficulty: e.target.value })}
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Questions</label>
                          <Input
                            type="number"
                            min="5"
                            max="50"
                            value={quizUploadForm.questionCount}
                            onChange={(e) => setQuizUploadForm({ ...quizUploadForm, questionCount: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Time (min)</label>
                          <Input
                            type="number"
                            min="5"
                            max="180"
                            value={quizUploadForm.timeLimit}
                            onChange={(e) => setQuizUploadForm({ ...quizUploadForm, timeLimit: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description (optional)</label>
                        <Input
                          placeholder="Brief description of the quiz"
                          value={quizUploadForm.description}
                          onChange={(e) => setQuizUploadForm({ ...quizUploadForm, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Upload PDF</label>
                        <Input
                          type="file"
                          accept="application/pdf"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            if (file.type !== 'application/pdf') {
                              alert('Please upload a PDF file');
                              return;
                            }
                            setQuizPdfLoading(true);
                            setQuizPdfName(file.name);
                            try {
                              // Upload file
                              const formData = new FormData();
                              formData.append('file', file);
                              formData.append('type', 'quiz-generation');
                              const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                              if (!uploadRes.ok) throw new Error('Failed to upload file');
                              const uploadData = await uploadRes.json();
                              setQuizPdfUploadProgress(50);
                              // Generate quiz using AI
                              const quizRes = await fetch('/api/quiz-generation', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  fileId: uploadData.fileId,
                                  subject: quizUploadForm.subject,
                                  difficulty: quizUploadForm.difficulty,
                                  questionCount: quizUploadForm.questionCount,
                                  timeLimit: quizUploadForm.timeLimit,
                                  description: quizUploadForm.description
                                })
                              });
                              if (!quizRes.ok) throw new Error('Failed to generate quiz');
                              const quizData = await quizRes.json();
                              if (quizData.success) {
                                setQuizzes((prev) => [quizData.quiz, ...prev]);
                                setQuizPdfLoading(false);
                                setQuizPdfUploadProgress(100);
                                setShowQuizUploadDialog(false);
                                setQuizUploadForm({ subject: '', difficulty: 'medium', questionCount: 10, timeLimit: 30, description: '' });
                                setTimeout(() => {
                                  setQuizPdfUploadProgress(0);
                                  // Show success message
                                  toast({
                                    title: "Quiz Generated Successfully!",
                                    description: "Your quiz has been created and is now available in the quiz list. You can attempt it whenever you want.",
                                  });
                                }, 1000);
                              } else {
                                throw new Error(quizData.error || 'Failed to generate quiz');
                              }
                            } catch (err) {
                              alert('Failed to generate quiz.');
                              setQuizPdfLoading(false);
                              setQuizPdfName(null);
                            }
                          }}
                          disabled={quizPdfLoading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum file size: 10MB. Supported: PDF files only.
                        </p>
                      </div>
                      {quizPdfLoading && <div className="text-xs text-blue-600">Generating quiz from your file...</div>}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              </div>

              {/* Quiz List */}
              {loadingQuizzes ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading quizzes...</p>
                </div>
              ) : quizzes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No quizzes created yet.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes.map((quiz) => (
                    <Card key={quiz._id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-border">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={quiz.isActive ? "default" : "secondary"} className="text-xs">
                                {quiz.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant="outline" className={
                                quiz.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' :
                                quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
                              }>
                                {quiz.difficulty}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg leading-tight mb-2">{quiz.title}</CardTitle>
                            <CardDescription className="text-sm line-clamp-2">{quiz.description}</CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setEditingQuiz(quiz);
                                setIsEditingQuiz(true);
                              }}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleQuizStatus(quiz._id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                {quiz.isActive ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteQuiz(quiz._id)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <BookOpen className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Subject</span>
                            </div>
                            <p className="font-medium text-foreground">{quiz.subject}</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Brain className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Questions</span>
                            </div>
                            <p className="font-medium text-foreground">{quiz.questionCount}</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Time Limit</span>
                            </div>
                            <p className="font-medium text-foreground">{quiz.timeLimit} min</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Participants</span>
                            </div>
                            <p className="font-medium text-foreground">{quiz.participants || 0}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handlePublishQuiz(quiz._id, !quiz.isActive)}
                          >
                            {quiz.isActive ? "Unpublish" : "Publish"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              // This will be handled by the notification system
                              // Students will request access through notifications
                            }}
                          >
                            Assign to All
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Edit Quiz Dialog */}
              <Dialog open={isEditingQuiz} onOpenChange={setIsEditingQuiz}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Quiz</DialogTitle>
                    <DialogDescription>
                      Update quiz details and settings
                    </DialogDescription>
                  </DialogHeader>
                  {editingQuiz && (
                    <div className="space-y-4">
                      <div>
                        <Label>Quiz Title</Label>
                        <Input
                          value={editingQuiz.title}
                          onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                          placeholder="Enter quiz title"
                        />
                      </div>
                      <div>
                        <Label>Subject</Label>
                        <Input
                          value={editingQuiz.subject}
                          onChange={(e) => setEditingQuiz({ ...editingQuiz, subject: e.target.value })}
                          placeholder="e.g., Data Structures"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={editingQuiz.description}
                          onChange={(e) => setEditingQuiz({ ...editingQuiz, description: e.target.value })}
                          placeholder="Enter quiz description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Difficulty</Label>
                          <Select value={editingQuiz.difficulty} onValueChange={(value) => setEditingQuiz({ ...editingQuiz, difficulty: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Question Count</Label>
                          <Input
                            type="number"
                            value={editingQuiz.questionCount}
                            onChange={(e) => setEditingQuiz({ ...editingQuiz, questionCount: parseInt(e.target.value) })}
                            min="1"
                            max="100"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Time Limit (minutes)</Label>
                          <Input
                            type="number"
                            value={editingQuiz.timeLimit}
                            onChange={(e) => setEditingQuiz({ ...editingQuiz, timeLimit: parseInt(e.target.value) })}
                            min="5"
                            max="180"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={editingQuiz.isActive}
                            onCheckedChange={(checked) => setEditingQuiz({ ...editingQuiz, isActive: checked })}
                          />
                          <Label>Active</Label>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsEditingQuiz(false)}>Cancel</Button>
                        <Button onClick={handleUpdateQuiz}>Update Quiz</Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Notifications & Requests</h2>
                <Badge variant="outline" className="text-sm bg-background border-border">
                  {notifications.filter(n => !n.read).length} unread
                </Badge>
              </div>
              
              {loadingNotifications ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No notifications found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <Card 
                      key={notification._id} 
                      className={`transition-all duration-200 hover:shadow-md ${
                        !notification.read 
                          ? "border-primary/20 bg-primary/5 dark:bg-primary/10" 
                          : "border-border bg-card"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 transition-colors ${
                                !notification.read 
                                  ? "bg-primary animate-pulse" 
                                  : "bg-muted-foreground/30"
                              }`}
                            />
                            <div className="flex-1">
                              <h3 className="font-medium text-foreground">{notification.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                              <p className="text-xs text-muted-foreground/70 mt-2">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                              {notification.status && (
                                <Badge 
                                  variant={
                                    notification.status === 'pending' ? 'outline' : 
                                    notification.status === 'approved' ? 'default' : 'destructive'
                                  }
                                  className={`mt-2 transition-colors ${
                                    notification.status === 'pending' 
                                      ? 'border-primary/50 text-primary bg-primary/10 dark:bg-primary/20' 
                                      : ''
                                  }`}
                                >
                                  {notification.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {notification.type === "quiz_assignment" && notification.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleNotificationAction(notification._id, 'approve')}
                                  className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white transition-colors"
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleNotificationAction(notification._id, 'reject')}
                                  className="transition-colors"
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="flashcards">
            <div>
              <h2 className="text-xl font-semibold mb-4">AI-Powered Flash Cards</h2>
              <div className="mb-6 flex justify-end">
                <Dialog open={showFlashcardDialog} onOpenChange={setShowFlashcardDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Flash Cards
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <span>Generate AI Flash Cards</span>
                      </DialogTitle>
                      <DialogDescription>
                        Upload a PDF or notes to generate flash cards
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Number of Cards</label>
                          <Input
                            type="number"
                            min="5"
                            max="50"
                            value={flashcardUploadForm.cardCount}
                            onChange={(e) => setFlashcardUploadForm({ ...flashcardUploadForm, cardCount: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Subject/Topic</label>
                          <Input
                            placeholder="e.g., Data Structures, Algorithms"
                            value={flashcardUploadForm.subject}
                            onChange={(e) => setFlashcardUploadForm({ ...flashcardUploadForm, subject: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description (optional)</label>
                        <Input
                          placeholder="Brief description of the flash cards"
                          value={flashcardUploadForm.description}
                          onChange={(e) => setFlashcardUploadForm({ ...flashcardUploadForm, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Upload PDF or Notes</label>
                        <Input
                          type="file"
                          accept=".pdf,.txt,.md"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            if (!(file.type === 'application/pdf' || file.type === 'text/plain' || file.name.endsWith('.md'))) {
                              alert('Please upload a PDF, TXT, or Markdown file');
                              return;
                            }
                            if (file.size > 10 * 1024 * 1024) {
                              alert('File size should be less than 10MB');
                              return;
                            }
                            setIsFlashcardUploading(true);
                            setFlashcardUploadProgress(0);
                            try {
                              // Upload file first
                              const formData = new FormData();
                              formData.append('file', file);
                              formData.append('type', 'flashcard-generation');
                              const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                              if (!uploadRes.ok) throw new Error('Failed to upload file');
                              const uploadData = await uploadRes.json();
                              setFlashcardUploadProgress(50);

                              // Generate flash cards using AI
                              const flashcardRes = await fetch('/api/flashcard-generation', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  fileId: uploadData.fileId,
                                  filename: uploadData.filename,
                                  ...flashcardUploadForm
                                })
                              });
                              if (!flashcardRes.ok) throw new Error('Failed to generate flash cards');
                              const flashcardData = await flashcardRes.json();
                              
                              if (flashcardData.success) {
                                const newSet = {
                                  id: flashcardData.flashcardSet._id,
                                  title: flashcardData.flashcardSet.title,
                                  description: flashcardData.flashcardSet.description,
                                  sourceFile: file.name,
                                  cardCount: flashcardData.flashcardSet.cardCount,
                                  cards: flashcardData.flashcardSet.cards,
                                  createdAt: flashcardData.flashcardSet.createdAt
                                };
                                setFlashcardSets(prev => [newSet, ...prev]);
                                
                                // Show success message
                                toast({
                                  title: "Flash Cards Generated Successfully!",
                                  description: "Your flash card set has been created and is now available in the flash cards list.",
                                });
                              } else {
                                throw new Error(flashcardData.error || 'Failed to generate flash cards');
                              }
                              
                              setIsFlashcardUploading(false);
                              setFlashcardUploadProgress(100);
                              setShowFlashcardDialog(false);
                              setFlashcardUploadForm({ subject: '', description: '', cardCount: 10 });
                              setTimeout(() => setFlashcardUploadProgress(0), 1000);
                            } catch (error) {
                              console.error('Error generating flash cards:', error);
                              toast({
                                title: "Error",
                                description: "Failed to generate flash cards. Please try again.",
                                variant: "destructive"
                              });
                              setIsFlashcardUploading(false);
                              setFlashcardUploadProgress(0);
                            }
                          }}
                          disabled={isFlashcardUploading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum file size: 10MB. Supported: PDF, TXT, and Markdown files.
                        </p>
                      </div>
                      {isFlashcardUploading && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">Generating flash cards from your file...</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${flashcardUploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {flashcardUploadProgress < 50 ? 'Uploading file...' : 'Processing content and generating flash cards...'}
                          </p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {!selectedFlashcardSet ? (
                // Flash Card Sets List
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flashcardSets.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                      <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No flash card sets created yet. Upload your notes to get started!</p>
                  </div>
                ) : (
                  flashcardSets.map((set) => (
                    <Card key={set.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                      setSelectedFlashcardSet(set);
                      setCurrentFlashcardIndex(0);
                      setShowFlashcardAnswer(false);
                    }}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{set.title}</CardTitle>
                            <CardDescription>{set.description || 'No description'}</CardDescription>
                          </div>
                          <Badge variant="outline">{set.cards.length} cards</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Source:</span>
                            <span className="font-medium truncate max-w-32">{set.sourceFile}</span>
                          </div>
                                                      <div className="flex items-center justify-between">
                              <span className="text-gray-600">Created:</span>
                              <span className="font-medium">{new Date(set.createdAt).toLocaleDateString()}</span>
                            </div>
                            {new Date(set.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
                              <div className="flex items-center justify-center mt-2">
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                  <Star className="w-3 h-3 mr-1" />
                                  New
                                </Badge>
                              </div>
                            )}
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          Study Set
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              ) : (
                // Study Mode for Selected Set
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                    <Button variant="outline" onClick={() => {
                      setSelectedFlashcardSet(null);
                      setCurrentFlashcardIndex(0);
                      setShowFlashcardAnswer(false);
                    }}>
                      ← Back to Sets
                    </Button>
                    <h3 className="text-lg font-semibold mt-2">{selectedFlashcardSet.title}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      Card {currentFlashcardIndex + 1} of {selectedFlashcardSet.cards.length}
                    </span>
                    </div>
                  </div>
                  <div className="max-w-2xl mx-auto">
                    <Card className="min-h-[300px] flex flex-col justify-center items-center p-8">
                      <div className="text-center mb-6">
                        <h4 className="text-xl font-semibold mb-4">
                          {selectedFlashcardSet.cards[currentFlashcardIndex].question}
                        </h4>
                        {showFlashcardAnswer && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-700">
                              {selectedFlashcardSet.cards[currentFlashcardIndex].answer}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-4">
                              <Button
                          onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
                                variant="outline"
                        >
                          {showFlashcardAnswer ? 'Hide Answer' : 'Show Answer'}
                        </Button>
                        <Button
                                onClick={() => {
                                  if (currentFlashcardIndex < selectedFlashcardSet.cards.length - 1) {
                                    setCurrentFlashcardIndex(currentFlashcardIndex + 1);
                              setShowFlashcardAnswer(false);
                                  }
                                }}
                          disabled={currentFlashcardIndex >= selectedFlashcardSet.cards.length - 1}
                              >
                                Next Card
                              </Button>
                            </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">User Management</h3>
              <p className="text-muted-foreground">Manage student accounts and permissions</p>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Platform Settings</h3>
              <p className="text-muted-foreground">Configure platform settings and preferences</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {(activeTab === 'flashcards') && <Chatbot />}
    </div>
  )
}
