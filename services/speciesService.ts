import { supabase } from "../lib/supabase";

export interface TreeSpecies {
  id: string;
  name: string;
  color_code: string;
  owner_id: string;
  created_at?: string;
}

export interface CreateSpeciesParams {
  name: string;
  color_code: string;
}

export const speciesService = {
  getSpecies: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    const { data, error } = await supabase
      .from("tree_species")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data as TreeSpecies[];
  },

  createSpecies: async ({ name, color_code }: CreateSpeciesParams) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    const { data, error } = await supabase
      .from("tree_species")
      .insert({
        name,
        color_code,
        owner_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as TreeSpecies;
  },

  deleteSpecies: async (id: string) => {
    const { error } = await supabase
      .from("tree_species")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }
};
