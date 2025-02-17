// models.js
const { Sequelize, DataTypes } = require('sequelize');

// Verbindung: Nutzt die Umgebungsvariable DATABASE_URL, falls vorhanden, ansonsten den Standardwert.
const sequelize = new Sequelize(process.env.DATABASE_URL || 'mysql://root:mTKyNduzzxzUNCfqwhfqnUioAUlzNnXv@viaduct.proxy.rlwy.net:43038/railway', {
  dialect: 'mariadb'
});

// Material – speichert Name, Bezugsquelle, Preis, Preis pro Einheit und optional ein Bild
const Material = sequelize.define('Material', {
  name: { type: DataTypes.STRING, allowNull: false },
  source: { type: DataTypes.STRING },
  price: { type: DataTypes.FLOAT, allowNull: false },
  unit_price: { type: DataTypes.FLOAT, allowNull: false },
  image: { type: DataTypes.BLOB('long'), allowNull: true }
});

// CastingPowder – Gießpulver mit Mischverhältnis (Wasser:Pulver) und Preis pro Gramm (als DECIMAL für höhere Genauigkeit)
const CastingPowder = sequelize.define('CastingPowder', {
  name: { type: DataTypes.STRING, allowNull: false },
  water_ratio: { type: DataTypes.FLOAT, allowNull: false },
  powder_ratio: { type: DataTypes.FLOAT, allowNull: false },
  price_per_gram: { type: DataTypes.DECIMAL(10,4), allowNull: false }
});

// Mold – Gießform mit Füllmenge und optional einem Bild
const Mold = sequelize.define('Mold', {
  name: { type: DataTypes.STRING, allowNull: false },
  fill_volume: { type: DataTypes.FLOAT, allowNull: false },
  image: { type: DataTypes.BLOB('long'), allowNull: true }
});

// WorkPiece – fertige Werkstücke mit optionalem Bild
const WorkPiece = sequelize.define('WorkPiece', {
  name: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.BLOB('long'), allowNull: true }
});

// WorkPieceMaterial – Zwischentabelle, um die verwendeten Materialien und deren Mengen in einem Werkstück zu speichern
const WorkPieceMaterial = sequelize.define('WorkPieceMaterial', {
  quantity: { type: DataTypes.FLOAT, allowNull: false }
});

// WorkPieceMold – Zwischentabelle, um die verwendeten Gießformen in einem Werkstück zu speichern
const WorkPieceMold = sequelize.define('WorkPieceMold', {});

// Assoziationen
WorkPiece.belongsToMany(Material, { through: WorkPieceMaterial });
Material.belongsToMany(WorkPiece, { through: WorkPieceMaterial });

WorkPiece.belongsToMany(Mold, { through: WorkPieceMold });
Mold.belongsToMany(WorkPiece, { through: WorkPieceMold });

// CastingPowder wird als Zusatzinformation in der WorkPieceMold-Tabelle gespeichert
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
