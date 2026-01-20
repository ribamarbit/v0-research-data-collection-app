// Tipos do banco de dados
export type ResearchType = 'academic' | 'scientific' | 'article' | 'survey' | 'other';
export type ResearchStatus = 'active' | 'completed' | 'archived';
export type CollaboratorRole = 'owner' | 'editor' | 'viewer' | 'collaborator';
export type FieldType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'file';

export interface Profile {
  id: string;
  full_name: string | null;
  institution: string | null;
  department: string | null;
  created_at: string;
  updated_at: string;
}

export interface Research {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  research_type: ResearchType | null;
  status: ResearchStatus;
  created_at: string;
  updated_at: string;
}

export interface DataCollection {
  id: string;
  research_id: string;
  user_id: string;
  field_name: string;
  field_type: FieldType | null;
  field_value: string | null;
  metadata: Record<string, unknown>;
  collected_at: string;
  is_synced: boolean;
}

export interface ResearchCollaborator {
  id: string;
  research_id: string;
  user_id: string;
  role: CollaboratorRole;
  invited_at: string;
}
