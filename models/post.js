const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      content: {
        type: Sequelize.STRING(140),
        allowNull: false,
      },
      img: {
        // 이미지는 하나만 올릴 수 있다. 
        type: Sequelize.STRING(200),
        allowNull: true,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Post',
      tableName: 'posts',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
      // paranoid: false이기 때문에 만약에 게시물이 삭제되면 진짜로 삭제됨
    });
  }

  static associate(db) {
    db.Post.belongsTo(db.User);
    // 게시글과 해시태그는 다대다 관계, 따라서 PostHashtag라는 중간 테이블 생성
    db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
    db.Post.belongsToMany(db.User, { through: 'Likes', as: 'Liker' });
  }
};
