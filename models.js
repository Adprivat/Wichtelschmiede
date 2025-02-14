// models.js
const { Sequelize, DataTypes } = require('sequelize');

// Passe hier ggf. die Verbindungsdaten an (z. B. Benutzer, Passwort, Datenbankname)
const sequelize = new Sequelize(process.env.DATABASE_URL || 'mysql://root:mTKyNduzzxzUNCfqwhfqnUioAUlzNnXv@viaduct.proxy.rlwy.net:43038/railway', {
  dialect: 'mariadb'
});

// Material – speichert Name, Bezugsquelle, Preis, Preis pro Einheit und (optional) ein Bild
const Material = sequelize.define('Material', {
  name: { type: DataTypes.STRING, allowNull: false },
  source: { type: DataTypes.STRING },
  price: { type: DataTypes.FLOAT, allowNull: false },
  unit_price: { type: DataTypes.FLOAT, allowNull: false },
  image: { type: DataTypes.BLOB('long'), allowNull: true }
});

// CastingPowder – Gießpulver mit Mischverhältnis (Wasser:Pulver) und Preis pro Gramm
const CastingPowder = sequelize.define('CastingPowder', {
  name: { type: DataTypes.STRING, allowNull: false },
  water_ratio: { type: DataTypes.FLOAT, allowNull: false },
  powder_ratio: { type: DataTypes.FLOAT, allowNull: false },
  price_per_gram: { type: DataTypes.FLOAT, allowNull: false }
});

// Mold – Giessformen mit Füllmenge und (optional) Bild
const Mold = sequelize.define('Mold', {
  name: { type: DataTypes.STRING, allowNull: false },
  fill_volume: { type: DataTypes.FLOAT, allowNull: false },
  image: { type: DataTypes.BLOB('long'), allowNull: true }
});

// WorkPiece – fertige Werkstücke mit (optional) Bild
const WorkPiece = sequelize.define('WorkPiece', {
  name: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.BLOB('long'), allowNull: true }
});

// Zwischentabelle: Verwendete Materialien in einem Werkstück (mit Menge)
const WorkPieceMaterial = sequelize.define('WorkPieceMaterial', {
  quantity: { type: DataTypes.FLOAT, allowNull: false }
});

// Zwischentabelle: Verwendete Gießformen in einem Werkstück – zusätzlich wird für jede Form
// das verwendete CastingPowder (also dessen Parameter) gespeichert.
const WorkPieceMold = sequelize.define('WorkPieceMold', {
  // Keine zusätzlichen Felder notwendig; über die Assoziationen werden die Werte bezogen.
});

// Assoziationen
WorkPiece.belongsToMany(Material, { through: WorkPieceMaterial });
Material.belongsToMany(WorkPiece, { through: WorkPieceMaterial });

WorkPiece.belongsToMany(Mold, { through: WorkPieceMold });
Mold.belongsToMany(WorkPiece, { through: WorkPieceMold });

// CastingPowder wird für jede verwendete Gießform gewählt:
CastingPowder.hasMany(WorkPieceMold);
WorkPieceMold.belongsTo(CastingPowder);

module.exports = {
  sequelize,
  Material,
  CastingPowder,
  Mold,
  WorkPiece,
  WorkPieceMaterial,
  WorkPieceMold
};
