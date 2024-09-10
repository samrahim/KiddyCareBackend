module.exports = (sequelize, DataTypes) => {
const Message = sequelize.define("Message", {
    
    message_body: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sender: {
        type: DataTypes.ENUM('Famille', 'Sitter'),
        allowNull: false
    },
    chatroom_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Chatrooms',
            key: 'chatroom_id'
        }
    }
});

return Message;
}