import { supabase } from "../lib/supabase";

export interface Tree {
  id: string;
  farm_id: string;
  species_id: string;
  location: { latitude: number; longitude: number };
  created_at?: string;
  species?: {
    name: string;
    color_code: string;
  };
}

export interface CreateTreeParams {
  farm_id: string;
  species_id: string;
  location: { latitude: number; longitude: number };
}

export const treeService = {
  getTreesByFarm: async (farmId: string) => {
    const { data, error } = await supabase
      .from("trees")
      .select(`
        id,
        farm_id,
        species_id,
        location,
        species:tree_species (name, color_code)
      `)
      .eq("farm_id", farmId);

    if (error) throw error;

    // Parsear GeoJSON de PostGIS a objetos de coordenadas
    return data.map((tree: any) => ({
      ...tree,
      location: {
        latitude: tree.location.coordinates[1],
        longitude: tree.location.coordinates[0],
      }
    })) as Tree[];
  },

  createTree: async ({ farm_id, species_id, location }: CreateTreeParams) => {
    // Convertir a Point WKT
    const pointWkt = `POINT(${location.longitude} ${location.latitude})`;

    const { data, error } = await supabase
      .from("trees")
      .insert({
        farm_id,
        species_id,
        location: pointWkt
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
