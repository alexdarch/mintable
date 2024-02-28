import { IntegrationId } from './integrations'
import { Rule } from './rule'

export interface BalanceConfig {
    integration: IntegrationId
    properties?: string[]
    rules?: Rule[]
}
