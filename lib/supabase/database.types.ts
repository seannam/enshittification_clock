export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      ai_providers: {
        Row: {
          id: string;
          name: string;
          base_url: string;
          api_key_encrypted: string;
          model: string;
          enabled: boolean;
          priority: number;
          max_tokens: number;
          temperature: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          base_url: string;
          api_key_encrypted: string;
          model: string;
          enabled?: boolean;
          priority?: number;
          max_tokens?: number;
          temperature?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          base_url?: string;
          api_key_encrypted?: string;
          model?: string;
          enabled?: boolean;
          priority?: number;
          max_tokens?: number;
          temperature?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      enshittification_events: {
        Row: {
          id: string;
          service_id: string;
          title: string;
          description: string;
          event_date: string;
          severity: 'minor' | 'moderate' | 'significant' | 'major' | 'critical';
          source_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          title: string;
          description: string;
          event_date: string;
          severity: 'minor' | 'moderate' | 'significant' | 'major' | 'critical';
          source_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          title?: string;
          description?: string;
          event_date?: string;
          severity?: 'minor' | 'moderate' | 'significant' | 'major' | 'critical';
          source_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'enshittification_events_service_id_fkey';
            columns: ['service_id'];
            isOneToOne: false;
            referencedRelation: 'services';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      event_severity: 'minor' | 'moderate' | 'significant' | 'major' | 'critical';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
