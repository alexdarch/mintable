import { BaseIntegrationConfig, IntegrationId, IntegrationType } from '../integrations'

export interface GoogleTemplateSheetSettings {
  documentId: string
  sheetTitle: string
}

// export interface GoogleOAuth2ClientCredentials {
//   clientId: string
//   clientSecret: string
//   redirectUri: string
  
//   accessToken?: string
//   refreshToken?: string
//   scope?: string[]
//   tokenType?: string
//   expiryDate?: number
// }

export interface GoogleServiceAccountCredentials {
  type: string,
  project_id: string,
  private_key_id: string,
  private_key: string,
  client_email: string,
  client_id: string,
  auth_uri: string,
  token_uri: string,
  auth_provider_x509_cert_url: string,
  client_x509_cert_url: string,
  universe_domain: string
}

export interface GoogleConfig extends BaseIntegrationConfig {
  id: IntegrationId.Google
  type: IntegrationType.Export

  credentials: GoogleServiceAccountCredentials
  documentId: string
  
  dateFormat?: string

  template?: GoogleTemplateSheetSettings
}

export const defaultGoogleConfig: GoogleConfig = {
  name: '',
  id: IntegrationId.Google,
  type: IntegrationType.Export,

  credentials: {
    type: '',
    project_id: '',
    private_key_id: '',
    private_key: '',
    client_email: '',
    client_id: '',
    auth_uri: '',
    token_uri: '',
    auth_provider_x509_cert_url: '',
    client_x509_cert_url: '',
    universe_domain: ''
  },
  documentId: ''
}
