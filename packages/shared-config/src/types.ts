export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          interests: string[]
          age: number
          gender: string
          location: string | null
          country: string | null
          notifications_enabled: boolean
          ad_frequency_preference: string
          history_widget_enabled: boolean
          onboarding_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          interests?: string[]
          age?: number
          gender?: string
          location?: string | null
          country?: string | null
          notifications_enabled?: boolean
          ad_frequency_preference?: string
          history_widget_enabled?: boolean
          onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          interests?: string[]
          age?: number
          gender?: string
          location?: string | null
          country?: string | null
          notifications_enabled?: boolean
          ad_frequency_preference?: string
          history_widget_enabled?: boolean
          onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ad_views: {
        Row: {
          id: string
          user_id: string
          ad_slot_id: string
          campaign_id: string
          campaign_id_uuid: string | null
          video_url: string
          watched_duration: number
          completed: boolean
          reward_earned: number
          viewed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ad_slot_id: string
          campaign_id: string
          campaign_id_uuid?: string | null
          video_url: string
          watched_duration?: number
          completed?: boolean
          reward_earned?: number
          viewed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ad_slot_id?: string
          campaign_id?: string
          campaign_id_uuid?: string | null
          video_url?: string
          watched_duration?: number
          completed?: boolean
          reward_earned?: number
          viewed_at?: string
          created_at?: string
        }
      }
      merchants: {
        Row: {
          id: string
          user_id: string | null
          company_name: string
          business_email: string
          phone: string | null
          website: string | null
          vat_id: string | null
          business_address: string | null
          status: string
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          company_name: string
          business_email: string
          phone?: string | null
          website?: string | null
          vat_id?: string | null
          business_address?: string | null
          status?: string
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          company_name?: string
          business_email?: string
          phone?: string | null
          website?: string | null
          vat_id?: string | null
          business_address?: string | null
          status?: string
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          merchant_id: string
          name: string
          title: string
          description: string | null
          content_type: string
          content_url: string
          target_interests: string[]
          target_age_min: number | null
          target_age_max: number | null
          target_gender: string | null
          duration_seconds: number
          reward_per_view: number
          total_budget: number
          spent_budget: number
          status: string
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          merchant_id: string
          name: string
          title: string
          description?: string | null
          content_type: string
          content_url: string
          target_interests?: string[]
          target_age_min?: number | null
          target_age_max?: number | null
          target_gender?: string | null
          duration_seconds?: number
          reward_per_view: number
          total_budget: number
          spent_budget?: number
          status?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          merchant_id?: string
          name?: string
          title?: string
          description?: string | null
          content_type?: string
          content_url?: string
          target_interests?: string[]
          target_age_min?: number | null
          target_age_max?: number | null
          target_gender?: string | null
          duration_seconds?: number
          reward_per_view?: number
          total_budget?: number
          spent_budget?: number
          status?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaign_stats: {
        Row: {
          id: string
          campaign_id: string
          date: string
          views_count: number
          completed_views_count: number
          total_watch_time: number
          rewards_paid: number
          unique_viewers: number
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          date: string
          views_count?: number
          completed_views_count?: number
          total_watch_time?: number
          rewards_paid?: number
          unique_viewers?: number
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          date?: string
          views_count?: number
          completed_views_count?: number
          total_watch_time?: number
          rewards_paid?: number
          unique_viewers?: number
          created_at?: string
        }
      }
      rewards: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: string
          description: string | null
          ad_view_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: string
          description?: string | null
          ad_view_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: string
          description?: string | null
          ad_view_id?: string | null
          created_at?: string
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          date: string
          ads_watched: number
          ads_completed: number
          rewards_earned: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          ads_watched?: number
          ads_completed?: number
          rewards_earned?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          ads_watched?: number
          ads_completed?: number
          rewards_earned?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      user_total_rewards: {
        Row: {
          user_id: string
          total_earned: number
          total_rewards: number
          last_reward_at: string
        }
      }
    }
    Functions: {
      get_campaign_spent_budget: {
        Args: {
          p_campaign_id: string
        }
        Returns: number
      }
      increment_campaign_spend: {
        Args: {
          p_campaign_id: string
          p_spend_amount: number
        }
        Returns: void
      }
      update_campaign_stats: {
        Args: {
          p_campaign_id: string
          p_date: string
          p_completed: boolean
          p_watch_time: number
          p_reward: number
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
