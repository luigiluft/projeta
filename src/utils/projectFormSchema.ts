
import * as z from "zod";
import { Attribute } from "@/types/project";

export const createProjectFormSchema = (attributes: Attribute[]) => {
  return z.object({
    name: z.string().min(2, {
      message: "O nome deve ter pelo menos 2 caracteres.",
    }),
    description: z.string().optional(),
    type: z.string(),
    client_name: z.string().optional(),
    due_date: z.string().optional(),
    ...Object.fromEntries(
      attributes.map((attr) => [
        attr.id,
        attr.type === "number"
          ? z.number().optional()
          : z.string().optional(),
      ])
    ),
  });
};

export type ProjectFormValues = z.infer<ReturnType<typeof createProjectFormSchema>>;
