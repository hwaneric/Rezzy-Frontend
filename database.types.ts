export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          admin: boolean
          created_at: string
          email: string
          id: string
          whitelisted: boolean
        }
        Insert: {
          admin?: boolean
          created_at?: string
          email: string
          id?: string
          whitelisted?: boolean
        }
        Update: {
          admin?: boolean
          created_at?: string
          email?: string
          id?: string
          whitelisted?: boolean
        }
        Relationships: []
      }
      rezzys: {
        Row: {
          created_at: string
          date1: string
          date2: string | null
          date3: string | null
          id: number
          idealTime1: string
          idealTime2: string | null
          idealTime3: string | null
          latitude: number
          longitude: number
          maxTime1: string
          maxTime2: string | null
          maxTime3: string | null
          minTime1: string
          minTime2: string | null
          minTime3: string | null
          name: string
          opentable_url: string | null
          party_size: number
          restaurant_name: string | null
          user_email: string
        }
        Insert: {
          created_at?: string
          date1: string
          date2?: string | null
          date3?: string | null
          id?: number
          idealTime1: string
          idealTime2?: string | null
          idealTime3?: string | null
          latitude: number
          longitude: number
          maxTime1: string
          maxTime2?: string | null
          maxTime3?: string | null
          minTime1: string
          minTime2?: string | null
          minTime3?: string | null
          name: string
          opentable_url?: string | null
          party_size: number
          restaurant_name?: string | null
          user_email: string
        }
        Update: {
          created_at?: string
          date1?: string
          date2?: string | null
          date3?: string | null
          id?: number
          idealTime1?: string
          idealTime2?: string | null
          idealTime3?: string | null
          latitude?: number
          longitude?: number
          maxTime1?: string
          maxTime2?: string | null
          maxTime3?: string | null
          minTime1?: string
          minTime2?: string | null
          minTime3?: string | null
          name?: string
          opentable_url?: string | null
          party_size?: number
          restaurant_name?: string | null
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "rezzys_user_email_fkey"
            columns: ["user_email"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["email"]
          },
        ]
      }
      whitelist: {
        Row: {
          created_at: string
          email: string
          id: number
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
