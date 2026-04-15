import { supabase } from "../lib/supabase";

export interface CreateFarmParams {
  name: string;
  boundary: { latitude: number; longitude: number }[];
}

export const farmService = {
  async createFarm({ name, boundary }: CreateFarmParams) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user found");

    const points = [...boundary, boundary[0]];
    const wktCoords = points.map(p => `${p.longitude} ${p.latitude}`).join(", ");
    const polygonWkt = `POLYGON((${wktCoords}))`;

    const { data, error } = await supabase
      .from("farms")
      .insert({
        name,
        boundary: polygonWkt,
        owner_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getFarms() {
    const { data: rawData, error: rawError } = await supabase
      .from("farms")
      .select("id, name, boundary");

    if (rawError) throw rawError;

    return rawData.map(farm => ({
      ...farm,
      boundary_coords: parseWktToCoords(farm.boundary)
    }));
  },

  async findFarmAtPoint(lat: number, lng: number) {
    // Intentamos encontrar la finca que contiene este punto
    // Nota: El operador 'cs' (contains) funciona con PostGIS en Supabase
    // si se pasa el punto en formato WKT
    const pointWkt = `POINT(${lng} ${lat})`;
    
    const { data, error } = await supabase
      .from("farms")
      .select("id, name")
      .filter("boundary", "cs", pointWkt)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error in findFarmAtPoint:", error);
      return null;
    }
    
    return data;
  }
};

function parseWktToCoords(wkt: string) {
  if (!wkt) return [];
  try {
    const match = wkt.match(/\(\((.*)\)\)/);
    if (!match) return [];
    const coordsString = match[1];
    return coordsString.split(", ").map(pair => {
      const parts = pair.split(" ");
      const lng = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      return { latitude: lat, longitude: lng };
    });
  } catch (e) {
    console.error("Error parsing WKT:", e);
    return [];
  }
}
