export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type StatusPedido = "ABERTO" | "FINALIZADO" | "CANCELADO";
export type TipoCupom = "PERCENTUAL" | "FIXO";

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.1" }
  public: {
    Tables: {
      clientes: {
        Row: { id: string; nome: string; email: string; telefone: string | null; created_at: string }
        Insert: { id?: string; nome: string; email: string; telefone?: string | null; created_at?: string }
        Update: { id?: string; nome?: string; email?: string; telefone?: string | null; created_at?: string }
        Relationships: []
      }
      cupons: {
        Row: { id: string; codigo: string; tipo: TipoCupom; valor: number; ativo: boolean; created_at: string }
        Insert: { id?: string; codigo: string; tipo: TipoCupom; valor: number; ativo?: boolean; created_at?: string }
        Update: { id?: string; codigo?: string; tipo?: TipoCupom; valor?: number; ativo?: boolean; created_at?: string }
        Relationships: []
      }
      historico_status_pedido: {
        Row: { id: string; pedido_id: string; status: StatusPedido; observacao: string | null; created_at: string }
        Insert: { id?: string; pedido_id: string; status: StatusPedido; observacao?: string | null; created_at?: string }
        Update: { id?: string; pedido_id?: string; status?: StatusPedido; observacao?: string | null; created_at?: string }
        Relationships: [{ foreignKeyName: "historico_status_pedido_pedido_id_fkey"; columns: ["pedido_id"]; isOneToOne: false; referencedRelation: "pedidos"; referencedColumns: ["id"] }]
      }
      itens_pedido: {
        Row: { created_at: string; id: string; pedido_id: string; produto_id: string; quantidade: number }
        Insert: { created_at?: string; id?: string; pedido_id: string; produto_id: string; quantidade: number }
        Update: { created_at?: string; id?: string; pedido_id?: string; produto_id?: string; quantidade?: number }
        Relationships: [
          { foreignKeyName: "itens_pedido_pedido_id_fkey"; columns: ["pedido_id"]; isOneToOne: false; referencedRelation: "pedidos"; referencedColumns: ["id"] },
          { foreignKeyName: "itens_pedido_produto_id_fkey"; columns: ["produto_id"]; isOneToOne: false; referencedRelation: "produtos"; referencedColumns: ["id"] }
        ]
      }
      pedidos: {
        Row: {
          created_at: string; id: string; status: string; total: number; subtotal: number; desconto: number;
          cliente_id: string | null; cupom_codigo: string | null;
          endereco_rua: string | null; endereco_numero: string | null; endereco_complemento: string | null;
          endereco_bairro: string | null; endereco_cidade: string | null; endereco_cep: string | null;
        }
        Insert: {
          created_at?: string; id?: string; status?: string; total?: number; subtotal?: number; desconto?: number;
          cliente_id?: string | null; cupom_codigo?: string | null;
          endereco_rua?: string | null; endereco_numero?: string | null; endereco_complemento?: string | null;
          endereco_bairro?: string | null; endereco_cidade?: string | null; endereco_cep?: string | null;
        }
        Update: {
          created_at?: string; id?: string; status?: string; total?: number; subtotal?: number; desconto?: number;
          cliente_id?: string | null; cupom_codigo?: string | null;
          endereco_rua?: string | null; endereco_numero?: string | null; endereco_complemento?: string | null;
          endereco_bairro?: string | null; endereco_cidade?: string | null; endereco_cep?: string | null;
        }
        Relationships: [{ foreignKeyName: "pedidos_cliente_id_fkey"; columns: ["cliente_id"]; isOneToOne: false; referencedRelation: "clientes"; referencedColumns: ["id"] }]
      }
      produtos: {
        Row: { created_at: string; id: string; nome: string; preco: number }
        Insert: { created_at?: string; id?: string; nome: string; preco: number }
        Update: { created_at?: string; id?: string; nome?: string; preco?: number }
        Relationships: []
      }
      tblLogs: {
        Row: {
          id: string
          rota: string
          metodo: string
          status_code: number
          params: Json | null
          body: Json | null
          response: Json | null
          ip: string | null
          usuario_id: string | null
          mensagem_erro: string | null
          created_at: string
        }
        Insert: {
          id?: string
          rota: string
          metodo: string
          status_code: number
          params?: Json | null
          body?: Json | null
          response?: Json | null
          ip?: string | null
          usuario_id?: string | null
          mensagem_erro?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          rota?: string
          metodo?: string
          status_code?: number
          params?: Json | null
          body?: Json | null
          response?: Json | null
          ip?: string | null
          usuario_id?: string | null
          mensagem_erro?: string | null
          created_at?: string
        }
        Relationships: []
      }
      tblBacklog: {
        Row: {
          id: string
          titulo: string
          descricao: string | null
          status: string
          prioridade: string
          tipo: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          descricao?: string | null
          status?: string
          prioridade?: string
          tipo?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          descricao?: string | null
          status?: string
          prioridade?: string
          tipo?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof Database },
  TableName extends DefaultTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[DefaultTableNameOrOptions["schema"]]["Tables"] & Database[DefaultTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultTableNameOrOptions["schema"]]["Tables"] & Database[DefaultTableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer R } ? R : never
  : DefaultTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultTableNameOrOptions] extends { Row: infer R } ? R : never
    : never
