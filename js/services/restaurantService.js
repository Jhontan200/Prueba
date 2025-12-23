// js/services/restaurantService.js
import { supabase } from '../config/supabaseClient.js';

export const restaurantService = {
    // CAMBIO CLAVE: Ruta local relativa al proyecto
    // Esto asume que tu archivo está en una carpeta llamada 'json' en la raíz
    JSON_URL: './json/restaurantes.json',

    async getAllRestaurants() {
        try {
            /**
             * OPTIMIZACIÓN DE RENDIMIENTO:
             * Lanzamos ambas peticiones (Local JSON y Supabase) al mismo tiempo con Promise.all
             * En lugar de esperar a que termine una para empezar la otra, ganamos cientos de ms.
             */
            const [jsonResponse, supabaseResponse] = await Promise.all([
                fetch(this.JSON_URL),
                supabase.from('restaurante_stats').select('*')
            ]);

            // Verificamos si el fetch local fue exitoso
            if (!jsonResponse.ok) throw new Error("No se pudo cargar el archivo JSON local");

            const baseData = await jsonResponse.json();
            const { data: allStats, error: supabaseError } = supabaseResponse;

            if (supabaseError) {
                console.warn("Error cargando stats de Supabase, usando datos base:", supabaseError);
            }

            // Fusión de datos optimizada
            return baseData.map(res => {
                const stats = allStats?.find(s => s.restaurante_id === res.id);
                return {
                    ...res,
                    puntuacion: stats ? parseFloat(stats.puntuacion_promedio).toFixed(1) : 0,
                    resenas_conteo: stats ? stats.resenas_conteo : 0
                };
            });
        } catch (error) {
            console.error("Error crítico en restaurantService:", error);
            return [];
        }
    },

    async getRestaurantById(id) {
        // Optimización: No hace falta pedir todos si ya los tenemos en memoria (opcional)
        const all = await this.getAllRestaurants();
        return all.find(r => r.id === parseInt(id));
    }
};