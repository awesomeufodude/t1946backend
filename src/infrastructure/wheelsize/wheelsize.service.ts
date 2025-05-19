import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { mockBrands, mockMeasures, mockModels, mockVersions, mockYears } from './mockResponse';
import { HTTP_CODE } from 'src/shared/utils/http-codes';

@Injectable()
export class WheelSizeService {
  private readonly apiUrl: string;
  private readonly mode: boolean;
  private apiToken: string | null = null;
  private readonly logger = new Logger(WheelSizeService.name);
  private readonly emailApi: string;
  private readonly passwordApi: string;
  private readonly systemApi: string;
  private readonly urlDomain: string;
  private readonly apiKey: string;

  constructor() {
    this.apiUrl = process.env.URL_API_WHEELSIZE || '';
    this.mode = process.env.DEV_WHEELSIZE_EQUIFAX === 'TRUE';
    this.emailApi = process.env.EMAIL_API_WHEELSIZE || '';
    this.passwordApi = process.env.PASSWORD_API_WHEELSIZE || '';
    this.systemApi = process.env.SISTEMA_API_WHEELSIZE || '';
    this.urlDomain = process.env.URL_DOMAIN || '';
    this.apiKey = process.env.API_KEY_WHEELSIZE || '';
  }

  private async fetchFromApi(endpoint: string, params: Record<string, string>): Promise<any> {
    this.logger.log('token antiguo', this.apiToken);
    if (!this.apiToken) {
      await this.getToken();
    }
    this.logger.log('token nuevo', this.apiToken);

    const url = new URL(`${this.apiUrl}${endpoint}`);
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

    this.logger.log(`Fetching data from ${url}`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiToken}`,
        origin: this.urlDomain,
      },
    });

    if (response.status === HTTP_CODE.UNAUTHORIZED) {
      await this.getToken();
      return this.fetchFromApi(endpoint, params);
    }

    if (response.status !== HTTP_CODE.OK) {
      throw new InternalServerErrorException(`Error fetching data from ${url}: ${response.statusText}`);
    }

    return response.json();
  }

  private async getToken(retries = 3, attempt = 1): Promise<void> {
    const response = await fetch(`${this.apiUrl}/crear/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: this.emailApi,
        password: this.passwordApi,
        sistema: this.systemApi,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      this.apiToken = data.token;
    } else {
      this.logger.log(`Token request failed (attempt ${attempt}/${retries}): ${response.statusText}`);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.getToken(retries, attempt + 1);
      } else {
        throw new InternalServerErrorException('Failed to obtain a valid token after multiple attempts');
      }
    }
  }

  private async fetchFromApiWithKey(endpoint: string, params: Record<string, string>): Promise<any> {
    const url = new URL(`${this.apiUrl}${endpoint}`);
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

    this.logger.log(`Fetching data from ${url}`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiToken}`,
        origin: this.urlDomain,
        'api-key': this.apiKey,
      },
    });

    if (response.status !== HTTP_CODE.OK) {
      throw new InternalServerErrorException(`Error fetching data from ${url}: ${response.statusText}`);
    }

    return response.json();
  }

  async getBrands(): Promise<any> {
    return this.mode ? mockBrands.data : (await this.fetchFromApiWithKey('/brands/', {}))?.data;
  }

  async getModels(brand: string, year: string): Promise<any> {
    return this.mode ? mockModels.data : (await this.fetchFromApiWithKey('/models/' + brand + '/' + year, {}))?.data;
  }

  async getYears(brand: string): Promise<any> {
    return this.mode ? mockYears.data : (await this.fetchFromApiWithKey('/years/' + brand, {}))?.data;
  }

  async getVersions(brand: string, model: string, year: string): Promise<any> {
    return this.mode
      ? mockVersions.data
      : (await this.fetchFromApiWithKey('/versions/' + brand + '/' + year + '/' + model, {}))?.data;
  }

  async getMeasures(brand: string, model: string, year: string, version: string): Promise<any> {
    return this.mode
      ? mockMeasures.data
      : (await this.fetchFromApiWithKey('/car/' + brand + '/' + year + '/' + model + '/' + version, {}))?.data;
  }
}
