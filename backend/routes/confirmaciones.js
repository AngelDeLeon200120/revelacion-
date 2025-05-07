router.get('/confirmaciones', async (req, res) => {
    try {
      const [confirmaciones] = await pool.query('SELECT * FROM confirmaciones');
  
      const [total] = await pool.query('SELECT SUM(cantidad_personas) AS total_personas FROM confirmaciones');
  
      res.json({
        confirmaciones,
        total_personas: total[0].total_personas || 0
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener confirmaciones' });
    }
  });