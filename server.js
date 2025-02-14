// server.js
const express = require('express');
const engine = require('ejs-mate'); // ejs-mate einbinden
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const { sequelize, Material, CastingPowder, Mold, WorkPiece, WorkPieceMaterial, WorkPieceMold } = require('./models');
const { stringify } = require('csv-stringify');

const upload = multer({ storage: multer.memoryStorage() });
const app = express();

// EJS-Mate als Engine verwenden
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Statische Dateien aus dem Ordner "public" bereitstellen
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// ---------- Startseite ----------
app.get('/', (req, res) => {
  res.render('index');
});

// ---------- Materialien ----------

// Liste aller Materialien
app.get('/materials', async (req, res) => {
  try {
    const materials = await Material.findAll();
    res.render('materials', { materials });
  } catch (err) {
    res.status(500).send("Fehler beim Abrufen der Materialien: " + err);
  }
});

// Formular zum Anlegen eines neuen Materials
app.get('/materials/new', (req, res) => {
  res.render('material_form', { material: null });
});

// Neuen Material-Eintrag erstellen
app.post('/materials/new', upload.single('image'), async (req, res) => {
  try {
    await Material.create({
      name: req.body.name,
      source: req.body.source,
      price: req.body.price,
      unit_price: req.body.unit_price,
      image: req.file ? req.file.buffer : null
    });
    res.redirect('/materials');
  } catch (err) {
    res.status(500).send("Fehler beim Erstellen des Materials: " + err);
  }
});

// Formular zum Bearbeiten eines Materials
app.get('/materials/:id/edit', async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) return res.status(404).send("Material nicht gefunden");
    res.render('material_form', { material });
  } catch (err) {
    res.status(500).send("Fehler beim Laden des Materials: " + err);
  }
});

// Material aktualisieren
app.post('/materials/:id/edit', upload.single('image'), async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) return res.status(404).send("Material nicht gefunden");
    material.name = req.body.name;
    material.source = req.body.source;
    material.price = req.body.price;
    material.unit_price = req.body.unit_price;
    if (req.file) {
      material.image = req.file.buffer;
    }
    await material.save();
    res.redirect('/materials');
  } catch (err) {
    res.status(500).send("Fehler beim Aktualisieren des Materials: " + err);
  }
});

// Löschen eines Materials
app.post('/materials/:id/delete', async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (!material) return res.status(404).send("Material nicht gefunden");
    await material.destroy();
    res.redirect('/materials');
  } catch (err) {
    res.status(500).send("Fehler beim Löschen des Materials: " + err);
  }
});

// Export der Materialien als CSV
app.get('/materials/export', async (req, res) => {
  try {
    const materials = await Material.findAll();
    res.setHeader('Content-Disposition', 'attachment; filename=materials.csv');
    res.setHeader('Content-Type', 'text/csv');
    const data = materials.map(m => ({
      id: m.id,
      name: m.name,
      source: m.source,
      price: m.price,
      unit_price: m.unit_price
    }));
    stringify(data, { header: true }).pipe(res);
  } catch (err) {
    res.status(500).send("Fehler beim Exportieren der Materialien: " + err);
  }
});

// ---------- Gießpulver ----------

// Liste aller Gießpulver
app.get('/casting-powders', async (req, res) => {
  try {
    const powders = await CastingPowder.findAll();
    res.render('casting_powders', { powders });
  } catch (err) {
    res.status(500).send("Fehler beim Abrufen der Gießpulver: " + err);
  }
});

// Formular zum Anlegen eines neuen Gießpulvers
app.get('/casting-powders/new', (req, res) => {
  res.render('casting_powder_form', { powder: null });
});

// Neuen CastingPowder erstellen
app.post('/casting-powders/new', async (req, res) => {
  try {
    await CastingPowder.create({
      name: req.body.name,
      water_ratio: req.body.water_ratio,
      powder_ratio: req.body.powder_ratio,
      price_per_gram: req.body.price_per_gram
    });
    res.redirect('/casting-powders');
  } catch (err) {
    res.status(500).send("Fehler beim Erstellen des Gießpulvers: " + err);
  }
});

// Formular zum Bearbeiten eines Gießpulvers
app.get('/casting-powders/:id/edit', async (req, res) => {
  try {
    const powder = await CastingPowder.findByPk(req.params.id);
    if (!powder) return res.status(404).send("Gießpulver nicht gefunden");
    res.render('casting_powder_form', { powder });
  } catch (err) {
    res.status(500).send("Fehler beim Laden des Gießpulvers: " + err);
  }
});

