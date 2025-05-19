import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { appConstants } from 'src/config/app.constants';

export default class HashingUtils {
  private static readonly saltRound = appConstants.HASHING_SALT_ROUNDS;
  private static readonly salt = appConstants.HASHING_SALT;

  public static async secureHash(text: string): Promise<string> {
    const hashedText = await bcrypt.hash(text, this.saltRound);
    return hashedText;
  }

  public static async secureCompare(text: string, hashedText: string): Promise<boolean> {
    const matched = await bcrypt.compare(text, hashedText);
    return matched;
  }

  public static async hash(text: string): Promise<string> {
    const saltedData = text + this.salt;
    return crypto.createHash('sha256').update(saltedData).digest('hex');
  }
}
