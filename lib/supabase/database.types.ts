export type Database = {
  public: {
    Tables: {
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
      };
    };
  };
};
