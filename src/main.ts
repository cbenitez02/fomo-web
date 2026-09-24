import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { applyRuntimeConfig, loadRuntimeConfig } from './app/core/api/runtime-config';
import { environment } from './environments/environment';

applyRuntimeConfig(
  {
    apiBaseUrl: environment.apiBaseUrl,
    assetBaseUrl: environment.assetBaseUrl,
  },
  { production: environment.production },
);

loadRuntimeConfig(environment.production)
  .then(() => bootstrapApplication(App, appConfig))
  .catch((err) => console.error(err));
