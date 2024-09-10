module.exports = (sequelize, DataTypes) => {
    const Famille = sequelize.define("Famille", {
       
        familleId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
        familleName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        familleImagePath:{
         type:DataTypes.STRING,
         default:""
        },
        famillePhone: {
            type: DataTypes.STRING,
            allowNull:true,
            unique:true
        },
        famillePassword: {
            type: DataTypes.STRING
        },
        familleFcmToken:{
            type: DataTypes.STRING,
        },
        familleEmail: {
            type: DataTypes.STRING,
            allowNull:true,
            unique:true
        },
        familleAdress:{
            type:DataTypes.STRING,
            default:"",
        },
        familleLatitude: {
            type: DataTypes.DOUBLE,
          },
          familleLongitude: {
            type: DataTypes.DOUBLE,
          },
    });

    return Famille;
};
