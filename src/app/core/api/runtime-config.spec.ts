import { applyRuntimeConfig, getRuntimeConfig, resetRuntimeConfig } from './runtime-config';

describe('runtime-config', () => {
  afterEach(() => {
    resetRuntimeConfig({ apiBaseUrl: '/api/public', assetBaseUrl: '' });
  });

  it('en production fuerza HTTPS en URLs absolutas', () => {
    applyRuntimeConfig(
      {
        apiBaseUrl: 'http://api.example.com/api/public',
        assetBaseUrl: 'http://api.example.com',
      },
      { production: true },
    );
    expect(getRuntimeConfig().apiBaseUrl).toBe('https://api.example.com/api/public');
    expect(getRuntimeConfig().assetBaseUrl).toBe('https://api.example.com');
  });

  it('deriva assetBaseUrl del origin de apiBaseUrl si falta', () => {
    applyRuntimeConfig(
      { apiBaseUrl: 'https://api.example.com/api/public', assetBaseUrl: '' },
      { production: true },
    );
    expect(getRuntimeConfig().assetBaseUrl).toBe('https://api.example.com');
  });
});
