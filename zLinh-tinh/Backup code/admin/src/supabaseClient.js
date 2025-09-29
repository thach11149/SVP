import { createClient } from '@supabase/supabase-js'

// Lấy thông tin từ Project Settings -> API trong Supabase
//const supabaseUrl = 'https://whktcdrqpijlvikbnfpa.supabase.co' 
//const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoa3RjZHJxcGlqbHZpa2JuZnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NDU1NzMsImV4cCI6MjA2NTUyMTU3M30.gnwL2pn8lAno6jqC95khFXRrF0KgTxvOQKVFKVRdHdI'

// Thay thế bằng thông tin thật của bạn
// Ví dụ: const supabaseUrl = 'https://abcdefg.supabase.co'
// Ví dụ: const supabaseKey = 'eyJh....'


//thach11149
const supabaseUrl = 'https://nofuomstsmzcbnumetbp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vZnVvbXN0c216Y2JudW1ldGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NDUyMDAsImV4cCI6MjA2NTUyMTIwMH0.CmSLdBxm44BTPyMmix20Mwk7DgYqnBcHrdguebPEF2A'






export const supabase = createClient(supabaseUrl, supabaseKey)