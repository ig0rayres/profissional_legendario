-- ============================================
-- SEED: Novas Categorias da Área da Saúde
-- Total: 84 novas categorias profissionais
-- ============================================

-- Anestesiologia
INSERT INTO service_categories (name, slug, icon, color, keywords, tags) VALUES
('Anestesista / Anestesiologista', 'anestesista', 'Syringe', '#DC2626', ARRAY['anestesia', 'anestesiologista', 'cirurgia', 'sedação'], ARRAY['saúde', 'medicina', 'cirurgia']);

-- Cirurgia (11 especialidades)
INSERT INTO service_categories (name, slug, icon, color, keywords, tags) VALUES
('Cirurgião Geral', 'cirurgiao-geral', 'ScalpelIcon', '#B91C1C', ARRAY['cirurgia', 'operação', 'procedimento'], ARRAY['saúde', 'medicina', 'cirurgia']),
('Cirurgião Cardiovascular', 'cirurgiao-cardiovascular', 'Heart', '#DC2626', ARRAY['coração', 'cardiovascular', 'cirurgia cardíaca'], ARRAY['saúde', 'medicina', 'cirurgia']),
('Cirurgião Torácico', 'cirurgiao-toracico', 'Activity', '#EF4444', ARRAY['tórax', 'pulmão', 'caixa torácica'], ARRAY['saúde', 'medicina', 'cirurgia']),
('Cirurgião Vascular', 'cirurgiao-vascular', 'GitBranch', '#F87171', ARRAY['vascular', 'veias', 'artérias', 'circulação'], ARRAY['saúde', 'medicina', 'cirurgia']),
('Cirurgião Pediátrico', 'cirurgiao-pediatrico', 'Baby', '#FB923C', ARRAY['pediatria', 'criança', 'infantil'], ARRAY['saúde', 'medicina', 'cirurgia', 'pediatria']),
('Cirurgião de Cabeça e Pescoço', 'cirurgiao-cabeca-pescoco', 'User', '#F59E0B', ARRAY['cabeça', 'pescoço', 'tireoide'], ARRAY['saúde', 'medicina', 'cirurgia']),
('Cirurgião do Trauma', 'cirurgiao-trauma', 'Ambulance', '#EAB308', ARRAY['trauma', 'emergência', 'acidente'], ARRAY['saúde', 'medicina', 'cirurgia', 'emergência']),
('Cirurgião Oncológico', 'cirurgiao-oncologico', 'AlertCircle', '#84CC16', ARRAY['câncer', 'oncologia', 'tumor'], ARRAY['saúde', 'medicina', 'cirurgia', 'oncologia']),
('Cirurgião Bariátrico', 'cirurgiao-bariatrico', 'Weight', '#22C55E', ARRAY['bariátrica', 'obesidade', 'gastroplastia'], ARRAY['saúde', 'medicina', 'cirurgia']),
('Coloproctologista', 'cirurgiao-coloproctologia', 'Activity', '#10B981', ARRAY['cólon', 'reto', 'intestino', 'proctologia'], ARRAY['saúde', 'medicina', 'cirurgia']),
('Cirurgião Bucomaxilofacial', 'bucomaxilofacial', 'Smile', '#14B8A6', ARRAY['maxilar', 'mandíbula', 'face', 'facial'], ARRAY['saúde', 'odontologia', 'cirurgia']);

