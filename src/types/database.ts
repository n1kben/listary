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
      lists: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lists_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      list_items: {
        Row: {
          id: string
          list_id: string
          text: string
          completed: boolean
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          list_id: string
          text: string
          completed?: boolean
          order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          text?: string
          completed?: boolean
          order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "list_items_list_id_fkey"
            columns: ["list_id"]
            referencedRelation: "lists"
            referencedColumns: ["id"]
          }
        ]
      }
      user_preferences: {
        Row: {
          user_id: string
          default_list_id: string | null
          theme: string
          new_list_placement: string
          new_item_placement: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          default_list_id?: string | null
          theme?: string
          new_list_placement?: string
          new_item_placement?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          default_list_id?: string | null
          theme?: string
          new_list_placement?: string
          new_item_placement?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_default_list_id_fkey"
            columns: ["default_list_id"]
            referencedRelation: "lists"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
