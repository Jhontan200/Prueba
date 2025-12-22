// Importamos directamente desde el CDN compatible con módulos de navegador
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://lztzqeqeqtrcaefovydn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dHpxZXFlcXRyY2FlZm92eWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4ODIyNDksImV4cCI6MjA4MTQ1ODI0OX0._WPwKVoKrZTIcl5FQY_S8QjkVL8vVpkb_Bq3gxwpKCQ'

export const supabase = createClient(supabaseUrl, supabaseKey)