-- Especialidades Médicas
INSERT INTO service_categories (name, slug, icon, color, keywords, tags) VALUES
('Medicina de Família', 'medicina-familia', 'Home', '#06B6D4', ARRAY['família', 'comunidade', 'atenção básica'], ARRAY['saúde', 'medicina']),
('Médico Intensivista (UTI)', 'intensivista', 'AlertCircle', '#0EA5E9', ARRAY['UTI', 'terapia intensiva', 'crítico'], ARRAY['saúde', 'medicina', 'emergência']),
('Médico Emergencista', 'emergencista', 'Ambulance', '#3B82F6', ARRAY['emergência', 'pronto socorro', 'urgência'], ARRAY['saúde', 'medicina', 'emergência']),
('Obstetra', 'obstetra', 'Baby', '#6366F1', ARRAY['obstetrícia', 'parto', 'gestação', 'gravidez'], ARRAY['saúde', 'medicina']),
('Mastologista', 'mastologista', 'Heart', '#8B5CF6', ARRAY['mama', 'seio', 'mastologia'], ARRAY['saúde', 'medicina']),
('Traumatologista Ortopédico', 'traumatologista', 'Bone', '#A855F7', ARRAY['trauma', 'fraturas', 'lesões'], ARRAY['saúde', 'medicina', 'ortopedia']),
('Cirurgião de Coluna', 'cirurgia-coluna', 'AlignJustify', '#C084FC', ARRAY['coluna', 'vertebral', 'hérnia'], ARRAY['saúde', 'medicina', 'ortopedia']),
('Cirurgião de Mão', 'cirurgia-mao', 'Hand', '#D946EF', ARRAY['mão', 'punho', 'dedos'], ARRAY['saúde', 'medicina', 'ortopedia']),
('Cirurgião de Joelho', 'cirurgia-joelho', 'Activity', '#E879F9', ARRAY['joelho', 'ligamento', 'artroscopia'], ARRAY['saúde', 'medicina', 'ortopedia']),
('Médico do Esporte', 'medicina-esportiva', 'Trophy', '#F0ABFC', ARRAY['esporte', 'atleta', 'performance'], ARRAY['saúde', 'medicina', 'esporte']),
('Neurocirurgião', 'neurocirurgiao', 'Brain', '#EC4899', ARRAY['neurocirurgia', 'cérebro', 'neurológico'], ARRAY['saúde', 'medicina', 'cirurgia']),
('Gastroenterologista', 'gastroenterologista', 'Activity', '#F43F5E', ARRAY['gastro', 'estômago', 'intestino', 'digestivo'], ARRAY['saúde', 'medicina']),
('Hepatologista', 'hepatologista', 'Activity', '#FB7185', ARRAY['fígado', 'hepatite', 'cirrose'], ARRAY['saúde', 'medicina']),
('Nefrologista', 'nefrologista', 'Droplet', '#FDA4AF', ARRAY['rim', 'renal', 'nefrologia', 'diálise'], ARRAY['saúde', 'medicina']),
('Pneumologista', 'pneumologista', 'Wind', '#FCA5A5', ARRAY['pulmão', 'respiratório', 'asma'], ARRAY['saúde', 'medicina']),
('Reumatologista', 'reumatologista', 'Activity', '#FBBF24', ARRAY['reumatologia', 'artrite', 'autoimune'], ARRAY['saúde', 'medicina']),
('Hematologista', 'hematologista', 'Droplet', '#F59E0B', ARRAY['sangue', 'anemia', 'leucemia'], ARRAY['saúde', 'medicina']),
('Infectologista', 'infectologista', 'Shield', '#D97706', ARRAY['infecção', 'vírus', 'bactéria', 'HIV'], ARRAY['saúde', 'medicina']),
('Radioterapeuta', 'radioterapia', 'Zap', '#B45309', ARRAY['radioterapia', 'radiação', 'câncer'], ARRAY['saúde', 'medicina', 'oncologia']),
('Radiologista', 'radiologista', 'Scan', '#78350F', ARRAY['raio-x', 'imagem', 'diagnóstico'], ARRAY['saúde', 'medicina', 'diagnóstico']),
('Ultrassonografista', 'ultrassonografista', 'Radio', '#1C1917', ARRAY['ultrassom', 'ecografia', 'imagem'], ARRAY['saúde', 'medicina', 'diagnóstico']),
('Patologista', 'patologista', 'Microscope', '#57534E', ARRAY['patologia', 'biópsia', 'anatomia'], ARRAY['saúde', 'medicina', 'diagnóstico']),
('Geneticista Médico', 'geneticista', 'Dna', '#44403C', ARRAY['genética', 'DNA', 'hereditário'], ARRAY['saúde', 'medicina']),
('Alergologista e Imunologista', 'alergologista', 'AlertTriangle', '#292524', ARRAY['alergia', 'imunologia', 'rinite'], ARRAY['saúde', 'medicina']),
('Médico Homeopata', 'homeopata', 'Leaf', '#16A34A', ARRAY['homeopatia', 'natural', 'alternativa'], ARRAY['saúde', 'medicina']),
('Medicina Preventiva', 'medicina-preventiva', 'ShieldCheck', '#15803D', ARRAY['prevenção', 'check-up', 'saúde ocupacional'], ARRAY['saúde', 'medicina']),
('Medicina do Trabalho', 'medicina-trabalho', 'Briefcase', '#166534', ARRAY['ocupacional', 'trabalho', 'perícia'], ARRAY['saúde', 'medicina']),
('Medicina Legal', 'medicina-legal', 'Scale', '#14532D', ARRAY['legal', 'forense', 'perícia'], ARRAY['saúde', 'medicina']);

