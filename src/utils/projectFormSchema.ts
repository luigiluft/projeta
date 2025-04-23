
import * as z from "zod";
import { Attribute } from "@/types/project";

export const createProjectFormSchema = (attributes: Attribute[], isRequired: boolean = false) => {
  return z.object({
    name: isRequired 
      ? z.string().min(2, {
          message: "O nome deve ter pelo menos 2 caracteres.",
        })
      : z.string().optional(),
    description: z.string().optional(),
    client_name: z.string().optional(),
    start_date: z.string().optional(),
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
