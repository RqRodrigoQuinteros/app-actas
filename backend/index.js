require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const actasRoutes = require('./routes/actas');
const establecimientosRoutes = require('./routes/establecimientos');
const pdfRoutes = require('./routes/pdf');
const fotosRoutes = require('./routes/fotos');
const informesRoutes = require('./routes/informes');
const templatesRoutes = require('./routes/templates');
const informesTemplatesRoutes = require('./routes/informes-templates');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/actas', actasRoutes);
app.use('/api/establecimientos', establecimientosRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/fotos', fotosRoutes);
app.use('/api/informes', informesRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/informes-templates', informesTemplatesRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});


process.on('uncaughtException', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Puerto ${PORT} ocupado, reintentando...`)
    process.exit(1)
  }
});
module.exports = app;