// CastingPowder aktualisieren
app.post('/casting-powders/:id/edit', async (req, res) => {
  try {
    const powder = await CastingPowder.findByPk(req.params.id);
    if (!powder) return res.status(404).send("Gießpulver nicht gefunden");
    powder.name = req.body.name;
    powder.water_ratio = req.body.water_ratio;
    powder.powder_ratio = req.body.powder_ratio;
    powder.price_per_gram = req.body.price_per_gram;
    await powder.save();
    res.redirect('/casting-powders');
  } catch (err) {
    res.status(500).send("Fehler beim Aktualisieren des Gießpulvers: " + err);
  }
});

// Löschen eines Gießpulvers
app.post('/casting-powders/:id/delete', async (req, res) => {
  try {
    const powder = await CastingPowder.findByPk(req.params.id);
    if (!powder) return res.status(404).send("Gießpulver nicht gefunden");
    await powder.destroy();
    res.redirect('/casting-powders');
  } catch (err) {
    res.status(500).send("Fehler beim Löschen des Gießpulvers: " + err);
  }
});

// ---------- Gießformen ----------

// GET: Liste aller Gießformen inkl. CastingPowder-Daten für das Dropdown
app.get('/molds', async (req, res) => {
  try {
    const molds = await Mold.findAll();
    const powders = await CastingPowder.findAll();
    res.render('molds', { molds, powders });
  } catch (err) {
    res.status(500).send("Fehler beim Abrufen der Gießformen: " + err);
  }
});

// Formular zum Anlegen einer neuen Gießform
app.get('/molds/new', (req, res) => {
  res.render('mold_form', { mold: null });
});

// Neue Gießform erstellen
app.post('/molds/new', upload.single('image'), async (req, res) => {
  try {
    await Mold.create({
      name: req.body.name,
      fill_volume: req.body.fill_volume,
      image: req.file ? req.file.buffer : null
    });
    res.redirect('/molds');
  } catch (err) {
    res.status(500).send("Fehler beim Erstellen der Gießform: " + err);
  }
});

// Formular zum Bearbeiten einer Gießform
app.get('/molds/:id/edit', async (req, res) => {
  try {
    const mold = await Mold.findByPk(req.params.id);
    if (!mold) return res.status(404).send("Gießform nicht gefunden");
    res.render('mold_form', { mold });
  } catch (err) {
    res.status(500).send("Fehler beim Laden der Gießform: " + err);
  }
});

// Gießform aktualisieren
app.post('/molds/:id/edit', upload.single('image'), async (req, res) => {
  try {
    const mold = await Mold.findByPk(req.params.id);
    if (!mold) return res.status(404).send("Gießform nicht gefunden");
    mold.name = req.body.name;
    mold.fill_volume = req.body.fill_volume;
    if (req.file) {
      mold.image = req.file.buffer;
    }
    await mold.save();
    res.redirect('/molds');
  } catch (err) {
    res.status(500).send("Fehler beim Aktualisieren der Gießform: " + err);
  }
});

// Löschen einer Gießform
app.post('/molds/:id/delete', async (req, res) => {
  try {
    const mold = await Mold.findByPk(req.params.id);
    if (!mold) return res.status(404).send("Gießform nicht gefunden");
    await mold.destroy();
    res.redirect('/molds');
  } catch (err) {
    res.status(500).send("Fehler beim Löschen der Gießform: " + err);
  }
});

// POST: Berechnung der Herstellungskosten – läuft auf derselben Seite
app.post('/molds/calculate', async (req, res) => {
  try {
    const { mold_id, casting_powder_id } = req.body;
    const mold = await Mold.findByPk(mold_id);
    const powder = await CastingPowder.findByPk(casting_powder_id);
    if (!mold || !powder) return res.status(400).send("Ungültige Auswahl");

    const water_ratio = parseFloat(powder.water_ratio);
    const powder_ratio = parseFloat(powder.powder_ratio);
    const fill_volume = parseFloat(mold.fill_volume);
    const total_ratio = water_ratio + powder_ratio;
    const powder_amount = fill_volume * (powder_ratio / total_ratio);
    const water_amount = fill_volume * (water_ratio / total_ratio);
    const cost = powder_amount * parseFloat(powder.price_per_gram);

    // Nach der Berechnung laden wir erneut alle Gießformen und Gießpulver
    const molds = await Mold.findAll();
    const powders = await CastingPowder.findAll();
    res.render('molds', { molds, powders, calc: { mold, powder, powder_amount, water_amount, cost } });
  } catch (err) {
    res.status(500).send("Fehler bei der Berechnung: " + err);
  }
});

