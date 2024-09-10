module.exports = (sequelize, DataTypes) => {
    const Chatroom = sequelize.define("Chatroom", {
        chatroom_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: false
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
        }
    });
    Chatroom.associate = (models) => {
        Chatroom.belongsTo(models.Famille, { foreignKey: 'famille_id' });
        Chatroom.belongsTo(models.Sitter, { foreignKey: 'sitter_id' });
    };

    return Chatroom;
};