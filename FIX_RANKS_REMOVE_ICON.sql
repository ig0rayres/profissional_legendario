-- Remover coluna icon da tabela ranks (não é usada, os ícones vêm do componente)
ALTER TABLE ranks DROP COLUMN IF EXISTS icon;

SELECT 'Coluna icon removida da tabela ranks' as resultado;
