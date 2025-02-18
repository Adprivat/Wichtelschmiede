// models.js
const { Sequelize, DataTypes } = require('sequelize');

// Verbindung: Nutze die Umgebungsvariable DATABASE_URL, falls vorhanden, ansonsten den Standardwert.
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'mysql://user:password@localhost:3306/kunsthandwerk',
  { dialect: 'mariadb' }
);

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
  price_per_gram: { type: DataTypes.DECIMAL(10,4), allowNull: false }
});

// Mold – Gießform mit Füllmenge und (optional) Bild
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

// WorkPieceMaterial – Zwischentabelle, um die verwendeten Materialien inkl. Mengen zu speichern
const WorkPieceMaterial = sequelize.define('WorkPieceMaterial', {
  quantity: { type: DataTypes.FLOAT, allowNull: false }
});

// WorkPieceMold – Zwischentabelle, um die verwendeten Gießformen zu speichern
// Hier fügen wir ein quantity-Feld hinzu, damit dieselbe Gießform mehrfach (mit einer Menge) erfasst werden kann.
const WorkPieceMold = sequelize.define('WorkPieceMold', {
  quantity: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 1 }
});

// Assoziationen
WorkPiece.belongsToMany(Material, { through: WorkPieceMaterial });
Material.belongsToMany(WorkPiece, { through: WorkPieceMaterial });

WorkPiece.belongsToMany(Mold, { through: WorkPieceMold });
Mold.belongsToMany(WorkPiece, { through: WorkPieceMold });

// CastingPowder wird in WorkPieceMold als Zusatzinformation gespeichert
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
