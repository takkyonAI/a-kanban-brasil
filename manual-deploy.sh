#!/bin/bash

# Script para deploy manual no GitHub Pages
echo "🚀 Iniciando deploy manual para GitHub Pages..."

# 1. Build do projeto
echo "📦 Fazendo build do projeto..."
npm run build

# 2. Criar branch gh-pages se não existir
echo "🌿 Preparando branch gh-pages..."
git checkout -B gh-pages

# 3. Limpar arquivos antigos (exceto dist)
echo "🧹 Limpando arquivos..."
find . -maxdepth 1 ! -name '.' ! -name '..' ! -name '.git' ! -name 'dist' ! -name 'node_modules' -exec rm -rf {} +

# 4. Mover arquivos do dist para root
echo "📁 Movendo arquivos do build..."
mv dist/* .
mv dist/.* . 2>/dev/null || true
rmdir dist

# 5. Adicionar todos os arquivos
echo "📝 Adicionando arquivos ao git..."
git add .

# 6. Commit
echo "💾 Fazendo commit..."
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"

# 7. Push para gh-pages
echo "🚀 Fazendo push para gh-pages..."
git push origin gh-pages --force

# 8. Voltar para main
echo "🔄 Voltando para branch main..."
git checkout main

echo "✅ Deploy concluído!"
echo "🌐 Seu site estará disponível em: https://takkyonai.github.io/a-kanban-brasil/"