// Route zum Abrufen des Bildes einer Gießform
app.get('/image/mold/:id', async (req, res) => {
  try {
    const mold = await Mold.findByPk(req.params.id);
    if (mold && mold.image) {
      res.set('Content-Type', 'image/jpeg');
      res.send(mold.image);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    res.status(500).send("Fehler beim Abrufen des Bildes: " + err);
  }
});

// ---------- Werkstücke ----------

// Liste aller Werkstücke (Listenansicht)
app.get('/workpieces', async (req, res) => {
  try {
    const workpieces = await WorkPiece.findAll();
    res.render('workpieces', { workpieces, detail: false });
  } catch (err) {
    res.status(500).send("Fehler beim Abrufen der Werkstücke: " + err);
  }
});

// Formular zum Anlegen eines neuen Werkstücks
app.get('/workpieces/new', async (req, res) => {
  try {
    const materials = await Material.findAll();
    const molds = await Mold.findAll();
    const powders = await CastingPowder.findAll();
    res.render('workpiece_form', { workpiece: null, materials, molds, powders });
  } catch (err) {
    res.status(500).send("Fehler beim Laden des Formulars: " + err);
  }
});

// Neues Werkstück erstellen (inkl. Zuordnung von Materialien und Gießformen)
app.post('/workpieces/new', upload.single('image'), async (req, res) => {
  try {
    const workpiece = await WorkPiece.create({
      name: req.body.name,
      image: req.file ? req.file.buffer : null
    });

    // Materialien: Arrays mit material_id[] und quantity[] verarbeiten
    if (req.body.material_id && req.body.quantity) {
      const materialIds = Array.isArray(req.body.material_id) ? req.body.material_id : [req.body.material_id];
      const quantities = Array.isArray(req.body.quantity) ? req.body.quantity : [req.body.quantity];
      for (let i = 0; i < materialIds.length; i++) {
        if (materialIds[i] && quantities[i]) {
          await workpiece.addMaterial(materialIds[i], { through: { quantity: quantities[i] } });
        }
      }
    }

    // Gießformen: Arrays mit mold_id[] und mold_casting_powder_id[] verarbeiten
    if (req.body.mold_id && req.body.mold_casting_powder_id) {
      const moldIds = Array.isArray(req.body.mold_id) ? req.body.mold_id : [req.body.mold_id];
      const powderIds = Array.isArray(req.body.mold_casting_powder_id) ? req.body.mold_casting_powder_id : [req.body.mold_casting_powder_id];
      for (let i = 0; i < moldIds.length; i++) {
        if (moldIds[i] && powderIds[i]) {
          await workpiece.addMold(moldIds[i], { through: { CastingPowderId: powderIds[i] } });
        }
      }
    }
    res.redirect('/workpieces');
  } catch (err) {
    res.status(500).send("Fehler beim Erstellen des Werkstücks: " + err);
  }
});

// GET: Formular zum Bearbeiten eines bestehenden Werkstücks
app.get('/workpieces/:id/edit', async (req, res) => {
  try {
    const workpiece = await WorkPiece.findByPk(req.params.id, {
      include: [
        { model: Material },
        { model: Mold, through: { attributes: ['CastingPowderId'] } }
      ]
    });
    if (!workpiece) return res.status(404).send("Werkstück nicht gefunden");
    const materials = await Material.findAll();
    const molds = await Mold.findAll();
    const powders = await CastingPowder.findAll();
    res.render('workpiece_form', { workpiece, materials, molds, powders });
  } catch (err) {
    res.status(500).send("Fehler beim Laden des Werkstücks: " + err);
  }
});

// POST: Aktualisierung eines bestehenden Werkstücks
app.post('/workpieces/:id/edit', upload.single('image'), async (req, res) => {
  try {
    const workpiece = await WorkPiece.findByPk(req.params.id);
    if (!workpiece) return res.status(404).send("Werkstück nicht gefunden");
    workpiece.name = req.body.name;
    if (req.file) {
      workpiece.image = req.file.buffer;
    }
    await workpiece.save();

    // Materialien aktualisieren
    await workpiece.setMaterials([]); // Alte Zuordnungen entfernen
    if (req.body.material_id && req.body.quantity) {
      const materialIds = Array.isArray(req.body.material_id) ? req.body.material_id : [req.body.material_id];
      const quantities = Array.isArray(req.body.quantity) ? req.body.quantity : [req.body.quantity];
      for (let i = 0; i < materialIds.length; i++) {
        if (materialIds[i] && quantities[i]) {
          await workpiece.addMaterial(materialIds[i], { through: { quantity: quantities[i] } });
        }
      }
    }

    // Gießformen aktualisieren
    await workpiece.setMolds([]); // Alte Zuordnungen entfernen
    if (req.body.mold_id && req.body.mold_casting_powder_id) {
      const moldIds = Array.isArray(req.body.mold_id) ? req.body.mold_id : [req.body.mold_id];
      const powderIds = Array.isArray(req.body.mold_casting_powder_id) ? req.body.mold_casting_powder_id : [req.body.mold_casting_powder_id];
      for (let i = 0; i < moldIds.length; i++) {
        if (moldIds[i] && powderIds[i]) {
          await workpiece.addMold(moldIds[i], { through: { CastingPowderId: powderIds[i] } });
        }
      }
    }
    res.redirect('/workpieces');
  } catch (err) {
    res.status(500).send("Fehler beim Aktualisieren des Werkstücks: " + err);
  }
});

// POST: Lösch-Route für Werkstücke
app.post('/workpieces/:id/delete', async (req, res) => {
  try {
    const workpiece = await WorkPiece.findByPk(req.params.id);
    if (!workpiece) return res.status(404).send("Werkstück nicht gefunden");
    await workpiece.destroy();
    res.redirect('/workpieces');
  } catch (err) {
    res.status(500).send("Fehler beim Löschen des Werkstücks: " + err);
  }
});

// GET: Detailansicht eines Werkstücks
app.get('/workpieces/:id', async (req, res) => {
  try {
    const workpiece = await WorkPiece.findByPk(req.params.id, {
      include: [
        { model: Material },
        { model: Mold, through: { attributes: ['CastingPowderId'] } }
      ]
    });
    if (!workpiece) return res.status(404).send("Werkstück nicht gefunden");

    // Berechnung der Kosten aus Materialien
    let materialCost = 0;
    for (const material of workpiece.Materials) {
      const qty = material.WorkPieceMaterial.quantity;
      materialCost += material.unit_price * qty;
    }

    // Berechnung der Kosten aus Gießformen
    let moldCost = 0;
    const powders = await CastingPowder.findAll();
    for (const mold of workpiece.Molds) {
      if (mold.WorkPieceMold && mold.WorkPieceMold.CastingPowderId) {
        const powder = powders.find(p => p.id === mold.WorkPieceMold.CastingPowderId);
        if (powder) {
          const water_ratio = parseFloat(powder.water_ratio);
          const powder_ratio = parseFloat(powder.powder_ratio);
          const fill_volume = parseFloat(mold.fill_volume);
          const total_ratio = water_ratio + powder_ratio;
          const powder_amount = fill_volume * (powder_ratio / total_ratio);
          const cost_mold = powder_amount * parseFloat(powder.price_per_gram);
          moldCost += cost_mold;
        }
      }
    }
    const totalCost = materialCost + moldCost;
    res.render('workpieces', { workpieces: [workpiece], totalCost, detail: true, powders });
  } catch (err) {
    res.status(500).send("Fehler beim Abrufen des Werkstücks: " + err);
  }
});

// Export der Werkstücke als CSV (nur Basisdaten)
app.get('/workpieces/export', async (req, res) => {
  try {
    const workpieces = await WorkPiece.findAll();
    res.setHeader('Content-Disposition', 'attachment; filename=workpieces.csv');
    res.setHeader('Content-Type', 'text/csv');
    const data = workpieces.map(w => ({
      id: w.id,
      name: w.name
    }));
    stringify(data, { header: true }).pipe(res);
  } catch (err) {
    res.status(500).send("Fehler beim Exportieren der Werkstücke: " + err);
  }
});

// Route zum Abrufen des Bildes eines Werkstücks
app.get('/image/workpiece/:id', async (req, res) => {
  try {
    const wp = await WorkPiece.findByPk(req.params.id);
    if (wp && wp.image) {
      res.set('Content-Type', 'image/jpeg');
      res.send(wp.image);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    res.status(500).send("Fehler beim Abrufen des Bildes: " + err);
  }
});

// Route zum Abrufen des Bildes eines Materials
app.get('/image/material/:id', async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    if (material && material.image) {
      res.set('Content-Type', 'image/jpeg');
      res.send(material.image);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    res.status(500).send("Fehler beim Abrufen des Bildes: " + err);
  }
});

// Sync DB und Serverstart
sequelize.sync().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server läuft auf Port ${port}`));
});
