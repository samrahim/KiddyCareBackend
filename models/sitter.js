module.exports = (sequelize, DataTypes) => {
    const Sitter = sequelize.define("Sitter", {
        sitterId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
        sitterName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        sitterPhone: {
            type: DataTypes.STRING,
            unique: true,
        },
        sitterPassword: {
            type: DataTypes.STRING
        },
        sitterExperiance:{
          type:DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'),
          defaultValue:'Beginner'
        },
        sitterFcmToken:{
            type: DataTypes.STRING
        },
        sitterEmail: {
            type: DataTypes.STRING,
            allowNull:true
        },
        sitterImagePath:{
            type:DataTypes.STRING,
            default:""
 },
         sitterLatitude: {
           type: DataTypes.DOUBLE,         
           },
         sitterLongitude: {
           type: DataTypes.DOUBLE,
         },
         sitterAdress:{
            type:DataTypes.STRING,
            default:"",
        },
        sitterStatus:{
            type: DataTypes.BOOLEAN, 
            defaultValue: true
        },
        sitterBio:{
            type:DataTypes.STRING,
            default:"",
        }
});
    Sitter.associate = (models) => {
        Sitter.hasMany(models.Rating, { foreignKey: 'sitter_id' });
    };
    Sitter.prototype.calculateAverageRating = async function() {
        try {
            const ratings = await this.getRatings();
            console.log(ratings)
            if (ratings.length === 0) {
                return 0;
            }
            const totalRating = ratings.reduce((acc, rating) => acc + rating.rating, 0);
            const averageRating = totalRating / ratings.length;
            return averageRating;
        } catch (error) {
            console.error("Error calculating average rating:", error);
            throw error; 
        }
    };
    
    return Sitter;
};
