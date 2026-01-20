
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

  getTestimonials: async () => {
    if (isSupabaseReady()) {
      const { data, error } = await supabase!
        .from('testimonials')
        .select('*')
        .eq('is_moderated', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } else {
      return getLocal('testimonials').filter((t: any) => t.is_moderated).sort((a: any, b: any) => b.created_at.localeCompare(a.created_at));
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
        .select('submission_timestamp, persons(full_name)')
        .eq('consent_public_use', true)
        .order('submission_timestamp', { ascending: false });

      if (error) return [];
      return data.map(r => ({
        name: (r.persons as any)?.full_name || "Supporter",
        timestamp: r.submission_timestamp
      }));
    } else {
      const records = getLocal('petition_records').filter((r: any) => r.consent_public_use);
      const persons = getLocal('persons');
      return records.map((r: any) => ({
        name: persons.find((p: any) => p.id === r.person_id)?.full_name || "Supporter",
        timestamp: r.submission_timestamp
      })).sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp));
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