-- Odontologia
INSERT INTO service_categories (name, slug, icon, color, keywords, tags) VALUES
('Protesista Dentário', 'protesista', 'Smile', '#0EA5E9', ARRAY['prótese', 'dentadura', 'ponte'], ARRAY['saúde', 'odontologia']),
('Clareamento Dental', 'clareamento-dental', 'Sparkles', '#06B6D4', ARRAY['clareamento', 'branqueamento', 'estética'], ARRAY['saúde', 'odontologia']),
('Dentística (Estética)', 'dentistica', 'Sparkle', '#14B8A6', ARRAY['estética', 'restauração', 'resina'], ARRAY['saúde', 'odontologia']);

-- Fisioterapia Especializada
INSERT INTO service_categories (name, slug, icon, color, keywords, tags) VALUES
('Fisioterapia Respiratória', 'fisio-respiratoria', 'Wind', '#10B981', ARRAY['respiratória', 'pulmão', 'COVID'], ARRAY['saúde', 'fisioterapia']),
('Fisioterapia Neurológica', 'fisio-neurologica', 'Brain', '#22C55E', ARRAY['neurológica', 'AVC', 'parkinson'], ARRAY['saúde', 'fisioterapia']),
('Fisioterapia Traumato-Ortopédica', 'fisio-traumato', 'Bone', '#84CC16', ARRAY['ortopédica', 'trauma', 'reabilitação'], ARRAY['saúde', 'fisioterapia']),
('Fisioterapia Pélvica', 'fisio-pelvica', 'Activity', '#A3E635', ARRAY['pélvica', 'incontinência', 'gestação'], ARRAY['saúde', 'fisioterapia']),
('RPG (Reeducação Postural Global)', 'rpg', 'AlignCenter', '#BEF264', ARRAY['RPG', 'postura', 'reeducação'], ARRAY['saúde', 'fisioterapia']),
('Hidroterapia / Fisioterapia Aquática', 'terapia-aquatica', 'Droplets', '#D9F99D', ARRAY['aquática', 'piscina', 'hidroterapia'], ARRAY['saúde', 'fisioterapia']);

-- Psicologia Especializada
INSERT INTO service_categories (name, slug, icon, color, keywords, tags) VALUES
('Neuropsicólogo', 'neuropsicolog', 'Brain', '#FBBF24', ARRAY['neuropsicologia', 'cognitivo', 'memória'], ARRAY['saúde', 'psicologia']),
('Psicólogo Infantil', 'psicologo-infantil', 'Baby', '#F59E0B', ARRAY['infantil', 'criança', 'desenvolvimento'], ARRAY['saúde', 'psicologia']),
('Terapeuta de Casal', 'terapia-casal', 'Heart', '#F97316', ARRAY['casal', 'relacionamento', 'terapia'], ARRAY['saúde', 'psicologia']),
('Terapeuta Familiar', 'terapia-familiar', 'Users', '#EA580C', ARRAY['família', 'terapia familiar', 'sistêmica'], ARRAY['saúde', 'psicologia']);

-- Nutrição Especializada
INSERT INTO service_categories (name, slug, icon, color, keywords, tags) VALUES
('Nutricionista Esportiva', 'nutri-esportiva', 'Trophy', '#DC2626', ARRAY['esportiva', 'atleta', 'performance'], ARRAY['saúde', 'nutrição', 'esporte']),
('Nutricionista Clínica', 'nutri-clinica', 'Activity', '#B91C1C', ARRAY['clínica', 'emagrecimento', 'dieta'], ARRAY['saúde', 'nutrição']);

