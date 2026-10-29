# disparozap — MVP local

Painel web responsivo para iPhone com tema preto e verde. Inclui dashboard, cadastro de contatos com campo de consentimento, descadastro, catálogo Shopee/Mercado Livre, criação e pré-visualização de campanhas, histórico e exportação CSV de contatos.

## Limites importantes

- Este é um protótipo de interface funcional; **não envia mensagens** pelo WhatsApp.
- Não extrai automaticamente números de participantes de grupos.
- Participar de um grupo não significa consentimento para receber propaganda privada.
- Os dados são guardados em `localStorage` no navegador do dispositivo. Não existe conta, sincronização entre aparelhos ou backup automático.
- Não armazene tokens ou chaves secretas neste frontend.
- O campo de consentimento é um registro manual, não uma prova automática da autorização.
- Antes de campanhas reais, implemente backend seguro, autenticação, proteção contra abuso, registro verificável do consentimento, descadastro e integração aprovada com a WhatsApp Business Platform/Cloud API.
- O MVP é para demonstração e testes, não para armazenar dados pessoais sensíveis ou listas grandes sem controles adicionais.

## Arquivos

- `index.html` — estrutura e telas
- `styles.css` — interface responsiva
- `app.js` — cadastro e lógica local
- `manifest.json` — metadados para instalação como web app
- `sw.js` — cache básico para uso offline após a primeira visita
- `icon.svg` — ícone

## Testar no computador

1. Descompacte o ZIP.
2. Abra `index.html` no navegador para testar a interface básica.
3. Para testar instalação/PWA e o service worker, sirva a pasta por HTTPS ou localhost. Por exemplo, com Python instalado:
   `python -m http.server 8000`
   e abra `http://localhost:8000`.
4. Navegue por Dashboard, Contatos, Produtos, Campanhas e Histórico.
5. Cadastre contatos de teste. Marque consentimento somente para dados fictícios ou pessoas que realmente autorizaram. Teste o descadastro.
6. Crie produtos de teste e uma campanha. O botão de salvar grava um rascunho e informa que nenhum envio foi realizado.

## Testar no iPhone

Para instalação PWA, o site deve estar publicado em uma hospedagem HTTPS. Uma forma econômica é usar uma hospedagem estática, como GitHub Pages ou Cloudflare Pages, depois de criar um repositório e publicar os arquivos.

1. Publique todos os arquivos da pasta mantendo-os no mesmo diretório.
2. Abra o endereço HTTPS no Safari do iPhone.
3. Toque em Compartilhar → Adicionar à Tela de Início.
4. Abra o ícone `disparozap`.
5. Teste os formulários e as telas. Os dados ficam nesse navegador/dispositivo; limpar os dados do site pode apagá-los.

## Próximas etapas para produção

1. Backend com autenticação (por exemplo, Supabase com políticas RLS) e banco de dados.
2. Endpoint seguro para registrar/validar consentimento e pedidos de descadastro.
3. Integração de backend com WhatsApp Business Platform; nunca chamar a API diretamente do navegador com token secreto.
4. Configuração da conta comercial, número, modelos de mensagens e cobrança conforme as regras vigentes.
5. Filas, limites, retentativas, logs, métricas, exportação/backup e políticas de privacidade.
6. Testes de segurança e conformidade antes de qualquer campanha real.
