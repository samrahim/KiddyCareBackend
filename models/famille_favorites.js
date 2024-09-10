module.exports = (sequelize, DataTypes) => {
    const Favorite = sequelize.define("Favorite", {
    });
    Favorite.associate = (models) => {
        Favorite.belongsTo(models.Famille, { foreignKey: 'familleId' });
        Favorite.belongsTo(models.Sitter, { foreignKey: 'sitterId' });
    };

    return Favorite;
}