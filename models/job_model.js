module.exports = (sequelize, DataTypes) => {
    const Job = sequelize.define("Job", {
     parent_Id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Familles',
            key: 'familleId'
        }
     },
     descreption:{
        type:DataTypes.STRING,
        allowNull:true
     },
     children:{
        type:DataTypes.INTEGER,
        allowNull:false
     },
     date:{
        type:DataTypes.DATE
     },
     startTime:{
        type:DataTypes.STRING
     },
     endTime:{
        type:DataTypes.STRING,
     },
     minPriceForHoure:{
        type:DataTypes.FLOAT,
        allowNull:true,
        default:0.0
     },
     maxPriceForHoure:{
        type:DataTypes.FLOAT,
        allowNull:true,
        default:0.0
     },
     sitter_Id:{
        type :DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Sitters',
            key: 'sitterId'
        }
     }
    },
);

Job.associate = (models) => {
   Job.belongsTo(models.Famille, { foreignKey: 'parent_id' });
};
return Job;

}
       