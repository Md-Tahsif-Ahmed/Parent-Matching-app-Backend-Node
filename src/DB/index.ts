import colors from 'colors';
import { User } from '../app/modules/user/user.model';
import config from '../config';
import { USER_ROLES } from '../enums/user';
import { logger } from '../shared/logger';

const seedSuperAdmin = async () => {
  try {
    if (!config.admin?.email || !config.admin?.password) {
      throw new Error('Missing SUPER_ADMIN creds: ADMIN_EMAIL / ADMIN_PASSWORD');
    }

    const superUser = {
      firstName: 'Super',
      lastName: 'Admin',
      dob: new Date('1990-01-01'),
      role: USER_ROLES.SUPER_ADMIN,
      email: config.admin.email,
      password: config.admin.password,
      verified: true,
    };

    const exists = await User.findOne({
      $or: [
        { role: USER_ROLES.SUPER_ADMIN },
        { email: superUser.email }
      ],
    });

    if (exists) {
      logger.info(colors.yellow('Super admin already exists, skipping seed.'));
      return;
    }

    await User.create(superUser);
    logger.info(colors.green('Super admin created successfully!'));
  } catch (err) {
    logger.error(colors.red('Failed to seed super admin'), err);
    throw err;
  }
};

export default seedSuperAdmin;
