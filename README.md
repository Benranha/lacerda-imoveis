# Site da Imobiliária Lacerda Imóveis

Site estático (HTML, CSS e JavaScript, sem build) da Imobiliária Lacerda Imóveis, Manaus/AM. CRECI 507PJ.

## O que tem

- Carrossel com os 6 imóveis em destaque, com preço, bairro e código.
- Catálogo de 50 imóveis com filtro por finalidade, tipo, bairro e faixa de preço, mais ordenação.
- Planta baixa interativa de fundo, que se desenha onde passa o mouse ou o dedo.
- Financiamento, dúvidas frequentes e contato. Todo contato cai no WhatsApp com a mensagem pronta.

## Estrutura

```
index.html          página única
css/estilo.css      estilos
js/imoveis.js       base dos 50 imóveis (código, tipo, bairro, cidade, finalidade, preço)
js/planta.js        planta baixa interativa em canvas
js/main.js          carrossel, filtros, menu, medição de cliques
img/                logo, favicon, fotos (d<código>.webp = destaque, <código>.webp = catálogo)
```

## Antes de publicar no domínio final

1. Remover a meta `noindex` do `index.html`.
2. Tirar "Versão de demonstração" do rodapé.
3. Pôr o ID do GA4 no bloco comentado do `<head>`.
4. Criar a imagem de Open Graph (1200x630).
5. Conferir o catálogo: os dados vieram do site atual em 19/11/2026.

## Fotos

Vieram do acervo da própria imobiliária. Foram cortadas na faixa de rodapé,
ampliadas com super-resolução (FSRCNN x4) e convertidas para WebP.
