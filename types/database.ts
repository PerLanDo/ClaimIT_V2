export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'student' | 'staff' | 'teacher' | 'admin';
          address?: string;
          mobile_number?: string;
          school_id_number?: string;
          department?: string;
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          role: 'student' | 'staff' | 'teacher' | 'admin';
          address?: string;
          mobile_number?: string;
          school_id_number?: string;
          department?: string;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'student' | 'staff' | 'teacher' | 'admin';
          address?: string;
          mobile_number?: string;
          school_id_number?: string;
          department?: string;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          location: string;
          date_lost_found: string;
          image_url?: string;
          status: 'active' | 'claimed' | 'archived';
          item_type: 'lost' | 'found';
          posted_by: string;
          qr_code?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          location: string;
          date_lost_found: string;
          image_url?: string;
          status?: 'active' | 'claimed' | 'archived';
          item_type: 'lost' | 'found';
          posted_by: string;
          qr_code?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          location?: string;
          date_lost_found?: string;
          image_url?: string;
          status?: 'active' | 'claimed' | 'archived';
          item_type?: 'lost' | 'found';
          posted_by?: string;
          qr_code?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      claims: {
        Row: {
          id: string;
          item_id: string;
          claimant_id: string;
          reason: string;
          proof_image_url?: string;
          status: 'pending' | 'approved' | 'rejected';
          reviewed_by?: string;
          reviewed_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          claimant_id: string;
          reason: string;
          proof_image_url?: string;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: string;
          reviewed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          claimant_id?: string;
          reason?: string;
          proof_image_url?: string;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: string;
          reviewed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          item_id?: string;
          claim_id?: string;
          sender_id: string;
          recipient_id: string;
          content: string;
          read_at?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id?: string;
          claim_id?: string;
          sender_id: string;
          recipient_id: string;
          content: string;
          read_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          claim_id?: string;
          sender_id?: string;
          recipient_id?: string;
          content?: string;
          read_at?: string;
          created_at?: string;
        };
      };
    };
  };
}

export type UserRole = 'student' | 'staff' | 'teacher' | 'admin';
export type ItemType = 'lost' | 'found';
export type ItemStatus = 'active' | 'claimed' | 'archived';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';