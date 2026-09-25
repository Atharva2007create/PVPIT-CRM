import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { env } from '../config/env.js';
import { authService } from '../services/auth.service.js';
import { bootstrapAdminConfigSchema } from '../validators/auth.validator.js';

const parsed = bootstrapAdminConfigSchema.safeParse({
  name: env.INITIAL_ADMIN_NAME,
  email: env.INITIAL_ADMIN_EMAIL,
  password: env.INITIAL_ADMIN_PASSWORD
});

if (!parsed.success) {
  console.error('Administrator bootstrap configuration is missing or invalid. Check INITIAL_ADMIN_* values.');
  process.exitCode = 1;
} else {
  try {
    await connectDatabase();
    const result = await authService.bootstrapAdministrator(parsed.data);
    console.log(result.created ? 'Administrator account created.' : 'Administrator account already exists.');
  } catch (error) {
    console.error(`Administrator bootstrap failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}
