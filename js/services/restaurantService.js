// js/services/restaurantService.js
import { supabase } from '../config/supabaseClient.js';

export const restaurantService = {
    // URL de tu JSON en GitHub
    JSON_URL: 'https://raw.githubusercontent.com/Jhontan200/Prueba/main/json/restaurantes.json',

    async getAllRestaurants() {
        try {
            // 1. Cargar datos estáticos desde GitHub
            const response = await fetch(this.JSON_URL);
            const baseData = await response.json();

            // 2. Cargar estadísticas desde la Vista de Supabase
            const { data: allStats, error } = await supabase
                .from('restaurante_stats')
                .select('*');

            if (error) console.error("Error cargando stats:", error);

            // 3. Fusionar datos
            return baseData.map(res => {
                const stats = allStats?.find(s => s.restaurante_id === res.id);
                return {
                    ...res,
                    puntuacion: stats ? stats.puntuacion_promedio : 0,
                    resenas_conteo: stats ? stats.resenas_conteo : 0
                };
            });
        } catch (error) {
            console.error("Error en el servicio de restaurantes:", error);
            return [];
        }
    },

    async getRestaurantById(id) {
        const all = await this.getAllRestaurants();
        return all.find(r => r.id === parseInt(id));
    }
};