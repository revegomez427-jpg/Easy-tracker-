# 🦉 Easy Tracker

Controla tus gastos por período — semanal, quincenal o mensual.

## Deploy en Netlify (manual — arrastrar carpeta)

1. Instala dependencias y genera el build:
   ```bash
   npm install
   npm run build
   ```
2. Entra a [netlify.com](https://netlify.com) → **Add new site** → **Deploy manually**
3. Arrastra la carpeta `dist/` generada → listo ✅

## Deploy en Netlify (conectando GitHub)

1. Sube este proyecto a un repositorio de GitHub
2. En Netlify: **Add new site** → **Import an existing project** → elige tu repo
3. Netlify detecta automáticamente la config desde `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Click **Deploy** ✅

## Desarrollo local

```bash
npm install
npm run dev
```

## Lo que incluye

- 📊 Dashboard con balance disponible y % gastado
- 🏷️ 8 categorías con anillos de progreso por color
- 📅 Calendario con historial de gastos por día
- 💾 Los datos se guardan en `localStorage` (persisten entre sesiones)
- 🦉 Búho animado que reacciona al nivel de gasto
- 📱 Diseño mobile-first, máx 480px
