module.exports = (sequelize, DataTypes) => {
    const Rating = sequelize.define("Rating", {
        Rating_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        famille_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Familles',
                key: 'familleId'
            }
        },
        sitter_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Sitters',
                key: 'sitterId'
            }
        },
        rating: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        ratingComment:{
            type:DataTypes.STRING,
            allowNull:true
        }
    });
    Rating.associate = (models) => {
        Rating.belongsTo(models.Famille, { foreignKey: 'famille_id' });
    };
    return Rating;
};