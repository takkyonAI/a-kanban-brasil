-- 🔐 SQL para definir senha específica para Wade Venga
-- Execute este SQL no dashboard do Supabase (SQL Editor)

-- 1. Verificar usuário atual
SELECT 
    id, 
    email, 
    name, 
    role, 
    password_hash,
    is_active
FROM public.user_profiles 
WHERE email = 'wadevenga@hotmail.com';

-- 2. Definir a senha S@lmos2714
UPDATE public.user_profiles 
SET 
    password_hash = 'S@lmos2714',
    updated_at = NOW(),
    last_login = NOW()
WHERE email = 'wadevenga@hotmail.com';

-- 3. Verificar se a atualização funcionou
SELECT 
    id, 
    email, 
    name, 
    role, 
    password_hash, 
    updated_at,
    last_login 
FROM public.user_profiles 
WHERE email = 'wadevenga@hotmail.com';

-- ✅ DADOS PARA LOGIN APÓS EXECUTAR:
-- Email: wadevenga@hotmail.com
-- Senha: S@lmos2714
-- 
-- 🎯 Esta será sua senha definitiva!