'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('exams', 'dashboardUsername', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
    
    await queryInterface.addColumn('exams', 'dashboardPassword', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
    
    await queryInterface.addColumn('exams', 'dashboardLink', {
      type: Sequelize.STRING(500),
      allowNull: true
    });
    
    await queryInterface.addColumn('exams', 'dashboardCreated', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    
    await queryInterface.addColumn('exams', 'mockActive', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('exams', 'dashboardUsername');
    await queryInterface.removeColumn('exams', 'dashboardPassword');
    await queryInterface.removeColumn('exams', 'dashboardLink');
    await queryInterface.removeColumn('exams', 'dashboardCreated');
    await queryInterface.removeColumn('exams', 'mockActive');
  }
};