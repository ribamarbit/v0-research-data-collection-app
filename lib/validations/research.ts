import { z } from "zod";

// Validação de pesquisa
export const researchSchema = z.object({
  title: z
    .string()
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(200, "Título muito longo"),
  description: z
    .string()
    .max(2000, "Descrição muito longa")
    .optional(),
  research_type: z.enum(['academic', 'scientific', 'article', 'survey', 'other']),
  status: z.enum(['active', 'completed', 'archived']).default('active'),
});

// Validação de coleta de dados
export const dataCollectionSchema = z.object({
  research_id: z.string().uuid("ID de pesquisa inválido"),
  field_name: z
    .string()
    .min(1, "Nome do campo é obrigatório")
    .max(100, "Nome do campo muito longo"),
  field_type: z.enum(['text', 'number', 'date', 'boolean', 'select', 'multiselect', 'file']),
  field_value: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type ResearchInput = z.infer<typeof researchSchema>;
export type DataCollectionInput = z.infer<typeof dataCollectionSchema>;
