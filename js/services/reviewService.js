import { supabase } from '../config/supabaseClient.js';

export const reviewService = {
    // Obtener las estadísticas (promedio y conteo) de la vista que creamos
    async getStats(restaurantId) {
        const { data, error } = await supabase
            .from('restaurante_stats')
            .select('resenas_conteo, puntuacion_promedio')
            .eq('restaurante_id', restaurantId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignorar si no hay reseñas aún
        return data || { resenas_conteo: 0, puntuacion_promedio: 0 };
    },

    // Obtener las opiniones reales
    async getReviewsByRestaurant(restaurantId) {
        const { data, error } = await supabase
            .from('opiniones')
            .select('*')
            .eq('restaurante_id', restaurantId)
            .order('fecha', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Insertar una nueva opinión
    async createReview(reviewData) {
        const { data, error } = await supabase
            .from('opiniones')
            .insert([reviewData]);

        if (error) throw error;
        return data;
    }
};