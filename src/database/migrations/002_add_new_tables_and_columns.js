module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to Candidates table
    await queryInterface.addColumn('candidates', 'enrolledFaceImage', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'S3 URL of enrolled face image'
    });
    
    await queryInterface.addColumn('candidates', 'faceId', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'AWS Rekognition face ID'
    });
    
    await queryInterface.addColumn('candidates', 'omrBarcode', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'OMR barcode linked to candidate'
    });
    
    await queryInterface.changeColumn('candidates', 'status', {
      type: Sequelize.ENUM('registered', 'attendance_completed', 'biometric_completed', 'completed'),
      defaultValue: 'registered'
    });
    
    // Add new columns to Attendance table
    await queryInterface.addColumn('attendances', 'checkpoint', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Attendance checkpoint for biometric enforcement'
    });
    
    await queryInterface.addColumn('attendances', 'biometricEligible', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Flag to indicate if biometric verification is allowed'
    });
    
    await queryInterface.changeColumn('attendances', 'status', {
      type: Sequelize.ENUM('pending', 'completed', 'skipped'),
      defaultValue: 'pending'
    });
    
    // Add new columns to Biometrics table
    await queryInterface.addColumn('biometrics', 'verificationType', {
      type: Sequelize.ENUM('face', 'fingerprint', 'both'),
      defaultValue: 'face'
    });
    
    await queryInterface.addColumn('biometrics', 'faceMatchPercentage', {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: 'Actual face match score from AWS Rekognition'
    });
    
    await queryInterface.addColumn('biometrics', 'matchThreshold', {
      type: Sequelize.FLOAT,
      defaultValue: 96.5,
      comment: 'Required threshold for face verification'
    });
    
    await queryInterface.addColumn('biometrics', 'isVerified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    
    await queryInterface.addColumn('biometrics', 'faceImageUrl', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'S3 URL of captured face image'
    });
    
    await queryInterface.addColumn('biometrics', 'enrolledFaceImage', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'S3 URL of enrolled face image'
    });
    
    await queryInterface.addColumn('biometrics', 'faceId', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'AWS Rekognition face ID'
    });
    
    await queryInterface.addColumn('biometrics', 'verificationTimestamp', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('biometrics', 'metadata', {
      type: Sequelize.JSONB,
      defaultValue: {},
      comment: 'Additional verification metadata'
    });
    
    // Create download_passwords table
    await queryInterface.createTable('download_passwords', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      examId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      passwordHash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      isUsed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      usedBy: {
        type: Sequelize.UUID,
        allowNull: true
      },
      usedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
    
    // Create indexes for download_passwords
    await queryInterface.addIndex('download_passwords', ['examId', 'isUsed'], {
      name: 'idx_download_passwords_exam_used'
    });
    
    await queryInterface.addIndex('download_passwords', ['expiresAt'], {
      name: 'idx_download_passwords_expires'
    });
    
    // Create slots table
    await queryInterface.createTable('slots', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      examId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      centreId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      slotName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      startTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endTime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      maxCandidates: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      currentCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'active', 'completed'),
        defaultValue: 'scheduled'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
    
    // Create indexes for slots
    await queryInterface.addIndex('slots', ['examId'], {
      name: 'idx_slots_exam'
    });
    
    await queryInterface.addIndex('slots', ['centreId'], {
      name: 'idx_slots_centre'
    });
    
    await queryInterface.addIndex('slots', ['status'], {
      name: 'idx_slots_status'
    });
    
    // Create operator_slots table
    await queryInterface.createTable('operator_slots', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      operatorId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      slotId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      assignedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      assignedBy: {
        type: Sequelize.UUID,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
    
    // Create indexes for operator_slots
    await queryInterface.addIndex('operator_slots', ['operatorId'], {
      name: 'idx_operator_slots_operator'
    });
    
    await queryInterface.addIndex('operator_slots', ['slotId'], {
      name: 'idx_operator_slots_slot'
    });
    
    await queryInterface.addIndex('operator_slots', ['operatorId', 'slotId'], {
      unique: true,
      name: 'unique_operator_slot_assignment'
    });
    
    // Create fingerprints table
    await queryInterface.createTable('fingerprints', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      candidateId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      examId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      operatorId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      fingerprintImage: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'S3 URL of the fingerprint image'
      },
      captureTimestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      captureDeviceId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      imageQuality: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      storageLocation: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'S3 path/key'
      },
      encrypted: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
    
    // Create indexes for fingerprints
    await queryInterface.addIndex('fingerprints', ['candidateId'], {
      name: 'idx_fingerprints_candidate'
    });
    
    await queryInterface.addIndex('fingerprints', ['examId'], {
      name: 'idx_fingerprints_exam'
    });
    
    await queryInterface.addIndex('fingerprints', ['operatorId'], {
      name: 'idx_fingerprints_operator'
    });
    
    await queryInterface.addIndex('fingerprints', ['candidateId', 'examId'], {
      unique: true,
      name: 'unique_fingerprint_per_candidate_exam'
    });
    
    // Create sync_statuses table
    await queryInterface.createTable('sync_statuses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      operatorId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      examId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      entityType: {
        type: Sequelize.ENUM('attendance', 'biometric', 'fingerprint'),
        allowNull: false
      },
      entityId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      syncStatus: {
        type: Sequelize.ENUM('pending', 'synced', 'conflict', 'failed'),
        defaultValue: 'pending'
      },
      syncTimestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      conflictDetected: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      conflictReason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      resolved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      resolvedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      resolvedBy: {
        type: Sequelize.UUID,
        allowNull: true
      },
      resolution: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
    
    // Create indexes for sync_statuses
    await queryInterface.addIndex('sync_statuses', ['operatorId'], {
      name: 'idx_sync_status_operator'
    });
    
    await queryInterface.addIndex('sync_statuses', ['examId'], {
      name: 'idx_sync_status_exam'
    });
    
    await queryInterface.addIndex('sync_statuses', ['syncStatus'], {
      name: 'idx_sync_status_status'
    });
    
    await queryInterface.addIndex('sync_statuses', ['conflictDetected'], {
      name: 'idx_sync_status_conflict'
    });
    
    await queryInterface.addIndex('sync_statuses', ['entityType', 'entityId'], {
      unique: true,
      name: 'unique_sync_entity'
    });
    
    // Add unique constraints
    await queryInterface.addConstraint('attendances', {
      fields: ['candidateId', 'examId'],
      type: 'unique',
      name: 'unique_attendance_per_candidate_exam'
    });
    
    await queryInterface.addConstraint('biometrics', {
      fields: ['candidateId', 'examId'],
      type: 'unique',
      name: 'unique_biometric_per_candidate_exam'
    });
    
    await queryInterface.addConstraint('candidates', {
      fields: ['rollNo', 'examId'],
      type: 'unique',
      name: 'unique_candidate_roll_exam'
    });
  },
  
  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('sync_statuses');
    await queryInterface.dropTable('fingerprints');
    await queryInterface.dropTable('operator_slots');
    await queryInterface.dropTable('slots');
    await queryInterface.dropTable('download_passwords');
    
    // Remove added columns
    await queryInterface.removeColumn('biometrics', 'metadata');
    await queryInterface.removeColumn('biometrics', 'verificationTimestamp');
    await queryInterface.removeColumn('biometrics', 'faceId');
    await queryInterface.removeColumn('biometrics', 'enrolledFaceImage');
    await queryInterface.removeColumn('biometrics', 'faceImageUrl');
    await queryInterface.removeColumn('biometrics', 'isVerified');
    await queryInterface.removeColumn('biometrics', 'matchThreshold');
    await queryInterface.removeColumn('biometrics', 'faceMatchPercentage');
    await queryInterface.removeColumn('biometrics', 'verificationType');
    
    await queryInterface.removeColumn('attendances', 'biometricEligible');
    await queryInterface.removeColumn('attendances', 'checkpoint');
    
    await queryInterface.changeColumn('candidates', 'status', {
      type: Sequelize.ENUM('pending', 'verified', 'not_verified'),
      defaultValue: 'pending'
    });
    
    await queryInterface.removeColumn('candidates', 'omrBarcode');
    await queryInterface.removeColumn('candidates', 'faceId');
    await queryInterface.removeColumn('candidates', 'enrolledFaceImage');
  }
};