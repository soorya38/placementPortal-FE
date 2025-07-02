import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { CalendarPlus, Bell, Target, Trash, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ENDPOINTS } from '@/constants/api';

interface CalendarEvent {
  id: string;
  date: Date;
  type: 'notification' | 'target';
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    type: 'notification' as 'notification' | 'target',
    title: '',
    description: ''
  });

  const canManageEvents = user?.role === 'Admin' || user?.role === 'Manager';

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(ENDPOINTS.EVENT.LIST, {
          headers: {
            'ngrok-skip-browser-warning': '1'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        const formattedEvents: CalendarEvent[] = (data || []).map((event: any) => ({
          id: event.id,
          date: new Date(event.date),
          type: event.type,
          title: event.title,
          description: event.description,
          createdBy: event.created_by,
          createdAt: event.created_at
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: "Error",
          description: "Failed to fetch calendar events",
          variant: "destructive"
        });
      }
    };

    fetchEvents();
  }, []);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !formData.title.trim()) return;

    if (editingEvent) {
      try {
        // Update existing event
        const response = await fetch(ENDPOINTS.EVENT.UPDATE(editingEvent.id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            
                'ngrok-skip-browser-warning': '1'  
          },
          body: JSON.stringify({
            date: selectedDate.toISOString(),
            type: formData.type,
            title: formData.title,
            description: formData.description,
            created_by: user?.username || ''
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update event');
        }

        const updatedEvent = await response.json();
        setEvents(prev => prev.map(event => 
          event.id === editingEvent.id 
            ? {
                id: updatedEvent.id,
                date: new Date(updatedEvent.date),
                type: updatedEvent.type,
                title: updatedEvent.title,
                description: updatedEvent.description,
                createdBy: updatedEvent.created_by,
                createdAt: updatedEvent.created_at
              }
            : event
        ));

        toast({
          title: "Event Updated",
          description: "Calendar event has been updated successfully.",
        });
      } catch (error) {
        console.error('Error updating event:', error);
        toast({
          title: "Error",
          description: "Failed to update calendar event",
          variant: "destructive"
        });
      }
    } else {
      try {
        // Create new event via API
        const response = await fetch(ENDPOINTS.EVENT.CREATE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            
                'ngrok-skip-browser-warning': '1'
              
          },
          body: JSON.stringify({
            date: selectedDate.toISOString(),
            type: formData.type,
            title: formData.title,
            description: formData.description,
            created_by: user?.username || ''
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create event');
        }

        const newEvent = await response.json();
        setEvents(prev => [...prev, {
          id: newEvent.id,
          date: new Date(newEvent.date),
          type: newEvent.type,
          title: newEvent.title,
          description: newEvent.description,
          createdBy: newEvent.created_by,
          createdAt: newEvent.created_at
        }]);

        toast({
          title: "Event Created",
          description: "New calendar event has been added successfully.",
        });
      } catch (error) {
        console.error('Error creating event:', error);
        toast({
          title: "Error",
          description: "Failed to create calendar event",
          variant: "destructive"
        });
      }
    }

    // Reset form
    setFormData({ type: 'notification', title: '', description: '' });
    setEditingEvent(null);
    setIsEventDialogOpen(false);
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedDate(event.date);
    setFormData({
      type: event.type,
      title: event.title,
      description: event.description
    });
    setIsEventDialogOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    try {
      const response = await fetch(ENDPOINTS.EVENT.DELETE(eventId), {
        method: 'DELETE',
       
          headers: {
            'ngrok-skip-browser-warning': '1'
          }
        
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast({
        title: "Event Deleted",
        description: "Calendar event has been removed.",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete calendar event",
        variant: "destructive"
      });
    }
  };

  const handleCreateNew = () => {
    setEditingEvent(null);
    setFormData({ type: 'notification', title: '', description: '' });
    setIsEventDialogOpen(true);
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Manage your schedule and important dates</p>
        </div>
        
        {canManageEvents && (
          <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateNew}>
                <CalendarPlus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </DialogTitle>
                <DialogDescription>
                  {editingEvent ? 'Update the event details below.' : 'Fill in the details to create a new event.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Selected Date</Label>
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {selectedDate ? format(selectedDate, 'PPP') : 'No date selected'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: 'notification' | 'target') => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notification">
                        <div className="flex items-center">
                          <Bell className="h-4 w-4 mr-2" />
                          Notification
                        </div>
                      </SelectItem>
                      <SelectItem value="target">
                        <div className="flex items-center">
                          <Target className="h-4 w-4 mr-2" />
                          Target
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!selectedDate || !formData.title.trim()}>
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>
              Select a date to view or manage events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border pointer-events-auto"
              modifiers={{
                hasEvents: (date) => getEventsForDate(date).length > 0
              }}
              modifiersStyles={{
                hasEvents: { 
                  backgroundColor: 'rgb(59 130 246 / 0.1)', 
                  color: 'rgb(59 130 246)',
                  fontWeight: 'bold'
                }
              }}
            />
            <div className="mt-4 text-sm text-gray-600">
              <p>• Blue highlighted dates have events</p>
              <p>• Click on a date to view or add events</p>
            </div>
          </CardContent>
        </Card>

        {/* Events for Selected Date */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Select a Date'}
            </CardTitle>
            <CardDescription>
              {selectedDate 
                ? `${selectedDateEvents.length} event(s) on this date`
                : 'Choose a date to view events'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDate && selectedDateEvents.length === 0 && (
              <p className="text-gray-500 text-sm">No events on this date</p>
            )}
            
            {selectedDateEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {event.type === 'notification' ? (
                      <Bell className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Target className="h-4 w-4 text-green-500" />
                    )}
                    <Badge variant={event.type === 'notification' ? 'default' : 'secondary'}>
                      {event.type}
                    </Badge>
                  </div>
                  
                  {canManageEvents && (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(event)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-gray-600">{event.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Created by {event.createdBy}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
