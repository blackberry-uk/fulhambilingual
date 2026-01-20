
import { supabase } from './supabase';
import { Person, PetitionRecord, Testimonial, ForumThread, Language } from '../types';

// Fallback logic for when Supabase is not configured
const isSupabaseReady = () => !!supabase;

// Simple LocalStorage Fallback for Resilience
const getLocal = (key: string) => JSON.parse(localStorage.getItem(`fb_${key}`) || '[]');
const setLocal = (key: string, data: any[]) => localStorage.setItem(`fb_${key}`, JSON.stringify(data));

export const storage = {
  addPerson: async (person: Person) => {
    if (isSupabaseReady()) {
      const { data, error } = await supabase!
        .from('persons')
        .upsert({
          full_name: person.full_name,
          email_address: person.email_address,
          relationship_to_school: person.relationship_to_school,
          student_year_groups: person.student_year_groups,
          submission_language: person.submission_language
        }, { onConflict: 'email_address' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const persons = getLocal('persons');
      const newPerson = { ...person, id: person.id || Math.random().toString(36).substr(2, 9) };
      const index = persons.findIndex((p: any) => p.email_address === person.email_address);
      if (index > -1) persons[index] = newPerson;
      else persons.push(newPerson);
      setLocal('persons', persons);
      return newPerson;
    }
  },

  addPetitionRecord: async (record: PetitionRecord) => {
    if (isSupabaseReady()) {
      const { data, error } = await supabase!
        .from('petition_records')
        .insert({
          person_id: record.person_id,
          petition_support: record.petition_support,
          supporting_comment: record.supporting_comment,
          consent_public_use: record.consent_public_use,
          comment_en: record.comment_en,
          comment_fr: record.comment_fr
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const records = getLocal('petition_records');
      const newRecord = { ...record, id: Math.random().toString(36).substr(2, 9) };
      records.push(newRecord);
      setLocal('petition_records', records);
      return newRecord;
    }
  },

  getPersonByEmail: async (email: string) => {
    if (isSupabaseReady()) {
      const { data, error } = await supabase!
        .from('persons')
        .select('*')
        .eq('email_address', email.toLowerCase().trim())
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return data;
    } else {
      const persons = getLocal('persons');
      return persons.find((p: any) => p.email_address.toLowerCase() === email.toLowerCase().trim());
    }
  },

  addTestimonial: async (testimonial: Testimonial) => {
    if (isSupabaseReady()) {
      const { data, error } = await supabase!
        .from('testimonials')
        .insert({
          person_name: testimonial.person_name,
          content: testimonial.content,
          content_translated: testimonial.content_translated,
          is_moderated: testimonial.is_moderated,
          language: testimonial.language
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const items = getLocal('testimonials');
      const newItem = { ...testimonial, id: Math.random().toString(36).substr(2, 9) };
      items.push(newItem);
      setLocal('testimonials', items);
      return newItem;
    }
  },
  updateTestimonial: async (personName: string, updates: Partial<Testimonial>) => {
    if (isSupabaseReady()) {
      // Only include fields that are actually provided
      const updateData: any = {};
      if (updates.person_name !== undefined) updateData.person_name = updates.person_name;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.content_translated !== undefined) updateData.content_translated = updates.content_translated;
      if (updates.language !== undefined) updateData.language = updates.language;
      if (updates.is_moderated !== undefined) updateData.is_moderated = updates.is_moderated;

      const { data, error } = await supabase!
        .from('testimonials')
        .update(updateData)
        .eq('person_name', personName)
        .select();

      if (error) throw error;
      return data;
    } else {
      const items = getLocal('testimonials');
      const index = items.findIndex((t: any) => t.person_name === personName);
      if (index > -1) {
        items[index] = { ...items[index], ...updates };
        setLocal('testimonials', items);
      }
      return items[index];
    }
  },

  getTestimonials: async () => {
    if (isSupabaseReady()) {
      const { data: testimonials, error } = await supabase!
        .from('testimonials')
        .select('*')
        .eq('is_moderated', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!testimonials) return [];

      const { data: persons } = await supabase!
        .from('persons')
        .select('full_name, relationship_to_school, student_year_groups');

      const personMap = new Map(persons?.map(p => [p.full_name, p]) || []);

      return testimonials.map(t => {
        const p = personMap.get(t.person_name);
        return {
          ...t,
          relationship: p?.relationship_to_school || [],
          years: p?.student_year_groups || []
        };
      });
    } else {
      const testimonials = getLocal('testimonials').filter((t: any) => t.is_moderated);
      const persons = getLocal('persons');
      return testimonials.map((t: any) => {
        const p = persons.find((p: any) => p.full_name === t.person_name);
        return {
          ...t,
          relationship: p?.relationship_to_school || [],
          years: p?.student_year_groups || []
        };
      }).sort((a: any, b: any) => b.created_at.localeCompare(a.created_at));
    }
  },

  getForumThreads: async () => {
    if (isSupabaseReady()) {
      const { data, error } = await supabase!
        .from('forum_threads')
        .select('*, forum_replies(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } else {
      return getLocal('forum_threads').sort((a: any, b: any) => b.created_at.localeCompare(a.created_at));
    }
  },

  addForumThread: async (thread: ForumThread) => {
    if (isSupabaseReady()) {
      const { data, error } = await supabase!
        .from('forum_threads')
        .insert({
          title: thread.title,
          author_name: thread.author_name,
          content: thread.content,
          ai_summary: thread.ai_summary,
          language: thread.language
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const threads = getLocal('forum_threads');
      const newThread = { ...thread, id: Math.random().toString(36).substr(2, 9), forum_replies: [] };
      threads.push(newThread);
      setLocal('forum_threads', threads);
      return newThread;
    }
  },

  updateConsent: async (email: string, consent: boolean, comment?: string) => {
    if (isSupabaseReady()) {
      const { data: person, error: pError } = await supabase!
        .from('persons')
        .select('id')
        .eq('email_address', email)
        .single();

      if (pError || !person) return false;

      const { error: rError } = await supabase!
        .from('petition_records')
        .update({
          consent_public_use: consent,
          supporting_comment: comment
        })
        .eq('person_id', person.id);

      return !rError;
    } else {
      const persons = getLocal('persons');
      const person = persons.find((p: any) => p.email_address === email);
      if (!person) return false;

      const records = getLocal('petition_records');
      const recordIndex = records.findIndex((r: any) => r.person_id === person.id);
      if (recordIndex > -1) {
        records[recordIndex].consent_public_use = consent;
        if (comment) records[recordIndex].supporting_comment = comment;
        setLocal('petition_records', records);
        return true;
      }
      return false;
    }
  },

  getPetitionStats: async () => {
    if (isSupabaseReady()) {
      const { count, error } = await supabase!
        .from('petition_records')
        .select('*', { count: 'exact', head: true })
        .eq('petition_support', true);

      if (error) return { total: 0 };
      return { total: count || 0 };
    } else {
      return { total: getLocal('petition_records').length };
    }
  },

  getPublicSignatories: async () => {
    if (isSupabaseReady()) {
      const { data, error } = await supabase!
        .from('petition_records')
        .select(`
          submission_timestamp,
          consent_public_use,
          supporting_comment,
          persons(full_name, relationship_to_school, student_year_groups)
        `)
        .eq('petition_support', true);

      if (error) return [];

      // Fetch all testimonial IDs to map them
      const { data: testims } = await supabase!
        .from('testimonials')
        .select('id, person_name')
        .eq('is_moderated', true);

      const testimMap = new Map(testims?.map(t => [t.person_name, t.id]) || []);

      return data.map(r => {
        const fullName = (r.persons as any)?.full_name || "Supporter";
        return {
          name: r.consent_public_use ? fullName : "Anonymous",
          relationship: (r.persons as any)?.relationship_to_school || [],
          years: (r.persons as any)?.student_year_groups || [],
          timestamp: r.submission_timestamp,
          hasTestimonial: !!r.supporting_comment && r.consent_public_use,
          testimonialId: r.consent_public_use ? testimMap.get(fullName) : null,
          consent: r.consent_public_use
        };
      });
    } else {
      const records = getLocal('petition_records').filter((r: any) => r.petition_support);
      const persons = getLocal('persons');
      const testims = getLocal('testimonials');
      return records.map((r: any) => {
        const p = persons.find((p: any) => p.id === r.person_id);
        const t = testims.find((t: any) => t.person_name === p?.full_name);
        return {
          name: r.consent_public_use ? (p?.full_name || "Supporter") : "Anonymous",
          relationship: p?.relationship_to_school || [],
          years: p?.student_year_groups || [],
          timestamp: r.submission_timestamp,
          hasTestimonial: !!r.supporting_comment && r.consent_public_use,
          testimonialId: r.consent_public_use ? t?.id : null,
          consent: r.consent_public_use
        };
      });
    }
  },

  getAllPersons: async () => {
    if (isSupabaseReady()) {
      const { data, error } = await supabase!
        .from('persons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } else {
      return getLocal('persons');
    }
  },

  getAllPetitionRecords: async () => {
    if (isSupabaseReady()) {
      const { data, error } = await supabase!
        .from('petition_records')
        .select('*')
        .order('submission_timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } else {
      return getLocal('petition_records');
    }
  },

  async getSiteContent(key: string): Promise<{ en: string; fr: string } | null> {
    if (isSupabaseReady()) {
      const { data, error } = await supabase!
        .from('site_content')
        .select('en_content, fr_content')
        .eq('key', key)
        .single();

      if (error) {
        console.error('Error fetching site content:', error);
        return null;
      }
      return { en: data.en_content, fr: data.fr_content };
    }
    return null;
  }
};
