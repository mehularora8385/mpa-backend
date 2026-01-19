'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('candidates', 'shift', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Shift/slot timing (Morning, Evening, etc.)'
    });
    
    await queryInterface.addColumn('candidates', 'candidateId', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Unique candidate identifier'
    });
    
    await queryInterface.addColumn('candidates', 'uploadedPhotoUrl', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'URL of uploaded photo from Excel'
    });
    
    await queryInterface.addColumn('candidates', 'biometricCaptured', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Whether biometric data has been captured'
    });
    
    await queryInterface.addColumn('candidates', 'syncStatus', {
      type: Sequelize.ENUM('Pending', 'Syncing', 'Synced', 'Failed'),
      defaultValue: 'Pending',
      comment: 'Sync status with central server'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('candidates', 'shift');
    await queryInterface.removeColumn('candidates', 'candidateId');
    await queryInterface.removeColumn('candidates', 'uploadedPhotoUrl');
    await queryInterface.removeColumn('candidates', 'biometricCaptured');
    await queryInterface.removeColumn('candidates', 'syncStatus');
  }
};