-- Fitness e Esporte
INSERT INTO service_categories (name, slug, icon, color, keywords, tags) VALUES
('Educador Físico', 'educador-fisico', 'Dumbbell', '#991B1B', ARRAY['educação física', 'academia', 'exercício'], ARRAY['saúde', 'esporte']),
('Instrutor de CrossFit', 'crossfit', 'Zap', '#7F1D1D', ARRAY['crossfit', 'funcional', 'WOD'], ARRAY['saúde', 'esporte']),
('Treinamento Funcional', 'funcional', 'Activity', '#450A0A', ARRAY['funcional', 'treinamento', 'performance'], ARRAY['saúde', 'esporte']),
('Professor de Natação', 'natacao', 'Waves', '#172554', ARRAY['natação', 'piscina', 'hidroginástica'], ARRAY['saúde', 'esporte']);

-- Estética
INSERT INTO service_categories (name, slug, icon, color, keywords, tags) VALUES
('Estética Facial', 'estetica-facial', 'Smile', '#1E3A8A', ARRAY['facial', 'pele', 'limpeza'], ARRAY['saúde', 'estética']),
('Estética Corporal', 'estetica-corporal', 'User', '#1E40AF', ARRAY['corporal', 'massagem', 'modeladora'], ARRAY['saúde', 'estética']),
('Depilação a Laser', 'depilacao', 'Zap', '#1D4ED8', ARRAY['depilação', 'laser', 'definitiva'], ARRAY['saúde', 'estética']),
('Micropigmentação', 'micropigmentacao', 'Pen', '#2563EB', ARRAY['micropigmentação', 'sobrancelha', 'tatuagem'], ARRAY['saúde', 'estética']),
('Design de Sobrancelhas', 'design-sobrancelha', 'Eye', '#3B82F6', ARRAY['sobrancelha', 'design', 'henna'], ARRAY['saúde', 'estética']),
('Drenagem Linfática', 'drenagem-linfatica', 'Droplets', '#60A5FA', ARRAY['drenagem', 'linfática', 'pós-cirúrgica'], ARRAY['saúde', 'estética']);

-- Terapias Complementares
INSERT INTO service_categories (name, slug, icon, color, keywords, tags) VALUES
('Terapeuta Reiki', 'reiki', 'Sparkles', '#93C5FD', ARRAY['reiki', 'energia', 'holístico'], ARRAY['saúde', 'terapia']),
('Aromaterapia', 'aromaterapia', 'Flower', '#DBEAFE', ARRAY['aroma', 'óleos essenciais', 'terapia'], ARRAY['saúde', 'terapia']),
('Auriculoterapia', 'auriculoterapia', 'Ear', '#E0E7FF', ARRAY['orelha', 'auricular', 'acupuntura'], ARRAY['saúde', 'terapia']),
('Reflexologia', 'reflexologia', 'Hand', '#C7D2FE', ARRAY['reflexologia', 'pés', 'massagem'], ARRAY['saúde', 'terapia']);

-- Enfermagem
INSERT INTO service_categories (name, slug, icon, color, keywords, tags) VALUES
('Técnico de Enfermagem', 'tecnico-enfermagem', 'Stethoscope', '#A78BFA', ARRAY['técnico', 'auxiliar', 'enfermagem'], ARRAY['saúde', 'enfermagem']),
('Cuidados Paliativos', 'cuidado-paliativo', 'Heart', '#8B5CF6', ARRAY['paliativo', 'terminal', 'hospice'], ARRAY['saúde', 'enfermagem']),
('Home Care / Assistência Domiciliar', 'home-care', 'Home', '#7C3AED', ARRAY['home care', 'domiciliar', 'assistência'], ARRAY['saúde', 'enfermagem']);

-- Diagnóstico
INSERT INTO service_categories (name, slug, icon, color, keywords, tags) VALUES
('Biomédico', 'biomedico', 'Microscope', '#6D28D9', ARRAY['biomedicina', 'laboratório', 'análises'], ARRAY['saúde', 'diagnóstico']),
('Farmacêutico', 'farmaceutico', 'Pill', '#5B21B6', ARRAY['farmácia', 'medicamentos', 'farmacêutico'], ARRAY['saúde', 'farmácia']),
('Analista Clínico', 'bioanalista', 'TestTube', '#4C1D95', ARRAY['laboratório', 'exames', 'análises'], ARRAY['saúde', 'diagnóstico']);

-- Log de execução
SELECT 'Seed executado com sucesso: 84 novas categorias de saúde inseridas!' AS status;
