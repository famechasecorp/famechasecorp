import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fjtuagjmjiljsnzytl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqdHVhZ2ptaWpsdnNudHp5dGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMTMyMDIsImV4cCI6MjA3MTg4OTIwMn0.j40OiKT5pVoUBESfIp07i5XyJu-ayrddiL8YAt8zL54';

export const supabase = createClient(supabaseUrl, supabaseKey);