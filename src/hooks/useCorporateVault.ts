import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/corporate-vault`;

export interface BusinessEntity {
  id?: string;
  company_name: string;
  entity_type: string;
  state_of_incorporation: string;
  incorporation_date?: string;
  fiscal_year_end?: string;
  hawaii_business_id?: string;
  irs_ein?: string;
  registered_agent_name?: string;
  registered_agent_address?: string;
  registered_agent_phone?: string;
}

export interface Domain {
  id?: string;
  domain_name: string;
  registrar?: string;
  expiration_date?: string;
  auto_renew: boolean;
  primary_use?: string;
  notes?: string;
}

export interface CorporateEvent {
  id?: string;
  title: string;
  description?: string;
  event_date: string;
  event_type: string;
  is_reminder: boolean;
  reminder_days: number;
}

export function useCorporateVault(userId: string | undefined) {
  const [entity, setEntity] = useState<BusinessEntity | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [events, setEvents] = useState<CorporateEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      // Fetch entity
      const entityRes = await fetch(`${FUNCTION_URL}/entity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'get' }),
      });
      
      if (entityRes.ok) {
        const entityData = await entityRes.json();
        if (entityData && entityData.id) {
          setEntity(entityData);
        }
      }

      // Fetch domains
      const domainsRes = await fetch(`${FUNCTION_URL}/domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'get' }),
      });
      
      if (domainsRes.ok) {
        const domainsData = await domainsRes.json();
        setDomains(domainsData || []);
      }

      // Fetch events
      const eventsRes = await fetch(`${FUNCTION_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'get' }),
      });
      
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveEntity = async (data: Partial<BusinessEntity>) => {
    if (!userId) return;
    try {
      const response = await fetch(`${FUNCTION_URL}/entity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save entity');
      }
      
      const result = await response.json();
      setEntity(result);
      toast.success('Business information saved');
      return result;
    } catch (error) {
      console.error('Error saving entity:', error);
      toast.error('Failed to save business information');
      throw error;
    }
  };

  const addDomain = async (data: Omit<Domain, 'id'>) => {
    if (!userId) return;
    try {
      const response = await fetch(`${FUNCTION_URL}/domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add domain');
      }
      
      const result = await response.json();
      setDomains(prev => [...prev, result]);
      toast.success('Domain added');
      return result;
    } catch (error) {
      console.error('Error adding domain:', error);
      toast.error('Failed to add domain');
      throw error;
    }
  };

  const updateDomain = async (id: string, data: Partial<Domain>) => {
    if (!userId) return;
    try {
      const response = await fetch(`${FUNCTION_URL}/domain?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update domain');
      }
      
      const result = await response.json();
      setDomains(prev => prev.map(d => d.id === id ? result : d));
      toast.success('Domain updated');
      return result;
    } catch (error) {
      console.error('Error updating domain:', error);
      toast.error('Failed to update domain');
      throw error;
    }
  };

  const deleteDomain = async (id: string) => {
    if (!userId) return;
    try {
      const response = await fetch(`${FUNCTION_URL}/domain?id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete domain');
      }
      
      setDomains(prev => prev.filter(d => d.id !== id));
      toast.success('Domain deleted');
    } catch (error) {
      console.error('Error deleting domain:', error);
      toast.error('Failed to delete domain');
      throw error;
    }
  };

  // Corporate Events CRUD
  const addEvent = async (data: Omit<CorporateEvent, 'id'>) => {
    if (!userId) return;
    try {
      const response = await fetch(`${FUNCTION_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add event');
      }
      
      const result = await response.json();
      setEvents(prev => [...prev, result]);
      toast.success('Event added');
      return result;
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to add event');
      throw error;
    }
  };

  const updateEvent = async (id: string, data: Partial<CorporateEvent>) => {
    if (!userId) return;
    try {
      const response = await fetch(`${FUNCTION_URL}/event?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update event');
      }
      
      const result = await response.json();
      setEvents(prev => prev.map(e => e.id === id ? result : e));
      toast.success('Event updated');
      return result;
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    if (!userId) return;
    try {
      const response = await fetch(`${FUNCTION_URL}/event?id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete event');
      }
      
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Event deleted');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
      throw error;
    }
  };

  return {
    entity,
    domains,
    events,
    loading,
    saveEntity,
    addDomain,
    updateDomain,
    deleteDomain,
    addEvent,
    updateEvent,
    deleteEvent,
    refresh: loadData,
  };
}
