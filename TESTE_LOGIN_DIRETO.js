// Teste de login direto via API do Supabase
// Cole este código no Console do navegador (F12) e execute

const testeLogin = async () => {
    const SUPABASE_URL = 'https://erzprkocwzgdjrsictps.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyenBya29jd3pnZGpyc2ljdHBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MDQ3MzksImV4cCI6MjA4MDI4MDczOX0.nlRWPDuGXTcSUDwyZg9Z8eV6uab9vT2wmJiKe6x5EvM';

    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
            email: 'recruta@rotatest.com',
            password: '123456'
        })
    });

    const data = await response.json();
    console.log('Resposta Login:', data);

    if (response.ok) {
        console.log('✅ LOGIN FUNCIONOU!');
    } else {
        console.log('❌ ERRO NO LOGIN:', data.error_description || data.msg);
    }

    return data;
};

testeLogin();
