// CONEXIÓN CON SUPABASE (base de datos + cuentas de usuario).
// Lee la dirección del proyecto y su clave pública desde el archivo .env.local
// (ver .env.example). La clave pública puede estar en el navegador sin riesgo:
// la protección real está en las reglas RLS de la base de datos, que solo
// dejan a cada usuario ver y modificar sus propios datos.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Permite mostrar un aviso claro si falta la configuración
export const isSupabaseConfigured = Boolean(url && publishableKey);

export const supabase = isSupabaseConfigured ? createClient(url, publishableKey) : null;
